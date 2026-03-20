import { getConnection } from './db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  console.log('Running database migration...');
  
  try {
    const conn = await getConnection();
    try {
      const migrationPath = path.join(__dirname, '../migrations/add_supabase_id.sql');
      const sql = fs.readFileSync(migrationPath, 'utf8');
      
      await conn.query(sql);
      console.log('✅ Migration completed successfully!');
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
  
  process.exit(0);
}

runMigration();
