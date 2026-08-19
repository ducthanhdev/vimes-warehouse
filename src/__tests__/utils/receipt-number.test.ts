import { generateReceiptNumber, isValidReceiptNumber } from '../../utils/receipt-number';

jest.mock('../../database/connection', () => ({
  query: jest.fn(),
}));

import { query } from '../../database/connection';
const mockQuery = query as jest.MockedFunction<typeof query>;

describe('receipt-number Utility', () => {
  describe('generateReceiptNumber', () => {
    test('Phiếu đầu tiên trong ngày -> NK-YYYYMMDD-001', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ count: '0' }] } as any);
      const result = await generateReceiptNumber('2026-08-18');
      expect(result).toBe('NK-20260818-001');
    });

    test('Phiếu thứ 5 trong ngày -> NK-YYYYMMDD-005', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ count: '4' }] } as any);
      const result = await generateReceiptNumber('2026-08-18');
      expect(result).toBe('NK-20260818-005');
    });

    test('Phiếu thứ 100 trong ngày -> NK-YYYYMMDD-100', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ count: '99' }] } as any);
      const result = await generateReceiptNumber('2026-08-18');
      expect(result).toBe('NK-20260818-100');
    });
  });

  describe('isValidReceiptNumber', () => {
    test('Đúng định dạng -> true', () => {
      expect(isValidReceiptNumber('NK-20260818-001')).toBe(true);
      expect(isValidReceiptNumber('NK-20260818-999')).toBe(true);
      expect(isValidReceiptNumber('NK-20260818-1000')).toBe(true);
    });

    test('Sai định dạng -> false', () => {
      expect(isValidReceiptNumber('PX-20260818-001')).toBe(false);
      expect(isValidReceiptNumber('NK-2026081-001')).toBe(false);
      expect(isValidReceiptNumber('NK-20260818-01')).toBe(false);
      expect(isValidReceiptNumber('')).toBe(false);
    });
  });
});
