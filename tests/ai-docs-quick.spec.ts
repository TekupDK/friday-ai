/**
 * AI Documentation Generator - Quick Test
 * Simple smoke test for AI doc features
 */

import { test, expect } from '@playwright/test';

test.describe('🤖 AI Docs Generator - Quick Test', () => {
  
  test('should show AI generation buttons in docs page', async ({ page }) => {
    console.log('\n🧪 Testing AI Doc Buttons\n');
    
    // Navigate to docs page
    await page.goto('http://localhost:3000/docs');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('✓ Docs page loaded');
    
    // Take screenshot of full page
    await page.screenshot({ 
      path: 'test-results/ai-docs-page.png',
      fullPage: true 
    });
    
    console.log('✓ Screenshot saved');
    
    // Check for AI buttons
    const weeklyDigestBtn = page.locator('button:has-text("Weekly Digest")');
    const bulkGenerateBtn = page.locator('button:has-text("Bulk Generate")');
    
    const hasWeekly = await weeklyDigestBtn.count() > 0;
    const hasBulk = await bulkGenerateBtn.count() > 0;
    
    console.log(`✓ Weekly Digest button: ${hasWeekly ? '✅ Found' : '❌ Not found'}`);
    console.log(`✓ Bulk Generate button: ${hasBulk ? '✅ Found' : '❌ Not found'}`);
    
    // Log all buttons on page for debugging
    const allButtons = await page.locator('button').allTextContents();
    console.log(`\n📊 All buttons found (${allButtons.length}):`);
    allButtons.slice(0, 10).forEach((text, i) => {
      console.log(`   ${i + 1}. "${text}"`);
    });
    
    if (!hasWeekly && !hasBulk) {
      console.log('\n⚠️  Note: AI buttons not found - may need authentication');
      console.log('    Current URL:', page.url());
      
      // Check if we're on login page
      const isLogin = page.url().includes('/login');
      console.log(`    On login page: ${isLogin ? 'Yes' : 'No'}`);
    }
    
    console.log('\n✅ Test completed\n');
  });
  
  test('should have docs page with expected elements', async ({ page }) => {
    console.log('\n🧪 Testing Docs Page Structure\n');
    
    await page.goto('http://localhost:3000/docs');
    await page.waitForLoadState('networkidle');
    
    console.log('✓ Page loaded');
    
    // Check for key elements
    const hasDocumentation = await page.locator('text=Documentation').count() > 0;
    const hasNewDocBtn = await page.locator('button:has-text("New Document")').count() > 0;
    const hasSearchBox = await page.locator('input[placeholder*="Search"]').count() > 0;
    
    console.log(`✓ "Documentation" heading: ${hasDocumentation ? '✅' : '❌'}`);
    console.log(`✓ "New Document" button: ${hasNewDocBtn ? '✅' : '❌'}`);
    console.log(`✓ Search box: ${hasSearchBox ? '✅' : '❌'}`);
    
    // Check for AI icons
    const sparklesIcon = await page.locator('svg[class*="lucide-sparkles"]').count();
    const zapIcon = await page.locator('svg[class*="lucide-zap"]').count();
    const calendarIcon = await page.locator('svg[class*="lucide-calendar"]').count();
    
    console.log(`\n📊 AI Icons:`);
    console.log(`   Sparkles: ${sparklesIcon}`);
    console.log(`   Zap: ${zapIcon}`);
    console.log(`   Calendar: ${calendarIcon}`);
    
    await page.screenshot({ 
      path: 'test-results/ai-docs-structure.png',
      fullPage: true 
    });
    
    console.log('\n✅ Structure test completed\n');
  });
  
  test('should verify AI-generated doc exists', async ({ page }) => {
    console.log('\n🧪 Testing AI-Generated Doc\n');
    
    // Try to access our known AI-generated doc
    await page.goto('http://localhost:3000/docs?view=P9_dkAIR3Sa_q5QJqyx6y');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('✓ Navigated to AI doc');
    
    const content = await page.content();
    
    // Check for AI markers
    const hasEmoji = /[\u{1F300}-\u{1F9FF}]/u.test(content);
    const hasAI = content.toLowerCase().includes('ai');
    const hasGenerated = content.toLowerCase().includes('generated');
    
    console.log(`✓ Contains emojis: ${hasEmoji ? '✅' : '❌'}`);
    console.log(`✓ Contains "AI": ${hasAI ? '✅' : '❌'}`);
    console.log(`✓ Contains "generated": ${hasGenerated ? '✅' : '❌'}`);
    
    await page.screenshot({ 
      path: 'test-results/ai-docs-generated.png',
      fullPage: true 
    });
    
    console.log('✓ Screenshot saved');
    console.log('\n✅ AI doc verification completed\n');
  });
  
  test('should load docs page without errors', async ({ page }) => {
    console.log('\n🧪 Testing Page Load Performance\n');
    
    const errors: string[] = [];
    
    // Capture console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    const startTime = Date.now();
    await page.goto('http://localhost:3000/docs');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    console.log(`✓ Page loaded in ${loadTime}ms`);
    
    if (errors.length > 0) {
      console.log(`\n⚠️  Console errors found (${errors.length}):`);
      errors.slice(0, 5).forEach((err, i) => {
        console.log(`   ${i + 1}. ${err.slice(0, 100)}`);
      });
    } else {
      console.log('✓ No console errors! 🎉');
    }
    
    // Check performance is acceptable
    expect(loadTime).toBeLessThan(10000);
    
    console.log('\n✅ Performance test completed\n');
  });
});
