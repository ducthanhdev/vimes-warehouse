import { z } from 'zod';

export const receiptDetailSchema = z.object({
  product_id: z
    .number()
    .int()
    .positive('ID sản phẩm phải là số dương')
    .nullable()
    .optional(),

  product_name: z
    .string({ required_error: 'Tên hàng hóa không được để trống' })
    .min(1, 'Tên hàng hóa không được để trống')
    .max(500, 'Tên hàng hóa tối đa 500 ký tự')
    .trim(),

  product_code: z
    .string()
    .max(50, 'Mã số tối đa 50 ký tự')
    .trim()
    .nullable()
    .optional(),

  unit: z
    .string({ required_error: 'Đơn vị tính không được để trống' })
    .min(1, 'Đơn vị tính không được để trống')
    .max(50, 'Đơn vị tính tối đa 50 ký tự')
    .trim(),

  quantity_document: z
    .number({ invalid_type_error: 'Số lượng theo chứng từ phải là số' })
    .min(0, 'Số lượng theo chứng từ không được âm')
    .max(999999999.999, 'Số lượng vượt quá giới hạn'),

  quantity_actual: z
    .number({ invalid_type_error: 'Số lượng thực nhập phải là số' })
    .min(0, 'Số lượng thực nhập không được âm')
    .max(999999999.999, 'Số lượng vượt quá giới hạn'),

  unit_price: z
    .number({ invalid_type_error: 'Đơn giá phải là số' })
    .min(0, 'Đơn giá không được âm')
    .max(9999999999999.99, 'Đơn giá vượt quá giới hạn'),
});

export const createReceiptSchema = z.object({
  receipt_date: z
    .string({ required_error: 'Ngày lập phiếu không được để trống' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày lập phiếu phải có định dạng YYYY-MM-DD')
    .refine((val) => {
      const d = new Date(val);
      return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === val;
    }, {
      message: 'Ngày lập phiếu không hợp lệ',
    }),

  company_name: z.string().max(255).trim().nullable().optional(),
  department: z.string().max(255).trim().nullable().optional(),

  debit_account: z
    .string()
    .max(20, 'Tài khoản Nợ tối đa 20 ký tự')
    .trim()
    .nullable()
    .optional(),

  credit_account: z
    .string()
    .max(20, 'Tài khoản Có tối đa 20 ký tự')
    .trim()
    .nullable()
    .optional(),

  deliverer_name: z
    .string({ required_error: 'Họ tên người giao không được để trống' })
    .min(1, 'Họ tên người giao không được để trống')
    .max(255, 'Họ tên tối đa 255 ký tự')
    .trim(),

  ref_document: z.string().max(255).trim().nullable().optional(),

  warehouse_id: z
    .number({ required_error: 'Vui lòng chọn kho nhập', invalid_type_error: 'Kho nhập phải là số' })
    .int('Kho nhập phải là số nguyên')
    .positive('Vui lòng chọn kho nhập'),

  attached_documents: z
    .number()
    .int('Số chứng từ phải là số nguyên')
    .min(0, 'Số chứng từ không được âm')
    .optional()
    .default(0),

  creator_name: z.string().max(255).trim().nullable().optional(),
  deliverer_signer: z.string().max(255).trim().nullable().optional(),
  storekeeper_name: z.string().max(255).trim().nullable().optional(),
  accountant_name: z.string().max(255).trim().nullable().optional(),

  details: z
    .array(receiptDetailSchema)
    .min(1, 'Phiếu nhập kho phải có ít nhất 1 dòng hàng hóa')
    .max(100, 'Tối đa 100 dòng hàng hóa'),
});

export const updateReceiptSchema = createReceiptSchema.partial();

export const receiptFilterSchema = z.object({
  from_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  warehouse_id: z.coerce.number().int().positive().optional(),
  status: z.enum(['draft', 'confirmed', 'cancelled']).optional(),
  search: z.string().max(255).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export type CreateReceiptInput = z.infer<typeof createReceiptSchema>;
export type UpdateReceiptInput = z.infer<typeof updateReceiptSchema>;
export type ReceiptDetailInput = z.infer<typeof receiptDetailSchema>;
export type ReceiptFilterInput = z.infer<typeof receiptFilterSchema>;
