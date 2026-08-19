import { query } from '../database/connection';
import { Warehouse } from '../models/types';

export class WarehouseRepository {
  async findAll(): Promise<Warehouse[]> {
    const sql = `
      SELECT id, code, name, address, is_active, created_at, updated_at
      FROM warehouses
      WHERE is_active = TRUE
      ORDER BY code ASC
    `;
    const result = await query<Warehouse>(sql);
    return result.rows;
  }

  async findById(id: number): Promise<Warehouse | null> {
    const sql = `
      SELECT id, code, name, address, is_active, created_at, updated_at
      FROM warehouses
      WHERE id = $1
    `;
    const result = await query<Warehouse>(sql, [id]);
    return result.rows[0] || null;
  }

  async exists(id: number): Promise<boolean> {
    const sql = `SELECT 1 FROM warehouses WHERE id = $1 AND is_active = TRUE`;
    const result = await query(sql, [id]);
    return (result.rowCount ?? 0) > 0;
  }
}
