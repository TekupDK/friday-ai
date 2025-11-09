/**
 * Debug Page - Check what's actually on the page
 */

import { test } from '@playwright/test';

test('Debug - Check Page Content', async ({ page }) => {
  // Listen to console messages
  page.on('console', msg => {
    console.log(`BROWSER ${msg.type()}: ${msg.text()}`);
  });
  
  // Listen to page errors
  page.on('pageerror', error => {
    console.log(`PAGE ERROR: ${error.message}`);
  });
  
  // Navigate
  await page.goto('http://localhost:3002');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  
  // Get HTML content
  const htmlContent = await page.content();
  console.log('\n========== HTML CONTENT (first 2000 chars) ==========');
  console.log(htmlContent.slice(0, 2000));
  console.log('====================================================\n');
  
  // Get all visible text
  const bodyText = await page.locator('body').textContent();
  console.log('\n========== VISIBLE TEXT ==========');
  console.log(bodyText?.slice(0, 1000));
  console.log('==================================\n');
  
  // Check if there's a login form
  const hasLoginForm = await page.locator('input[type="password"], input[type="email"], form').count() > 0;
  console.log(`Has login form: ${hasLoginForm}`);
  
  // Check for error messages
  const errorText = await page.locator('text=/error/i, text=/failed/i').textContent().catch(() => null);
  if (errorText) {
    console.log(`Error message found: ${errorText}`);
  }
  
  // Take screenshot
  await page.screenshot({ 
    path: 'test-results/ui-analysis/debug-homepage.png',
    fullPage: true 
  });
  
  // Try navigating to /workspace
  console.log('\n=== Navigating to /workspace ===');
  await page.goto('http://localhost:3002/workspace');
  await page.waitForTimeout(3000);
  
  const workspaceHtml = await page.content();
  console.log('\n========== WORKSPACE HTML (first 2000 chars) ==========');
  console.log(workspaceHtml.slice(0, 2000));
  console.log('====================================================\n');
  
  const workspaceText = await page.locator('body').textContent();
  console.log('\n========== WORKSPACE TEXT ==========');
  console.log(workspaceText?.slice(0, 1000));
  console.log('====================================\n');
  
  await page.screenshot({ 
    path: 'test-results/ui-analysis/debug-workspace.png',
    fullPage: true 
  });
});
