import request from 'supertest';
import app from '../../app';

describe('Web Pages Routes (EJS Views)', () => {
  test('GET / (Danh sách phiếu) -> 200 OK HTML', async () => {
    const res = await request(app)
      .get('/')
      .expect(200);

    expect(res.text).toContain('VIMES');
    expect(res.text).toContain('Danh Sách Phiếu Nhập Kho');
    expect(res.text).toContain('Mẫu số 01 - VT');
  });

  test('GET /receipts/new (Lập phiếu mới) -> 200 OK HTML', async () => {
    const res = await request(app)
      .get('/receipts/new')
      .expect(200);

    expect(res.text).toContain('PHIẾU NHẬP KHO');
    expect(res.text).toContain('Mẫu số 01 - VT');
    expect(res.text).toContain('Họ và tên người giao');
    expect(res.text).toContain('Cộng');
    expect(res.text).toContain('Tổng số tiền (viết bằng chữ)');
    expect(res.text).toContain('Người lập phiếu');
    expect(res.text).toContain('Người giao hàng');
    expect(res.text).toContain('Thủ kho');
    expect(res.text).toContain('Kế toán trưởng');
  });

  test('GET /receipts/1 (Xem chi tiết phiếu in 01-VT) -> 200 OK HTML', async () => {
    const res = await request(app)
      .get('/receipts/1')
      .expect(200);

    expect(res.text).toContain('PHIẾU NHẬP KHO');
    expect(res.text).toContain('NK-20260818-001');
    expect(res.text).toContain('Thép tấm SS400 dày 3mm');
  });

  test('GET /receipts/1/edit (Sửa phiếu) -> 200 OK HTML', async () => {
    const res = await request(app)
      .get('/receipts/1/edit')
      .expect(200);

    expect(res.text).toContain('chỉnh sửa');
    expect(res.text).toContain('NK-20260818-001');
  });

  test('GET /unknown-route (404 page) -> 404 HTML', async () => {
    const res = await request(app)
      .get('/unknown-random-route')
      .expect(404);

    expect(res.text).toContain('404');
    expect(res.text).toContain('Không Tìm Thấy Trang');
  });
});
