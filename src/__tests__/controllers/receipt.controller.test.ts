import request from 'supertest';
import app from '../../app';

describe('Receipt Controller Integration Tests', () => {
  const sampleReceiptPayload = {
    receipt_date: '2026-08-18',
    company_name: 'Công ty Cổ phần Công nghệ VIMES',
    department: 'Phòng Kế hoạch',
    debit_account: '152',
    credit_account: '331',
    deliverer_name: 'Nguyễn Văn An',
    ref_document: 'Hóa đơn GTGT số 12345',
    warehouse_id: 1,
    attached_documents: 1,
    creator_name: 'Trần Thị Bình',
    deliverer_signer: 'Nguyễn Văn An',
    storekeeper_name: 'Lê Văn Cường',
    accountant_name: 'Phạm Thị Dung',
    details: [
      {
        product_id: 1,
        product_name: 'Thép tấm SS400 dày 3mm',
        product_code: 'NVL-001',
        unit: 'Tấm',
        quantity_document: 10,
        quantity_actual: 10,
        unit_price: 350000,
      },
      {
        product_id: 2,
        product_name: 'Thép ống phi 60 dày 2mm',
        product_code: 'NVL-002',
        unit: 'Cây',
        quantity_document: 5,
        quantity_actual: 5,
        unit_price: 125000,
      },
    ],
  };

  describe('POST /api/receipts', () => {
    test('Tạo phiếu mới hợp lệ -> 201 Created', async () => {
      const res = await request(app)
        .post('/api/receipts')
        .send(sampleReceiptPayload)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.receipt_number).toMatch(/^NK-\d{8}-\d{3,}$/);
      expect(res.body.data.details.length).toBe(2);
      expect(Number(res.body.data.total_amount)).toBe(10 * 350000 + 5 * 125000);
    });

    test('Tạo phiếu thiếu trường bắt buộc -> 400 Bad Request', async () => {
      const invalid = { ...sampleReceiptPayload, deliverer_name: '' };
      const res = await request(app)
        .post('/api/receipts')
        .send(invalid)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });

    test('Tạo phiếu với details rỗng -> 400 Bad Request', async () => {
      const invalid = { ...sampleReceiptPayload, details: [] };
      const res = await request(app)
        .post('/api/receipts')
        .send(invalid)
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/receipts', () => {
    test('Lấy danh sách phiếu -> 200 OK', async () => {
      const res = await request(app)
        .get('/api/receipts')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.data).toBeInstanceOf(Array);
      expect(res.body.data.pagination).toBeDefined();
    });

    test('Lọc theo search -> 200 OK', async () => {
      const res = await request(app)
        .get('/api/receipts')
        .query({ search: 'VIMES' })
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/receipts/:id', () => {
    test('Lấy chi tiết phiếu đã có (id: 1) -> 200 OK', async () => {
      const res = await request(app)
        .get('/api/receipts/1')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(1);
      expect(res.body.data.details.length).toBeGreaterThan(0);
      expect(res.body.data.warehouse).toBeDefined();
    });

    test('Lấy phiếu không tồn tại -> 404 Not Found', async () => {
      const res = await request(app)
        .get('/api/receipts/999999')
        .expect(404);

      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/receipts/:id', () => {
    test('Cập nhật phiếu -> 200 OK', async () => {
      const createRes = await request(app)
        .post('/api/receipts')
        .send(sampleReceiptPayload);
      const newId = createRes.body.data.id;

      const res = await request(app)
        .put(`/api/receipts/${newId}`)
        .send({
          deliverer_name: 'Nguyễn Văn Đã Cập Nhật',
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.deliverer_name).toBe('Nguyễn Văn Đã Cập Nhật');
    });
  });

  describe('POST /api/receipts/amount-to-text', () => {
    test('Chuyển 1500000 -> text đúng', async () => {
      const res = await request(app)
        .post('/api/receipts/amount-to-text')
        .send({ amount: 1500000 })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.text).toBe('Một triệu năm trăm nghìn đồng');
    });
  });

  describe('PATCH /api/receipts/:id/confirm', () => {
    test('Xác nhận phiếu -> 200 OK', async () => {
      const createRes = await request(app)
        .post('/api/receipts')
        .send(sampleReceiptPayload);
      const newId = createRes.body.data.id;

      const res = await request(app)
        .patch(`/api/receipts/${newId}/confirm`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('confirmed');
    });
  });

  describe('Master Data APIs', () => {
    test('GET /api/warehouses -> 200 OK', async () => {
      const res = await request(app)
        .get('/api/warehouses')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    test('GET /api/products -> 200 OK', async () => {
      const res = await request(app)
        .get('/api/products')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    test('GET /api/products/search -> 200 OK', async () => {
      const res = await request(app)
        .get('/api/products/search')
        .query({ q: 'Thép' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });
});
