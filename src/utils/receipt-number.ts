import { query } from '../database/connection';

export async function generateReceiptNumber(date?: string): Promise<string> {
  const receiptDate = date || new Date().toISOString().split('T')[0];
  const dateStr = receiptDate.replace(/-/g, '');

  const result = await query(
    `SELECT COUNT(*) as count
     FROM warehouse_receipts
     WHERE receipt_number LIKE $1`,
    [`NK-${dateStr}-%`]
  );

  const count = parseInt(result.rows[0].count, 10);
  const nextNumber = count + 1;
  const paddedNumber = nextNumber.toString().padStart(3, '0');

  return `NK-${dateStr}-${paddedNumber}`;
}

export function isValidReceiptNumber(receiptNumber: string): boolean {
  return /^NK-\d{8}-\d{3,}$/.test(receiptNumber);
}
