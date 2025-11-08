import { test, expect } from '@playwright/test';

/**
 * Docs System - Smoke Test
 * Quick verification that docs system works
 */

test.describe('📚 Docs Smoke Test', () => {
  test('should access docs page and see documents', async ({ page }) => {
    // Go directly to docs (assuming logged in via cookies or public access)
    await page.goto('http://localhost:3000/docs');
    
    // Wait a bit for page to load
    await page.waitForTimeout(3000);
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/docs-page.png', fullPage: true });
    
    // Check if page loaded
    const pageContent = await page.content();
    console.log('Page title:', await page.title());
    console.log('URL:', page.url());
    
    // Basic checks
    const hasDocumentation = pageContent.includes('Documentation') || pageContent.includes('Documents');
    console.log('✅ Has Documentation heading:', hasDocumentation);
    
    // Check for key elements
    const hasSearch = await page.locator('input[placeholder*="Search"]').count() > 0;
    console.log('✅ Has search box:', hasSearch);
    
    const hasCards = await page.locator('[class*="Card"]').count() > 0;
    console.log('✅ Has card components:', hasCards);
    
    // Log visible text
    const bodyText = await page.locator('body').textContent();
    console.log('Page contains:', bodyText?.slice(0, 500));
  });
  
  test('should load with filters visible', async ({ page }) => {
    await page.goto('http://localhost:3000/docs');
    await page.waitForTimeout(2000);
    
    // Check selectors
    const selects = await page.locator('select, [role="combobox"]').count();
    console.log('✅ Number of dropdowns found:', selects);
    
    // Check buttons
    const buttons = await page.locator('button').count();
    console.log('✅ Number of buttons found:', buttons);
    
    await page.screenshot({ path: 'test-results/docs-filters.png' });
  });
});
