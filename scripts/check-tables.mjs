#!/usr/bin/env node
import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: "postgresql://postgres:Habibie12345%40@db.oaevagdgrasfppbrxbey.supabase.co:5432/postgres",
  ssl: { rejectUnauthorized: false }
});

try {
  await client.connect();
  
  // Check if doc tables exist
  const result = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'friday_ai' 
    AND table_name LIKE 'document%'
    ORDER BY table_name;
  `);
  
  console.log('Document tables:', result.rows.map(r => r.table_name));
  
  // Check drizzle migrations table
  const migrations = await client.query(`
    SELECT * FROM drizzle.__drizzle_migrations ORDER BY created_at;
  `);
  
  console.log('\nApplied migrations:', migrations.rows);
  
} catch (error) {
  console.error('Error:', error.message);
} finally {
  await client.end();
}
