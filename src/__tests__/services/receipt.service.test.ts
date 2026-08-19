import { ReceiptService } from '../../services/receipt.service';
import { ReceiptRepository } from '../../repositories/receipt.repository';
import { WarehouseRepository } from '../../repositories/warehouse.repository';
import { NotFoundError, BusinessError } from '../../utils/errors';

jest.mock('../../repositories/receipt.repository');
jest.mock('../../repositories/warehouse.repository');
jest.mock('../../utils/receipt-number', () => ({
  generateReceiptNumber: jest.fn().mockResolvedValue('NK-20260818-001'),
}));

describe('ReceiptService', () => {
  let service: ReceiptService;
  let mockReceiptRepo: jest.Mocked<ReceiptRepository>;
  let mockWarehouseRepo: jest.Mocked<WarehouseRepository>;

  const validDTO = {
    receipt_date: '2026-08-18',
    deliverer_name: 'Nguyễn Văn A',
    warehouse_id: 1,
    details: [
      {
        product_name: 'Thép tấm SS400',
        unit: 'Tấm',
        quantity_document: 100,
        quantity_actual: 98,
        unit_price: 350000,
      },
    ],
  };

  const mockFullReceipt = {
    id: 1,
    receipt_number: 'NK-20260818-001',
    receipt_date: new Date('2026-08-18'),
    company_name: 'VIMES',
    department: 'Kế hoạch',
    debit_account: '152',
    credit_account: '331',
    deliverer_name: 'Nguyễn Văn A',
    ref_document: null,
    warehouse_id: 1,
    total_amount: 34300000,
    total_amount_text: 'Ba mươi tư triệu ba trăm nghìn đồng',
    attached_documents: 0,
    creator_name: null,
    deliverer_signer: null,
    storekeeper_name: null,
    accountant_name: null,
    status: 'draft' as const,
    created_at: new Date(),
    updated_at: new Date(),
    details: [
      {
        id: 1,
        receipt_id: 1,
        line_number: 1,
        product_id: 1,
        product_name: 'Thép tấm SS400',
        product_code: 'NVL-001',
        unit: 'Tấm',
        quantity_document: 100,
        quantity_actual: 98,
        unit_price: 350000,
        total_price: 34300000,
        created_at: new Date(),
      },
    ],
  };

  beforeEach(() => {
    mockReceiptRepo = new ReceiptRepository() as jest.Mocked<ReceiptRepository>;
    mockWarehouseRepo = new WarehouseRepository() as jest.Mocked<WarehouseRepository>;
    service = new ReceiptService(mockReceiptRepo, mockWarehouseRepo);
  });

  describe('createReceipt', () => {
    test('Kho tồn tại -> tạo phiếu thành công và tính tổng tiền + chữ', async () => {
      mockWarehouseRepo.exists.mockResolvedValue(true);
      mockReceiptRepo.create.mockResolvedValue(mockFullReceipt);

      const result = await service.createReceipt(validDTO);

      expect(mockWarehouseRepo.exists).toHaveBeenCalledWith(1);
      expect(mockReceiptRepo.create).toHaveBeenCalledWith(
        'NK-20260818-001',
        validDTO,
        expect.stringContaining('đồng')
      );
      expect(result.receipt_number).toBe('NK-20260818-001');
    });

    test('Kho không tồn tại -> throw NotFoundError', async () => {
      mockWarehouseRepo.exists.mockResolvedValue(false);
      await expect(service.createReceipt(validDTO)).rejects.toThrow(NotFoundError);
    });
  });

  describe('getReceiptById', () => {
    test('Phiếu tồn tại -> trả về phiếu đầy đủ', async () => {
      mockReceiptRepo.findById.mockResolvedValue(mockFullReceipt);
      const result = await service.getReceiptById(1);
      expect(result.id).toBe(1);
    });

    test('Phiếu không tồn tại -> throw NotFoundError', async () => {
      mockReceiptRepo.findById.mockResolvedValue(null);
      await expect(service.getReceiptById(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe('updateReceipt', () => {
    test('Phiếu draft -> update thành công', async () => {
      mockReceiptRepo.findById.mockResolvedValue(mockFullReceipt);
      mockReceiptRepo.update.mockResolvedValue(mockFullReceipt);

      const result = await service.updateReceipt(1, { deliverer_name: 'Trần B' });
      expect(result).toBeDefined();
    });

    test('Phiếu confirmed -> throw BusinessError', async () => {
      mockReceiptRepo.findById.mockResolvedValue({
        ...mockFullReceipt,
        status: 'confirmed',
      });
      await expect(service.updateReceipt(1, { deliverer_name: 'Trần B' })).rejects.toThrow(
        BusinessError
      );
    });

    test('Phiếu cancelled -> throw BusinessError', async () => {
      mockReceiptRepo.findById.mockResolvedValue({
        ...mockFullReceipt,
        status: 'cancelled',
      });
      await expect(service.updateReceipt(1, { deliverer_name: 'Trần B' })).rejects.toThrow(
        BusinessError
      );
    });
  });

  describe('deleteReceipt', () => {
    test('Phiếu draft -> xóa thành công', async () => {
      mockReceiptRepo.findById.mockResolvedValue(mockFullReceipt);
      mockReceiptRepo.delete.mockResolvedValue(true);

      await expect(service.deleteReceipt(1)).resolves.toBeUndefined();
      expect(mockReceiptRepo.delete).toHaveBeenCalledWith(1);
    });

    test('Phiếu confirmed -> throw BusinessError khi xóa', async () => {
      mockReceiptRepo.findById.mockResolvedValue({
        ...mockFullReceipt,
        status: 'confirmed',
      });
      await expect(service.deleteReceipt(1)).rejects.toThrow(BusinessError);
    });
  });

  describe('confirmReceipt & cancelReceipt', () => {
    test('confirm draft -> confirmed', async () => {
      mockReceiptRepo.findById.mockResolvedValue(mockFullReceipt);
      mockReceiptRepo.updateStatus.mockResolvedValue({
        ...mockFullReceipt,
        status: 'confirmed',
      });

      const result = await service.confirmReceipt(1);
      expect(result.status).toBe('confirmed');
    });

    test('cancel draft -> cancelled', async () => {
      mockReceiptRepo.findById.mockResolvedValue(mockFullReceipt);
      mockReceiptRepo.updateStatus.mockResolvedValue({
        ...mockFullReceipt,
        status: 'cancelled',
      });

      const result = await service.cancelReceipt(1);
      expect(result.status).toBe('cancelled');
    });
  });
});
