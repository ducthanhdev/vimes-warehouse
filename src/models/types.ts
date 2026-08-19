export interface Warehouse {
  id: number;
  code: string;
  name: string;
  address: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Product {
  id: number;
  code: string;
  name: string;
  unit: string;
  description: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export type ReceiptStatus = 'draft' | 'confirmed' | 'cancelled';

export const RECEIPT_STATUS = {
  DRAFT: 'draft' as ReceiptStatus,
  CONFIRMED: 'confirmed' as ReceiptStatus,
  CANCELLED: 'cancelled' as ReceiptStatus,
};

export interface WarehouseReceipt {
  id: number;
  receipt_number: string;
  receipt_date: string | Date;
  company_name: string | null;
  department: string | null;
  debit_account: string | null;
  credit_account: string | null;
  deliverer_name: string;
  ref_document: string | null;
  warehouse_id: number;
  total_amount: number;
  total_amount_text: string | null;
  attached_documents: number;
  creator_name: string | null;
  deliverer_signer: string | null;
  storekeeper_name: string | null;
  accountant_name: string | null;
  status: ReceiptStatus;
  created_at: Date;
  updated_at: Date;
}

export interface WarehouseReceiptDetail {
  id: number;
  receipt_id: number;
  line_number: number;
  product_id: number | null;
  product_name: string;
  product_code: string | null;
  unit: string;
  quantity_document: number;
  quantity_actual: number;
  unit_price: number;
  total_price: number;
  created_at: Date;
}

export interface CreateReceiptDetailDTO {
  product_id?: number | null;
  product_name: string;
  product_code?: string | null;
  unit: string;
  quantity_document: number;
  quantity_actual: number;
  unit_price: number;
}

export interface CreateReceiptDTO {
  receipt_date: string;
  company_name?: string | null;
  department?: string | null;
  debit_account?: string | null;
  credit_account?: string | null;
  deliverer_name: string;
  ref_document?: string | null;
  warehouse_id: number;
  attached_documents?: number;
  creator_name?: string | null;
  deliverer_signer?: string | null;
  storekeeper_name?: string | null;
  accountant_name?: string | null;
  details: CreateReceiptDetailDTO[];
}

export interface UpdateReceiptDTO extends Partial<CreateReceiptDTO> {}

export interface FullReceipt extends WarehouseReceipt {
  details: WarehouseReceiptDetail[];
  warehouse?: Warehouse;
}

export interface ReceiptFilter {
  from_date?: string;
  to_date?: string;
  warehouse_id?: number;
  status?: ReceiptStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
}
