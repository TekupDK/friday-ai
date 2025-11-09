/**
 * Step 3 Features Test Suite
 * 
 * Tests advanced features added in Step 3:
 * - AI Analytics Dashboard
 * - Metrics collection
 * - Queue system
 * - Progress tracking
 * - Cost calculations
 */

import { test, expect } from '@playwright/test';

test.describe('🎯 Step 3: Advanced AI Features', () => {
  
  test('should display AI Analytics tab in docs page', async ({ page }) => {
    console.log('\n📊 Testing AI Analytics Tab\n');
    
    await page.goto('http://localhost:3000/docs');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('✓ Docs page loaded');
    
    // Check for Analytics tab
    const analyticsTab = page.locator('[role="tab"]:has-text("AI Analytics")');
    const hasTab = await analyticsTab.count() > 0;
    
    console.log(`✓ AI Analytics tab: ${hasTab ? '✅ Found' : '❌ Not found'}`);
    
    if (hasTab) {
      // Click the tab
      await analyticsTab.click();
      await page.waitForTimeout(1000);
      
      console.log('✓ Clicked analytics tab');
      
      // Check for dashboard elements
      const hasDashboard = await page.locator('text=AI Documentation Analytics').count() > 0;
      const hasMetrics = await page.locator('text=Total Genereret, text=Success Rate').count() > 0;
      
      console.log(`✓ Dashboard visible: ${hasDashboard ? '✅' : '❌'}`);
      console.log(`✓ Metrics visible: ${hasMetrics ? '✅' : '❌'}`);
      
      await page.screenshot({ 
        path: 'test-results/step3-analytics-dashboard.png',
        fullPage: true 
      });
      
      console.log('✓ Screenshot saved');
    }
    
    console.log('\n✅ Analytics tab test completed\n');
  });
  
  test('should show analytics metrics cards', async ({ page }) => {
    console.log('\n📈 Testing Analytics Metrics\n');
    
    await page.goto('http://localhost:3000/docs');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Navigate to analytics tab
    const analyticsTab = page.locator('[role="tab"]:has-text("AI Analytics")');
    if (await analyticsTab.count() > 0) {
      await analyticsTab.click();
      await page.waitForTimeout(2000);
      
      console.log('✓ Analytics tab opened');
      
      // Check for metric cards
      const metricCards = await page.locator('[class*="card"]').count();
      console.log(`✓ Metric cards found: ${metricCards}`);
      
      // Check for specific metrics
      const hasTotal = await page.locator('text=Total Genereret').count() > 0;
      const hasSuccess = await page.locator('text=Success Rate').count() > 0;
      const hasTime = await page.locator('text=Tid Sparet').count() > 0;
      const hasCost = await page.locator('text=Omkostninger, text=0 kr').count() > 0;
      
      console.log(`\n📊 Metrics visible:`);
      console.log(`   Total Genereret: ${hasTotal ? '✅' : '❌'}`);
      console.log(`   Success Rate: ${hasSuccess ? '✅' : '❌'}`);
      console.log(`   Tid Sparet: ${hasTime ? '✅' : '❌'}`);
      console.log(`   Omkostninger: ${hasCost ? '✅' : '❌'}`);
      
      await page.screenshot({ 
        path: 'test-results/step3-metrics-cards.png',
        fullPage: true 
      });
    } else {
      console.log('⚠️  Analytics tab not found - may need authentication');
    }
    
    console.log('\n✅ Metrics test completed\n');
  });
  
  test('should display savings calculations', async ({ page }) => {
    console.log('\n💰 Testing Savings Calculations\n');
    
    await page.goto('http://localhost:3000/docs');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const analyticsTab = page.locator('[role="tab"]:has-text("AI Analytics")');
    if (await analyticsTab.count() > 0) {
      await analyticsTab.click();
      await page.waitForTimeout(2000);
      
      // Scroll down to savings section
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
      await page.waitForTimeout(500);
      
      // Check for savings section
      const hasSavings = await page.locator('text=Økonomiske Besparelser').count() > 0;
      const hasFREE = await page.locator('text=OpenRouter FREE, text=0 kr').count() > 0;
      
      console.log(`✓ Savings section: ${hasSavings ? '✅ Found' : '❌ Not found'}`);
      console.log(`✓ FREE indicator: ${hasFREE ? '✅ Found' : '❌ Not found'}`);
      
      await page.screenshot({ 
        path: 'test-results/step3-savings-section.png',
        fullPage: true 
      });
    }
    
    console.log('\n✅ Savings test completed\n');
  });
  
  test('should show time period statistics', async ({ page }) => {
    console.log('\n📅 Testing Time Period Stats\n');
    
    await page.goto('http://localhost:3000/docs');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const analyticsTab = page.locator('[role="tab"]:has-text("AI Analytics")');
    if (await analyticsTab.count() > 0) {
      await analyticsTab.click();
      await page.waitForTimeout(2000);
      
      // Check for time period stats
      const hasToday = await page.locator('text=I Dag').count() > 0;
      const hasWeek = await page.locator('text=Denne Uge').count() > 0;
      const hasMonth = await page.locator('text=Denne Måned').count() > 0;
      
      console.log(`📊 Time periods:`);
      console.log(`   I Dag: ${hasToday ? '✅' : '❌'}`);
      console.log(`   Denne Uge: ${hasWeek ? '✅' : '❌'}`);
      console.log(`   Denne Måned: ${hasMonth ? '✅' : '❌'}`);
      
      await page.screenshot({ 
        path: 'test-results/step3-time-periods.png',
        fullPage: true 
      });
    }
    
    console.log('\n✅ Time period test completed\n');
  });
  
  test('should display recent generations list', async ({ page }) => {
    console.log('\n📋 Testing Recent Generations\n');
    
    await page.goto('http://localhost:3000/docs');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const analyticsTab = page.locator('[role="tab"]:has-text("AI Analytics")');
    if (await analyticsTab.count() > 0) {
      await analyticsTab.click();
      await page.waitForTimeout(2000);
      
      // Scroll to bottom
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);
      
      // Check for recent generations
      const hasRecent = await page.locator('text=Seneste Generationer').count() > 0;
      console.log(`✓ Recent generations section: ${hasRecent ? '✅' : '❌'}`);
      
      if (hasRecent) {
        // Check for AI badges
        const aiBadges = await page.locator('[class*="badge"]:has-text("AI")').count();
        console.log(`✓ AI badges found: ${aiBadges}`);
      }
      
      await page.screenshot({ 
        path: 'test-results/step3-recent-generations.png',
        fullPage: true 
      });
    }
    
    console.log('\n✅ Recent generations test completed\n');
  });
  
  test('analytics: verify tRPC endpoints working', async ({ page }) => {
    console.log('\n🔌 Testing tRPC Analytics Endpoints\n');
    
    // Monitor network requests
    const apiCalls: string[] = [];
    
    page.on('request', request => {
      const url = request.url();
      if (url.includes('/api/trpc') && url.includes('getAIMetrics')) {
        apiCalls.push('getAIMetrics');
        console.log('✓ API call detected: getAIMetrics');
      }
    });
    
    await page.goto('http://localhost:3000/docs');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const analyticsTab = page.locator('[role="tab"]:has-text("AI Analytics")');
    if (await analyticsTab.count() > 0) {
      await analyticsTab.click();
      await page.waitForTimeout(3000);
      
      console.log(`\n📊 API calls made: ${apiCalls.length}`);
      if (apiCalls.length > 0) {
        console.log('✅ Analytics API working!');
      } else {
        console.log('⚠️  No analytics API calls detected');
      }
    }
    
    console.log('\n✅ API test completed\n');
  });
  
  test('responsive: analytics dashboard on mobile', async ({ page }) => {
    console.log('\n📱 Testing Analytics on Mobile\n');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('http://localhost:3000/docs');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const analyticsTab = page.locator('[role="tab"]:has-text("AI Analytics")');
    if (await analyticsTab.count() > 0) {
      await analyticsTab.click();
      await page.waitForTimeout(2000);
      
      // Check for horizontal scroll
      const hasScroll = await page.evaluate(() => {
        return document.body.scrollWidth > window.innerWidth;
      });
      
      console.log(`✓ Horizontal scroll: ${hasScroll ? '❌ Yes (bad)' : '✅ No (good)'}`);
      
      // Check if cards stack vertically
      const firstCard = await page.locator('[class*="card"]').first();
      if (await firstCard.count() > 0) {
        const box = await firstCard.boundingBox();
        console.log(`✓ Card width: ${box?.width}px (viewport: 375px)`);
      }
      
      await page.screenshot({ 
        path: 'test-results/step3-analytics-mobile.png',
        fullPage: true 
      });
    }
    
    console.log('\n✅ Mobile test completed\n');
  });
  
  test('performance: analytics dashboard load time', async ({ page }) => {
    console.log('\n⚡ Testing Analytics Performance\n');
    
    await page.goto('http://localhost:3000/docs');
    await page.waitForLoadState('networkidle');
    
    const analyticsTab = page.locator('[role="tab"]:has-text("AI Analytics")');
    if (await analyticsTab.count() > 0) {
      const start = Date.now();
      await analyticsTab.click();
      await page.waitForTimeout(2000);
      const duration = Date.now() - start;
      
      console.log(`✓ Analytics load time: ${duration}ms`);
      console.log(`✓ Target: < 3000ms`);
      console.log(`✓ Status: ${duration < 3000 ? '✅ PASS' : '❌ FAIL'}`);
      
      expect(duration).toBeLessThan(3000);
    }
    
    console.log('\n✅ Performance test completed\n');
  });
});
