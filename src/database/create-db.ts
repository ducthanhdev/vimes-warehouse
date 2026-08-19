import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function createDatabase() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: 'postgres',
  });

  try {
    await client.connect();

    const dbName = process.env.DB_NAME || 'vimes_warehouse';
    const testDbName = process.env.TEST_DB_NAME || 'vimes_warehouse_test';

    for (const name of [dbName, testDbName]) {
      const res = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [name]);
      if (res.rowCount === 0) {
        await client.query(`CREATE DATABASE "${name}"`);
        console.log(`Database "${name}" created successfully`);
      }
    }
  } catch (error) {
    console.error('Error creating database:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createDatabase();
