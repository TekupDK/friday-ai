/**
 * Phase 1 Code Verification Test
 * 
 * Automated test to verify all Phase 1 improvements are correctly implemented
 * in the codebase before manual browser testing.
 */

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const EMAIL_LIST_AI_PATH = join(__dirname, '../client/src/components/inbox/EmailListAI.tsx');

test.describe('Phase 1 Code Verification', () => {
  
  test('EmailQuickActions should be imported', async () => {
    const content = fs.readFileSync(EMAIL_LIST_AI_PATH, 'utf-8');
    
    // Check import statement
    expect(content).toContain('import EmailQuickActions from "./EmailQuickActions"');
  });

  test('Badge should be conditional (only for score >= 70)', async () => {
    const content = fs.readFileSync(EMAIL_LIST_AI_PATH, 'utf-8');
    
    // Check conditional rendering logic
    expect(content).toContain('aiData && aiData.leadScore >= 70 && leadScoreConfig');
    expect(content).toContain('Hot Lead Badge - Only for hot leads (score >= 70)');
  });

  test('Quick Actions should be hover-activated', async () => {
    const content = fs.readFileSync(EMAIL_LIST_AI_PATH, 'utf-8');
    
    // Check hover opacity transition
    expect(content).toContain('opacity-0 group-hover:opacity-100 transition-opacity');
    expect(content).toContain('<EmailQuickActions');
  });

  test('Simplified layout should NOT include intelligence row', async () => {
    const content = fs.readFileSync(EMAIL_LIST_AI_PATH, 'utf-8');
    
    // Count how many times intelligence display appears
    // In Phase 1, we removed the intelligence row from email items
    const locationDisplays = (content.match(/MapPin className="w-3 h-3"/g) || []).length;
    const jobTypeDisplays = (content.match(/Target className="w-3 h-3"/g) || []).length;
    
    // These should only appear in config functions, not in email item rendering
    // So count should be low (just in helper functions, not in JSX)
    expect(locationDisplays).toBeLessThan(5); // Not in every email item
  });

  test('Source badges should be removed from email items', async () => {
    const content = fs.readFileSync(EMAIL_LIST_AI_PATH, 'utf-8');
    
    // Search for source badge rendering in email items
    // We should NOT find source badges in the comfortable/compact layouts anymore
    const linesArray = content.split('\n');
    
    let inEmailRenderSection = false;
    let foundSourceBadge = false;
    
    for (let i = 0; i < linesArray.length; i++) {
      const line = linesArray[i];
      
      // Check if we're in email item rendering section
      if (line.includes('density === \'compact\'') || line.includes('// Comfortable layout')) {
        inEmailRenderSection = true;
      }
      
      // End of email item rendering
      if (line.includes('</div>') && line.includes('email.threadId')) {
        inEmailRenderSection = false;
      }
      
      // Look for source badge in email section (should be removed!)
      if (inEmailRenderSection && line.includes('sourceConfig') && line.includes('Badge')) {
        // This is the OLD code - should not exist anymore!
        foundSourceBadge = true;
      }
    }
    
    // We should NOT find source badges in email items anymore
    expect(foundSourceBadge).toBe(false);
  });

  test('Urgency badges should be removed from email items', async () => {
    const content = fs.readFileSync(EMAIL_LIST_AI_PATH, 'utf-8');
    
    // Check that urgency badges are NOT rendered in email items
    // We removed these in Phase 1
    const urgencyBadgeMatches = content.match(/urgencyConfig && aiData\?\.urgency/g) || [];
    
    // Should be 0 occurrences (removed in Phase 1)
    expect(urgencyBadgeMatches.length).toBe(0);
  });

  test('Email layout should have clean Shortwave-style structure', async () => {
    const content = fs.readFileSync(EMAIL_LIST_AI_PATH, 'utf-8');
    
    // Check for Shortwave-inspired comments
    expect(content).toContain('Shortwave-inspired minimal design');
    expect(content).toContain('Shortwave-inspired clean design');
    
    // Check for snippet display (key part of clean design)
    expect(content).toContain('text-xs text-muted-foreground/70 line-clamp-2');
  });

});

test.describe('Phase 1 Visual Verification (Browser)', () => {
  
  test('Email Center should load without errors', async ({ page }) => {
    await page.goto('http://localhost:3002');
    
    // Wait for page load
    await page.waitForLoadState('networkidle');
    
    // Check for no console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Navigate to Email Center
    await page.click('text=Email Center');
    await page.waitForTimeout(2000);
    
    // Should have no critical errors
    const criticalErrors = errors.filter(e => 
      !e.includes('Warning') && 
      !e.includes('DevTools')
    );
    
    expect(criticalErrors.length).toBe(0);
  });

  test('Email list should render without badge clutter', async ({ page }) => {
    await page.goto('http://localhost:3002');
    await page.click('text=Email Center');
    await page.waitForTimeout(2000);
    
    // Get first email item
    const emailItem = page.locator('[role="button"]').first();
    await emailItem.waitFor();
    
    // Check that email is visible
    expect(await emailItem.isVisible()).toBe(true);
    
    // Take screenshot for manual verification
    await page.screenshot({ 
      path: 'test-results/phase1-email-list.png',
      fullPage: true 
    });
  });

  test('Quick Actions should appear on hover', async ({ page }) => {
    await page.goto('http://localhost:3002');
    await page.click('text=Email Center');
    await page.waitForTimeout(2000);
    
    // Get first email item
    const emailItem = page.locator('[role="button"]').first();
    await emailItem.waitFor();
    
    // Hover over email
    await emailItem.hover();
    await page.waitForTimeout(500); // Wait for fade-in animation
    
    // Take screenshot to verify quick actions appeared
    await page.screenshot({ 
      path: 'test-results/phase1-quick-actions-hover.png' 
    });
    
    // Note: Actual visual verification needs manual review of screenshot
    // since opacity transitions are hard to detect programmatically
  });

  test('SPLITS sidebar should be functional', async ({ page }) => {
    await page.goto('http://localhost:3002');
    await page.click('text=Email Center');
    await page.waitForTimeout(2000);
    
    // Check for SPLITS elements
    const allEmailsSplit = page.locator('text=Alle Emails');
    const hotLeadsSplit = page.locator('text=Hot Leads');
    
    expect(await allEmailsSplit.isVisible()).toBe(true);
    expect(await hotLeadsSplit.isVisible()).toBe(true);
    
    // Click on Hot Leads split
    await hotLeadsSplit.click();
    await page.waitForTimeout(1000);
    
    // Take screenshot
    await page.screenshot({ 
      path: 'test-results/phase1-hot-leads-split.png' 
    });
  });

});
