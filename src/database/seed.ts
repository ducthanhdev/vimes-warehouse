import fs from 'fs';
import path from 'path';
import { pool } from './connection';

async function seed() {
  const seedPath = path.join(__dirname, 'seed.sql');
  const sql = fs.readFileSync(seedPath, 'utf-8');

  try {
    await pool.query(sql);
    console.log('Seed data inserted successfully');
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
