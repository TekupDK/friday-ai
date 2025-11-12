#!/usr/bin/env node
import pg from "pg";
const { Client } = pg;

const client = new Client({
  connectionString:
    "postgresql://postgres:Habibie12345%40@db.oaevagdgrasfppbrxbey.supabase.co:5432/postgres",
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();

  // Count documents
  const countResult = await client.query(`
    SELECT COUNT(*) as count FROM friday_ai.documents;
  `);

  console.log(`📊 Total documents: ${countResult.rows[0].count}`);

  // Get categories breakdown
  const categoriesResult = await client.query(`
    SELECT category, COUNT(*) as count 
    FROM friday_ai.documents 
    GROUP BY category 
    ORDER BY count DESC 
    LIMIT 10;
  `);

  console.log("\n📁 Top categories:");
  categoriesResult.rows.forEach(row => {
    console.log(`  - ${row.category}: ${row.count}`);
  });

  // Get sample docs
  const sampleResult = await client.query(`
    SELECT title, category, path 
    FROM friday_ai.documents 
    ORDER BY "createdAt" DESC 
    LIMIT 5;
  `);

  console.log("\n📄 Latest documents:");
  sampleResult.rows.forEach(row => {
    console.log(`  - ${row.title}`);
    console.log(`    Category: ${row.category}`);
    console.log(`    Path: ${row.path}\n`);
  });
} catch (error) {
  console.error("Error:", error.message);
} finally {
  await client.end();
}
