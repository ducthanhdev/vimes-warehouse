import request from 'supertest';
import app from '../../app';
import { pool } from '../../database/connection';
import { ReceiptRepository } from '../../repositories/receipt.repository';

describe('Pagination System Tests', () => {
  const receiptRepo = new ReceiptRepository();

  beforeEach(async () => {
    for (let i = 2; i <= 12; i++) {
      await pool.query(`
        INSERT INTO warehouse_receipts (
          id, receipt_number, receipt_date, company_name, department,
          deliverer_name, warehouse_id, status
        ) VALUES (
          $1, $2, '2026-08-18', 'Công ty VIMES', 'Phòng Kế hoạch',
          $3, 1, 'draft'
        ) ON CONFLICT (id) DO NOTHING
      `, [i, `NK-PAGE-${String(i).padStart(3, '0')}`, `Người Giao ${i}`]);
    }
  });

  describe('Repository Pagination', () => {
    test('Lấy trang 1 với limit 5', async () => {
      const result = await receiptRepo.findAll({ page: 1, limit: 5 });
      expect(result.data.length).toBeLessThanOrEqual(5);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(5);
      expect(result.pagination.total).toBeGreaterThanOrEqual(10);
      expect(result.pagination.total_pages).toBeGreaterThanOrEqual(2);
    });

    test('Lấy trang 2 với limit 5 -> các bản ghi khác trang 1', async () => {
      const page1 = await receiptRepo.findAll({ page: 1, limit: 5 });
      const page2 = await receiptRepo.findAll({ page: 2, limit: 5 });

      expect(page1.data.length).toBeGreaterThan(0);
      expect(page2.data.length).toBeGreaterThan(0);
      expect(page1.data[0].id).not.toBe(page2.data[0].id);
    });

    test('Phân trang kết hợp bộ lọc (filter theo kho)', async () => {
      const filtered = await receiptRepo.findAll({ warehouse_id: 1, page: 1, limit: 5 });
      expect(filtered.pagination).toBeDefined();
      filtered.data.forEach((r) => {
        expect(r.warehouse_id).toBe(1);
      });
    });
  });

  describe('API Endpoints Pagination (/api/receipts)', () => {
    test('GET /api/receipts?page=1&limit=5 -> trả về đúng metadata phân trang', async () => {
      const res = await request(app)
        .get('/api/receipts?page=1&limit=5')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.pagination.page).toBe(1);
      expect(res.body.data.pagination.limit).toBe(5);
      expect(res.body.data.pagination.total).toBeGreaterThanOrEqual(10);
      expect(res.body.data.data.length).toBe(5);
    });

    test('GET /api/receipts?page=2&limit=5 -> trả về trang 2', async () => {
      const res = await request(app)
        .get('/api/receipts?page=2&limit=5')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.pagination.page).toBe(2);
    });
  });

  describe('Web UI Pagination (/ (HTML view))', () => {
    test('GET /?limit=5&page=1 -> render dropdown limit và các nút số trang', async () => {
      const res = await request(app)
        .get('/?limit=5&page=1')
        .expect(200);

      expect(res.text).toContain('5 / trang');
      expect(res.text).toContain('Hiển thị:');
      expect(res.text).toContain('page-link-active');
      expect(res.text).toContain('Sau');
    });

    test('GET /?limit=5&page=2 -> giữ nguyên limit khi chuyển trang', async () => {
      const res = await request(app)
        .get('/?limit=5&page=2')
        .expect(200);

      expect(res.text).toContain('limit=5');
      expect(res.text).toContain('page=1');
      expect(res.text).toContain('Trang trước');
    });

    test('GET /?search=VIMES&limit=5&page=1 -> giữ nguyên search parameter trong link phân trang', async () => {
      const res = await request(app)
        .get('/?search=VIMES&limit=5&page=1')
        .expect(200);

      expect(res.text).toContain('search=VIMES');
    });
  });
});
