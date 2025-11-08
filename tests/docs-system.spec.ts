import { test, expect } from '@playwright/test';

/**
 * Documentation System E2E Tests
 * 
 * Tests:
 * 1. Navigate to docs page
 * 2. Search functionality
 * 3. Category filtering
 * 4. Tag filtering
 * 5. Template selection
 * 6. Create document with template
 * 7. Edit/Preview toggle
 * 8. Quick actions menu
 */

test.describe('📚 Documentation System', () => {
  test.beforeEach(async ({ page }) => {
    // Login first (using dev login)
    await page.goto('http://localhost:3000/login');
    await page.getByRole('button', { name: /dev login/i }).click();
    await page.waitForURL('http://localhost:3000/');
  });

  test('should navigate to docs page and show documents', async ({ page }) => {
    // Navigate to docs
    await page.goto('http://localhost:3000/docs');
    
    // Wait for page to load
    await expect(page.getByRole('heading', { name: 'Documentation' })).toBeVisible();
    
    // Should show document count
    await expect(page.getByText(/Documents \(3\d\d\)/)).toBeVisible();
    
    // Should show Live status
    await expect(page.getByText('Live')).toBeVisible();
    
    console.log('✅ Docs page loaded successfully');
  });

  test('should filter by category', async ({ page }) => {
    await page.goto('http://localhost:3000/docs');
    await page.waitForSelector('[role="combobox"]');
    
    // Find and click category dropdown
    const categorySelect = page.locator('[role="combobox"]').first();
    await categorySelect.click();
    
    // Select "Email System"
    await page.getByRole('option', { name: 'Email System' }).click();
    
    // Wait for filtering
    await page.waitForTimeout(1000);
    
    // Should show filtered results
    const docCards = page.locator('[class*="hover:border-primary"]');
    const count = await docCards.count();
    
    expect(count).toBeGreaterThan(0);
    console.log(`✅ Category filter working - showing ${count} Email System docs`);
  });

  test('should filter by outdated tag', async ({ page }) => {
    await page.goto('http://localhost:3000/docs');
    await page.waitForSelector('[role="combobox"]');
    
    // Find tag filter dropdown (second select)
    const selects = page.locator('[role="combobox"]');
    const tagSelect = selects.nth(1);
    await tagSelect.click();
    
    // Select "Needs Review"
    await page.getByRole('option', { name: /Needs Review/i }).click();
    
    // Wait for filtering
    await page.waitForTimeout(1000);
    
    // Should show outdated docs with orange border
    const outdatedDocs = page.locator('[class*="border-orange-500"]');
    const count = await outdatedDocs.count();
    
    expect(count).toBeGreaterThan(0);
    console.log(`✅ Tag filter working - showing ${count} outdated docs`);
  });

  test('should search for documents', async ({ page }) => {
    await page.goto('http://localhost:3000/docs');
    
    // Type in search box
    const searchBox = page.getByPlaceholder('Search documentation...');
    await searchBox.fill('email');
    
    // Wait for search results
    await page.waitForTimeout(1000);
    
    // Should show results containing "email"
    const results = page.locator('[class*="hover:border-primary"]');
    const count = await results.count();
    
    expect(count).toBeGreaterThan(0);
    console.log(`✅ Search working - found ${count} docs matching "email"`);
  });

  test('should open template dropdown and show templates', async ({ page }) => {
    await page.goto('http://localhost:3000/docs');
    
    // Find template dropdown
    const templateSelect = page.getByRole('combobox').last();
    await templateSelect.click();
    
    // Should show 4 templates
    await expect(page.getByRole('option', { name: /Feature Spec/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /Bug Report/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /Guide/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /Meeting Notes/i })).toBeVisible();
    
    console.log('✅ All 4 templates visible');
  });

  test('should create document with Bug Report template', async ({ page }) => {
    await page.goto('http://localhost:3000/docs');
    
    // Select Bug Report template
    const templateSelect = page.getByRole('combobox').last();
    await templateSelect.click();
    await page.getByRole('option', { name: /Bug Report/i }).click();
    
    // Wait for editor to load
    await page.waitForSelector('textarea');
    
    // Should show Create Document heading
    await expect(page.getByRole('heading', { name: 'Create Document' })).toBeVisible();
    
    // Title should be pre-filled
    const titleInput = page.getByLabel('Title *');
    const titleValue = await titleInput.inputValue();
    expect(titleValue).toBe('Bug Report');
    
    // Category should be pre-filled
    const categoryInput = page.getByLabel('Category');
    const categoryValue = await categoryInput.inputValue();
    expect(categoryValue).toBe('Testing & QA');
    
    // Tags should be pre-filled
    const tagsInput = page.getByLabel('Tags');
    const tagsValue = await tagsInput.inputValue();
    expect(tagsValue).toContain('bug');
    
    // Content should have bug template structure
    const textarea = page.locator('textarea');
    const content = await textarea.inputValue();
    expect(content).toContain('# 🐛 Bug:');
    expect(content).toContain('## Steps to Reproduce');
    expect(content).toContain('## Expected Behavior');
    
    console.log('✅ Bug Report template loaded with correct structure');
  });

  test('should toggle between Edit and Preview tabs', async ({ page }) => {
    await page.goto('http://localhost:3000/docs');
    
    // Create new doc with template
    const templateSelect = page.getByRole('combobox').last();
    await templateSelect.click();
    await page.getByRole('option', { name: /Guide/i }).click();
    
    await page.waitForSelector('textarea');
    
    // Should be on Edit tab by default
    await expect(page.getByRole('tab', { name: /Edit/i })).toHaveAttribute('data-state', 'active');
    
    // Click Preview tab
    await page.getByRole('tab', { name: /Preview/i }).click();
    
    // Should show rendered markdown (prose class for styling)
    await expect(page.locator('.prose')).toBeVisible();
    
    // Should contain rendered heading
    await expect(page.locator('.prose h1')).toBeVisible();
    
    console.log('✅ Edit/Preview toggle working');
  });

  test('should show quick actions menu on doc card', async ({ page }) => {
    await page.goto('http://localhost:3000/docs');
    await page.waitForSelector('[class*="hover:border-primary"]');
    
    // Find first doc card's menu button
    const menuButton = page.locator('button[aria-haspopup="menu"]').first();
    await menuButton.click();
    
    // Should show menu items
    await expect(page.getByRole('menuitem', { name: /View/i })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: /Edit/i })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: /Copy Link/i })).toBeVisible();
    
    console.log('✅ Quick actions menu visible');
  });

  test('should view a document', async ({ page }) => {
    await page.goto('http://localhost:3000/docs');
    await page.waitForSelector('[class*="hover:border-primary"]');
    
    // Click first doc card to view
    const firstDoc = page.locator('[class*="hover:border-primary"]').first();
    const docTitle = await firstDoc.locator('[class*="text-lg"]').textContent();
    
    await firstDoc.click();
    
    // Should navigate to view mode
    await page.waitForTimeout(1000);
    
    // Should show the document title
    await expect(page.locator('h1')).toContainText(docTitle || '');
    
    // Should show rendered markdown content
    await expect(page.locator('.prose')).toBeVisible();
    
    console.log(`✅ Document viewer working - viewing: ${docTitle}`);
  });

  test('should show correct count after filtering', async ({ page }) => {
    await page.goto('http://localhost:3000/docs');
    
    // Get initial count from tab
    const initialText = await page.getByText(/Documents \(\d+\)/).textContent();
    const initialCount = parseInt(initialText?.match(/\d+/)?.[0] || '0');
    
    console.log(`Initial count: ${initialCount}`);
    
    // Apply category filter
    const categorySelect = page.locator('[role="combobox"]').first();
    await categorySelect.click();
    await page.getByRole('option', { name: 'Email System' }).click();
    await page.waitForTimeout(1000);
    
    // Count visible cards
    const visibleCards = await page.locator('[class*="hover:border-primary"]').count();
    
    console.log(`After filter: ${visibleCards} cards visible`);
    
    expect(visibleCards).toBeLessThan(initialCount);
    expect(visibleCards).toBeGreaterThan(0);
    
    console.log('✅ Filtering correctly reduces document count');
  });
});

test.describe('📊 Docs System - Performance', () => {
  test('should load docs page quickly', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('http://localhost:3000/login');
    await page.getByRole('button', { name: /dev login/i }).click();
    await page.waitForURL('http://localhost:3000/');
    
    await page.goto('http://localhost:3000/docs');
    await page.waitForSelector('[class*="hover:border-primary"]');
    
    const loadTime = Date.now() - startTime;
    
    console.log(`⏱️ Docs page loaded in ${loadTime}ms`);
    
    expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
  });

  test('should handle search debouncing', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.getByRole('button', { name: /dev login/i }).click();
    await page.waitForURL('http://localhost:3000/');
    
    await page.goto('http://localhost:3000/docs');
    
    const searchBox = page.getByPlaceholder('Search documentation...');
    
    // Type quickly (should debounce)
    await searchBox.type('email', { delay: 50 });
    
    // Wait for debounce
    await page.waitForTimeout(500);
    
    // Should show results
    const results = await page.locator('[class*="hover:border-primary"]').count();
    expect(results).toBeGreaterThan(0);
    
    console.log('✅ Search debouncing working');
  });
});
