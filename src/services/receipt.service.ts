import { ReceiptRepository } from '../repositories/receipt.repository';
import { WarehouseRepository } from '../repositories/warehouse.repository';
import {
  CreateReceiptDTO,
  UpdateReceiptDTO,
  ReceiptFilter,
  FullReceipt,
  PaginatedResponse,
  WarehouseReceipt,
  RECEIPT_STATUS,
} from '../models/types';
import { generateReceiptNumber } from '../utils/receipt-number';
import { numberToVietnameseWords } from '../utils/number-to-words';
import { NotFoundError, BusinessError } from '../utils/errors';

export class ReceiptService {
  private receiptRepo: ReceiptRepository;
  private warehouseRepo: WarehouseRepository;

  constructor(receiptRepo?: ReceiptRepository, warehouseRepo?: WarehouseRepository) {
    this.receiptRepo = receiptRepo || new ReceiptRepository();
    this.warehouseRepo = warehouseRepo || new WarehouseRepository();
  }

  async createReceipt(dto: CreateReceiptDTO): Promise<FullReceipt> {
    const warehouseExists = await this.warehouseRepo.exists(dto.warehouse_id);
    if (!warehouseExists) {
      throw new NotFoundError('Kho hàng', dto.warehouse_id);
    }

    const receiptNumber = await generateReceiptNumber(dto.receipt_date);
    const totalAmount = dto.details.reduce(
      (sum, d) => sum + d.quantity_actual * d.unit_price,
      0
    );
    const totalAmountText = numberToVietnameseWords(totalAmount);

    return this.receiptRepo.create(receiptNumber, dto, totalAmountText);
  }

  async getReceipts(filter: ReceiptFilter): Promise<PaginatedResponse<WarehouseReceipt>> {
    return this.receiptRepo.findAll(filter);
  }

  async getReceiptById(id: number): Promise<FullReceipt> {
    const receipt = await this.receiptRepo.findById(id);
    if (!receipt) {
      throw new NotFoundError('Phiếu nhập kho', id);
    }
    return receipt;
  }

  async updateReceipt(id: number, dto: UpdateReceiptDTO): Promise<FullReceipt> {
    const existing = await this.receiptRepo.findById(id);
    if (!existing) {
      throw new NotFoundError('Phiếu nhập kho', id);
    }

    if (existing.status === RECEIPT_STATUS.CONFIRMED) {
      throw new BusinessError('Không thể sửa phiếu đã được xác nhận');
    }
    if (existing.status === RECEIPT_STATUS.CANCELLED) {
      throw new BusinessError('Không thể sửa phiếu đã bị hủy');
    }

    if (dto.warehouse_id) {
      const warehouseExists = await this.warehouseRepo.exists(dto.warehouse_id);
      if (!warehouseExists) {
        throw new NotFoundError('Kho hàng', dto.warehouse_id);
      }
    }

    let totalAmountText: string | undefined;
    if (dto.details && dto.details.length > 0) {
      const totalAmount = dto.details.reduce(
        (sum, d) => sum + ((d.quantity_actual ?? 0) * (d.unit_price ?? 0)),
        0
      );
      totalAmountText = numberToVietnameseWords(totalAmount);
    }

    return this.receiptRepo.update(id, dto, totalAmountText);
  }

  async deleteReceipt(id: number): Promise<void> {
    const existing = await this.receiptRepo.findById(id);
    if (!existing) {
      throw new NotFoundError('Phiếu nhập kho', id);
    }

    if (existing.status !== RECEIPT_STATUS.DRAFT) {
      throw new BusinessError(
        `Không thể xóa phiếu có trạng thái "${existing.status}". Chỉ được xóa phiếu nháp`
      );
    }

    await this.receiptRepo.delete(id);
  }

  async confirmReceipt(id: number): Promise<WarehouseReceipt> {
    const existing = await this.receiptRepo.findById(id);
    if (!existing) {
      throw new NotFoundError('Phiếu nhập kho', id);
    }
    if (existing.status !== RECEIPT_STATUS.DRAFT) {
      throw new BusinessError('Chỉ có thể xác nhận phiếu nháp');
    }

    const updated = await this.receiptRepo.updateStatus(id, RECEIPT_STATUS.CONFIRMED);
    return updated!;
  }

  async cancelReceipt(id: number): Promise<WarehouseReceipt> {
    const existing = await this.receiptRepo.findById(id);
    if (!existing) {
      throw new NotFoundError('Phiếu nhập kho', id);
    }
    if (existing.status === RECEIPT_STATUS.CANCELLED) {
      throw new BusinessError('Phiếu đã ở trạng thái đã hủy');
    }

    const updated = await this.receiptRepo.updateStatus(id, RECEIPT_STATUS.CANCELLED);
    return updated!;
  }

  convertAmountToText(amount: number): string {
    return numberToVietnameseWords(amount);
  }
}
