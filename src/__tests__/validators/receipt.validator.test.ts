import {
  receiptDetailSchema,
  createReceiptSchema,
  updateReceiptSchema,
} from '../../validators/receipt.validator';

describe('Receipt Validators', () => {
  describe('receiptDetailSchema', () => {
    const validDetail = {
      product_name: 'Thép tấm SS400',
      unit: 'Tấm',
      quantity_document: 100,
      quantity_actual: 98,
      unit_price: 350000,
    };

    test('Valid detail -> pass', () => {
      const result = receiptDetailSchema.safeParse(validDetail);
      expect(result.success).toBe(true);
    });

    test('Tên hàng để trống -> fail', () => {
      const result = receiptDetailSchema.safeParse({ ...validDetail, product_name: '' });
      expect(result.success).toBe(false);
    });

    test('Đơn vị tính để trống -> fail', () => {
      const result = receiptDetailSchema.safeParse({ ...validDetail, unit: '' });
      expect(result.success).toBe(false);
    });

    test('Số lượng âm -> fail', () => {
      const result = receiptDetailSchema.safeParse({ ...validDetail, quantity_actual: -5 });
      expect(result.success).toBe(false);
    });

    test('Đơn giá âm -> fail', () => {
      const result = receiptDetailSchema.safeParse({ ...validDetail, unit_price: -1000 });
      expect(result.success).toBe(false);
    });
  });

  describe('createReceiptSchema', () => {
    const validReceipt = {
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

    test('Valid create receipt payload -> pass', () => {
      const result = createReceiptSchema.safeParse(validReceipt);
      expect(result.success).toBe(true);
    });

    test('Thiếu ngày lập phiếu -> fail', () => {
      const { receipt_date, ...invalid } = validReceipt;
      const result = createReceiptSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    test('Ngày lập phiếu sai định dạng -> fail', () => {
      const result = createReceiptSchema.safeParse({
        ...validReceipt,
        receipt_date: '18-08-2026',
      });
      expect(result.success).toBe(false);
    });

    test('Thiếu tên người giao hàng -> fail', () => {
      const { deliverer_name, ...invalid } = validReceipt;
      const result = createReceiptSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    test('warehouse_id không hợp lệ (<= 0) -> fail', () => {
      const result = createReceiptSchema.safeParse({
        ...validReceipt,
        warehouse_id: 0,
      });
      expect(result.success).toBe(false);
    });

    test('details rỗng -> fail', () => {
      const result = createReceiptSchema.safeParse({
        ...validReceipt,
        details: [],
      });
      expect(result.success).toBe(false);
    });
  });

  describe('updateReceiptSchema', () => {
    test('Partial payload hợp lệ -> pass', () => {
      const result = updateReceiptSchema.safeParse({
        deliverer_name: 'Nguyễn Văn Mới',
      });
      expect(result.success).toBe(true);
    });
  });
});
