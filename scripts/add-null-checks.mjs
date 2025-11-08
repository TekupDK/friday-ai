#!/usr/bin/env node
import fs from 'fs';

const file = 'server/routers/docs-router.ts';
let content = fs.readFileSync(file, 'utf-8');

// Add null check after every getDb() call
content = content.replace(
  /const db = await getDb\(\);(?!\s*if \(!db\))/g,
  'const db = await getDb();\n      if (!db) throw new Error("Database not available");'
);

fs.writeFileSync(file, content);
console.log('✅ Added null checks to docs-router.ts');
