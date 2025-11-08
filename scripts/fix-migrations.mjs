#!/usr/bin/env node
/**
 * Fix Drizzle Migrations
 * 
 * Problem: Old migrations have MySQL syntax, won't work with PostgreSQL
 * Solution: Mark current DB state as baseline, future migrations will be clean
 */
import pg from 'pg';
import fs from 'fs';
const { Client } = pg;

const client = new Client({
  connectionString: "postgresql://postgres:Habibie12345%40@db.oaevagdgrasfppbrxbey.supabase.co:5432/postgres",
  ssl: { rejectUnauthorized: false }
});

async function fixMigrations() {
  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    // Create drizzle migrations table if not exists
    await client.query(`
      CREATE SCHEMA IF NOT EXISTS drizzle;
      
      CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
        id SERIAL PRIMARY KEY,
        hash text NOT NULL,
        created_at bigint
      );
    `);
    console.log('✅ Created drizzle migrations table');
    
    // Check if migrations already recorded
    const existing = await client.query('SELECT * FROM drizzle.__drizzle_migrations');
    
    if (existing.rows.length > 0) {
      console.log('⚠️  Migrations already recorded, skipping');
      return;
    }
    
    // Mark all old migrations as applied (baseline)
    const migrations = [
      { hash: '0000_hard_chimera', created_at: 1761990428289 },
      { hash: '0001_brown_wasp', created_at: 1761990750966 },
      { hash: '0002_sweet_may_parker', created_at: 1762011975698 },
      { hash: '0003_minor_lester', created_at: 1762119323244 },
    ];
    
    for (const migration of migrations) {
      await client.query(
        'INSERT INTO drizzle.__drizzle_migrations (hash, created_at) VALUES ($1, $2)',
        [migration.hash, migration.created_at]
      );
      console.log(`✅ Marked ${migration.hash} as applied`);
    }
    
    // Now apply the new docs migration
    console.log('\n📦 Applying documentation tables migration...');
    
    const sql = fs.readFileSync('drizzle/migrations/0004_add_documentation_tables.sql', 'utf-8');
    await client.query(sql);
    console.log('✅ Documentation tables created');
    
    // Record this migration
    await client.query(
      'INSERT INTO drizzle.__drizzle_migrations (hash, created_at) VALUES ($1, $2)',
      ['0004_add_documentation_tables', Date.now()]
    );
    console.log('✅ Migration recorded');
    
    console.log('\n🎉 Migrations fixed! You can now use drizzle-kit migrate safely.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

fixMigrations();
