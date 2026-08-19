import { PoolClient } from 'pg';
import { query, withTransaction } from '../database/connection';
import {
  WarehouseReceipt,
  WarehouseReceiptDetail,
  FullReceipt,
  CreateReceiptDTO,
  UpdateReceiptDTO,
  ReceiptFilter,
  PaginatedResponse,
} from '../models/types';

export class ReceiptRepository {
  async create(
    receiptNumber: string,
    dto: CreateReceiptDTO,
    totalAmountText: string
  ): Promise<FullReceipt> {
    return withTransaction(async (client: PoolClient) => {
      const headerSql = `
        INSERT INTO warehouse_receipts (
          receipt_number, receipt_date, company_name, department,
          debit_account, credit_account, deliverer_name,
          ref_document, warehouse_id, total_amount_text,
          attached_documents, creator_name, deliverer_signer,
          storekeeper_name, accountant_name
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
        )
        RETURNING *
      `;
      const headerParams = [
        receiptNumber,
        dto.receipt_date,
        dto.company_name || null,
        dto.department || null,
        dto.debit_account || null,
        dto.credit_account || null,
        dto.deliverer_name,
        dto.ref_document || null,
        dto.warehouse_id,
        totalAmountText,
        dto.attached_documents || 0,
        dto.creator_name || null,
        dto.deliverer_signer || null,
        dto.storekeeper_name || null,
        dto.accountant_name || null,
      ];

      const headerResult = await client.query<WarehouseReceipt>(headerSql, headerParams);
      const receipt = headerResult.rows[0];

      const detailSql = `
        INSERT INTO warehouse_receipt_details (
          receipt_id, line_number, product_id, product_name,
          product_code, unit, quantity_document, quantity_actual, unit_price
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;

      const details: WarehouseReceiptDetail[] = [];
      for (let i = 0; i < dto.details.length; i++) {
        const detail = dto.details[i];
        const detailParams = [
          receipt.id,
          i + 1,
          detail.product_id || null,
          detail.product_name,
          detail.product_code || null,
          detail.unit,
          detail.quantity_document,
          detail.quantity_actual,
          detail.unit_price,
        ];
        const detailResult = await client.query<WarehouseReceiptDetail>(detailSql, detailParams);
        details.push(detailResult.rows[0]);
      }

      const updatedHeader = await client.query<WarehouseReceipt>(
        `SELECT * FROM warehouse_receipts WHERE id = $1`,
        [receipt.id]
      );

      return {
        ...updatedHeader.rows[0],
        details,
      };
    });
  }

  async findAll(filter: ReceiptFilter): Promise<PaginatedResponse<WarehouseReceipt & { warehouse_name?: string }>> {
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (filter.from_date) {
      conditions.push(`wr.receipt_date >= $${paramIndex++}`);
      params.push(filter.from_date);
    }
    if (filter.to_date) {
      conditions.push(`wr.receipt_date <= $${paramIndex++}`);
      params.push(filter.to_date);
    }
    if (filter.warehouse_id) {
      conditions.push(`wr.warehouse_id = $${paramIndex++}`);
      params.push(filter.warehouse_id);
    }
    if (filter.status) {
      conditions.push(`wr.status = $${paramIndex++}`);
      params.push(filter.status);
    }
    if (filter.search) {
      conditions.push(`(wr.receipt_number ILIKE $${paramIndex} OR wr.deliverer_name ILIKE $${paramIndex} OR wr.company_name ILIKE $${paramIndex})`);
      params.push(`%${filter.search}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `
      SELECT COUNT(*) as total
      FROM warehouse_receipts wr
      ${whereClause}
    `;
    const countResult = await query(countSql, params);
    const total = parseInt(countResult.rows[0].total, 10);

    const page = Number(filter.page) || 1;
    const limit = Number(filter.limit) || 10;
    const offset = (page - 1) * limit;

    const dataSql = `
      SELECT
        wr.*,
        w.name as warehouse_name,
        w.code as warehouse_code
      FROM warehouse_receipts wr
      LEFT JOIN warehouses w ON w.id = wr.warehouse_id
      ${whereClause}
      ORDER BY wr.receipt_date DESC, wr.receipt_number DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    const dataParams = [...params, limit, offset];
    const dataResult = await query(dataSql, dataParams);

    return {
      data: dataResult.rows,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findById(id: number): Promise<FullReceipt | null> {
    const headerSql = `
      SELECT
        wr.*,
        w.name    as warehouse_name,
        w.code    as warehouse_code,
        w.address as warehouse_address
      FROM warehouse_receipts wr
      LEFT JOIN warehouses w ON w.id = wr.warehouse_id
      WHERE wr.id = $1
    `;
    const headerResult = await query(headerSql, [id]);

    if (headerResult.rowCount === 0) return null;

    const receipt = headerResult.rows[0];

    const detailsSql = `
      SELECT *
      FROM warehouse_receipt_details
      WHERE receipt_id = $1
      ORDER BY line_number ASC
    `;
    const detailsResult = await query<WarehouseReceiptDetail>(detailsSql, [id]);

    return {
      ...receipt,
      details: detailsResult.rows,
      warehouse: {
        id: receipt.warehouse_id,
        code: receipt.warehouse_code,
        name: receipt.warehouse_name,
        address: receipt.warehouse_address,
      },
    };
  }

  async update(id: number, dto: UpdateReceiptDTO, totalAmountText?: string): Promise<FullReceipt> {
    return withTransaction(async (client: PoolClient) => {
      const setClauses: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      const fieldMap: Array<[string, keyof UpdateReceiptDTO]> = [
        ['receipt_date', 'receipt_date'],
        ['company_name', 'company_name'],
        ['department', 'department'],
        ['debit_account', 'debit_account'],
        ['credit_account', 'credit_account'],
        ['deliverer_name', 'deliverer_name'],
        ['ref_document', 'ref_document'],
        ['warehouse_id', 'warehouse_id'],
        ['attached_documents', 'attached_documents'],
        ['creator_name', 'creator_name'],
        ['deliverer_signer', 'deliverer_signer'],
        ['storekeeper_name', 'storekeeper_name'],
        ['accountant_name', 'accountant_name'],
      ];

      for (const [column, dtoKey] of fieldMap) {
        if (dto[dtoKey] !== undefined) {
          setClauses.push(`${column} = $${paramIndex++}`);
          params.push(dto[dtoKey]);
        }
      }

      if (totalAmountText !== undefined) {
        setClauses.push(`total_amount_text = $${paramIndex++}`);
        params.push(totalAmountText);
      }

      if (setClauses.length > 0) {
        params.push(id);
        const updateSql = `
          UPDATE warehouse_receipts
          SET ${setClauses.join(', ')}
          WHERE id = $${paramIndex}
        `;
        await client.query(updateSql, params);
      }

      if (dto.details && dto.details.length > 0) {
        await client.query(`DELETE FROM warehouse_receipt_details WHERE receipt_id = $1`, [id]);

        const detailSql = `
          INSERT INTO warehouse_receipt_details (
            receipt_id, line_number, product_id, product_name,
            product_code, unit, quantity_document, quantity_actual, unit_price
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `;

        for (let i = 0; i < dto.details.length; i++) {
          const d = dto.details[i];
          await client.query(detailSql, [
            id,
            i + 1,
            d.product_id || null,
            d.product_name,
            d.product_code || null,
            d.unit,
            d.quantity_document,
            d.quantity_actual,
            d.unit_price,
          ]);
        }
      }

      const headerResult = await client.query(`SELECT * FROM warehouse_receipts WHERE id = $1`, [id]);
      const detailsResult = await client.query(
        `SELECT * FROM warehouse_receipt_details WHERE receipt_id = $1 ORDER BY line_number`,
        [id]
      );

      return {
        ...headerResult.rows[0],
        details: detailsResult.rows,
      };
    });
  }

  async delete(id: number): Promise<boolean> {
    const sql = `DELETE FROM warehouse_receipts WHERE id = $1`;
    const result = await query(sql, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  async updateStatus(id: number, status: string): Promise<WarehouseReceipt | null> {
    const sql = `
      UPDATE warehouse_receipts
      SET status = $1
      WHERE id = $2
      RETURNING *
    `;
    const result = await query<WarehouseReceipt>(sql, [status, id]);
    return result.rows[0] || null;
  }
}
