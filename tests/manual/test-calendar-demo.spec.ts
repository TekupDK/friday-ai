import { test, expect } from '@playwright/test';

test('Calendar Event Card Demo visual check', async ({ page }) => {
  // Go to showcase
  await page.goto('http://localhost:3000/showcase');
  
  // Wait for page load
  await page.waitForTimeout(2000);
  
  // Find Calendar Event Demo section
  await page.getByText('Calendar Event Demo').click();
  
  // Wait for demo to load
  await page.waitForTimeout(3000);
  
  // Take screenshot
  await page.screenshot({ 
    path: 'test-results/calendar-demo-full.png',
    fullPage: false 
  });
  
  console.log('Screenshot saved to test-results/calendar-demo-full.png');
  
  // Keep browser open to inspect
  await page.waitForTimeout(30000);
});
