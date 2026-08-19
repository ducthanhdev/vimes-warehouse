import { ReceiptRepository } from '../../repositories/receipt.repository';
import { WarehouseRepository } from '../../repositories/warehouse.repository';
import { ProductRepository } from '../../repositories/product.repository';

describe('Repositories Integration Tests', () => {
  const receiptRepo = new ReceiptRepository();
  const warehouseRepo = new WarehouseRepository();
  const productRepo = new ProductRepository();

  describe('WarehouseRepository', () => {
    test('findAll -> trả về danh sách kho', async () => {
      const warehouses = await warehouseRepo.findAll();
      expect(warehouses.length).toBeGreaterThan(0);
      expect(warehouses[0].code).toBeDefined();
    });

    test('findById -> trả về đúng kho', async () => {
      const warehouse = await warehouseRepo.findById(1);
      expect(warehouse).not.toBeNull();
      expect(warehouse?.id).toBe(1);
    });

    test('exists -> true cho kho có sẵn, false cho kho không có', async () => {
      expect(await warehouseRepo.exists(1)).toBe(true);
      expect(await warehouseRepo.exists(999999)).toBe(false);
    });
  });

  describe('ProductRepository', () => {
    test('findAll -> trả về danh sách sản phẩm', async () => {
      const products = await productRepo.findAll();
      expect(products.length).toBeGreaterThan(0);
    });

    test('findById -> trả về đúng sản phẩm', async () => {
      const product = await productRepo.findById(1);
      expect(product).not.toBeNull();
      expect(product?.id).toBe(1);
    });

    test('search -> tìm kiếm sản phẩm theo tên hoặc mã', async () => {
      const results = await productRepo.search('Thép', 5);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toContain('Thép');
    });
  });

  describe('ReceiptRepository', () => {
    test('create, findById, update, delete trong transaction', async () => {
      const created = await receiptRepo.create(
        'NK-TEST-001',
        {
          receipt_date: '2026-08-18',
          deliverer_name: 'Người Test',
          warehouse_id: 1,
          details: [
            {
              product_name: 'Vật tư test 1',
              unit: 'Cái',
              quantity_document: 10,
              quantity_actual: 10,
              unit_price: 50000,
            },
            {
              product_name: 'Vật tư test 2',
              unit: 'Hộp',
              quantity_document: 2,
              quantity_actual: 2,
              unit_price: 100000,
            },
          ],
        },
        'Bảy trăm nghìn đồng'
      );

      expect(created.id).toBeDefined();
      expect(Number(created.total_amount)).toBe(10 * 50000 + 2 * 100000);

      const found = await receiptRepo.findById(created.id);
      expect(found).not.toBeNull();
      expect(found?.details.length).toBe(2);
      expect(Number(found?.details[0].total_price)).toBe(500000);

      const confirmed = await receiptRepo.updateStatus(created.id, 'confirmed');
      expect(confirmed?.status).toBe('confirmed');

      const updated = await receiptRepo.update(
        created.id,
        {
          deliverer_name: 'Người Đã Cập Nhật',
          details: [
            {
              product_name: 'Vật tư mới',
              unit: 'Bộ',
              quantity_document: 1,
              quantity_actual: 1,
              unit_price: 999000,
            },
          ],
        },
        'Chín trăm chín mươi chín nghìn đồng'
      );
      expect(updated.deliverer_name).toBe('Người Đã Cập Nhật');
      expect(updated.details.length).toBe(1);

      const deleted = await receiptRepo.delete(created.id);
      expect(deleted).toBe(true);

      const afterDelete = await receiptRepo.findById(created.id);
      expect(afterDelete).toBeNull();
    });
  });
});
