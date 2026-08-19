import { query } from '../database/connection';
import { Product } from '../models/types';

export class ProductRepository {
  async findAll(): Promise<Product[]> {
    const sql = `
      SELECT id, code, name, unit, description, is_active, created_at, updated_at
      FROM products
      WHERE is_active = TRUE
      ORDER BY code ASC
    `;
    const result = await query<Product>(sql);
    return result.rows;
  }

  async findById(id: number): Promise<Product | null> {
    const sql = `
      SELECT id, code, name, unit, description, is_active, created_at, updated_at
      FROM products
      WHERE id = $1
    `;
    const result = await query<Product>(sql, [id]);
    return result.rows[0] || null;
  }

  async search(keyword: string, limit: number = 10): Promise<Product[]> {
    const sql = `
      SELECT id, code, name, unit
      FROM products
      WHERE is_active = TRUE
        AND (name ILIKE $1 OR code ILIKE $1)
      ORDER BY code ASC
      LIMIT $2
    `;
    const result = await query<Product>(sql, [`%${keyword}%`, limit]);
    return result.rows;
  }
}
