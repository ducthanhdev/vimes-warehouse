import fs from 'fs';
import path from 'path';
import { pool, query, closePool } from '../database/connection';

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
  await pool.query(schemaSql);

  const seedPath = path.join(__dirname, '..', 'database', 'seed.sql');
  const seedSql = fs.readFileSync(seedPath, 'utf-8');
  await pool.query(seedSql);
});

afterEach(async () => {
  try {
    await query('DELETE FROM warehouse_receipt_details WHERE receipt_id > 1');
    await query('DELETE FROM warehouse_receipts WHERE id > 1');
  } catch (err) {
    // ignore
  }
});

afterAll(async () => {
  await closePool();
});
