#!/usr/bin/env node
/**
 * Test if docs service can start
 */

// Set env vars
process.env.DOCS_ENABLE = "true";
process.env.DOCS_REPO_PATH = "./";
process.env.DOCS_PATH = "docs";
process.env.DOCS_GIT_BRANCH = "main";
process.env.DOCS_AUTO_COMMIT = "true";
process.env.DOCS_AUTO_PUSH = "false";
process.env.DOCS_WS_PORT = "3002";

// Mock logger
const logger = {
  info: (...args) => console.log('[INFO]', ...args),
  error: (...args) => console.error('[ERROR]', ...args),
  warn: (...args) => console.warn('[WARN]', ...args),
  debug: (...args) => console.log('[DEBUG]', ...args),
};

global.logger = logger;

console.log('🧪 Testing docs service startup...\n');

try {
  // Try to import
  console.log('1. Importing modules...');
  const { startDocsService } = await import('../server/docs/service.ts');
  console.log('✅ Modules imported\n');

  // Try to start
  console.log('2. Starting docs service...');
  await startDocsService();
  console.log('✅ Docs service started!\n');

  console.log('3. Testing WebSocket connection...');
  const ws = new (await import('ws')).WebSocket('ws://localhost:3002?userId=test');
  
  ws.on('open', () => {
    console.log('✅ WebSocket connected!');
    ws.close();
    process.exit(0);
  });

  ws.on('error', (err) => {
    console.error('❌ WebSocket error:', err.message);
    process.exit(1);
  });

} catch (error) {
  console.error('❌ Failed:', error.message);
  console.error(error.stack);
  process.exit(1);
}
