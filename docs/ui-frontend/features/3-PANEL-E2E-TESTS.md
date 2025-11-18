# 3-Panel Layout E2E Test Documentation

## Overview

Comprehensive E2E test suite for the Friday AI 3-panel workspace layout system. Tests cover desktop layout, mobile responsiveness, keyboard navigation, panel resizing, error boundaries, and lazy loading.

## Test File Location

`tests/3-panel-layout.spec.ts`

## Test Suites

### 1. Desktop Layout Tests

#### Test: Render All Three Panels

**Purpose**: Verify all three panels (AI Assistant, Email Center, Workflow) render correctly on desktop viewport.

**Steps**:

1. Login with dev credentials
1. Set viewport to 1920x1080
1. Wait for all panels to load (timeout: 10s)
1. Verify each panel is visible

**Assertions**:

- AI Assistant panel is visible
- Email Center panel is visible
- Workflow panel is visible

#### Test: Correct Panel Sizing

**Purpose**: Verify panels have correct initial proportions (AI: 25%, Email: 50%, Workflow: 25%).

**Steps**:

1. Wait for AI panel to load
1. Get bounding boxes for all three panels
1. Calculate width ratios

**Assertions**:

- Email panel is ~2x the width of AI panel
- Ratio is between 1.5 and 2.5 (allows for flex)

#### Test: Panel Resize with Drag Handles

**Purpose**: Verify users can resize panels by dragging resize handles.

**Steps**:

1. Get initial AI panel width
1. Find first resize handle
1. Drag handle 100px to the right
1. Wait 500ms for resize completion
1. Get new AI panel width

**Assertions**:

- AI panel width increased after drag

---

### 2. Keyboard Navigation Tests

#### Test: Focus AI Panel with Ctrl+1

**Purpose**: Verify Ctrl+1 focuses the AI Assistant panel.

**Steps**:

1. Press Ctrl+1
1. Wait 200ms for focus to apply
1. Check if AI panel or its descendants have focus

**Assertions**:

- AI panel or child element is focused

#### Test: Focus Email Panel with Ctrl+2

**Purpose**: Verify Ctrl+2 focuses the Email Center panel.

**Assertions**:

- Email panel or child element is focused

#### Test: Focus Workflow Panel with Ctrl+3

**Purpose**: Verify Ctrl+3 focuses the Workflow panel.

**Assertions**:

- Workflow panel or child element is focused

#### Test: Alt Key Alternative Shortcuts

**Purpose**: Verify Alt+1/2/3 works as alternative to Ctrl+1/2/3.

**Steps**:

1. Press Alt+2 to focus Email panel
1. Wait 200ms
1. Verify focus

**Assertions**:

- Email panel receives focus via Alt shortcut

---

### 3. Mobile Responsive Tests

#### Test: Single Panel on Mobile

**Purpose**: Verify only AI Assistant panel displays on mobile viewport.

**Steps**:

1. Set viewport to 375x667 (iPhone SE)
1. Wait for layout to render

**Assertions**:

- AI panel visible in mobile layout
- Desktop 3-panel layout is hidden

#### Test: Email Drawer Opens on Menu Click

**Purpose**: Verify mobile menu button opens email drawer.

**Steps**:

1. Find mobile menu button
1. Click menu button
1. Wait 500ms for drawer animation

**Assertions**:

- Drawer dialog is visible
- Contains Email Center panel

#### Test: Drawer Closes on Outside Click

**Purpose**: Verify clicking overlay closes the mobile drawer.

**Steps**:

1. Open drawer via menu button
1. Click on overlay/backdrop
1. Wait 500ms

**Assertions**:

- Drawer is no longer visible

---

### 4. Lazy Loading Tests

#### Test: Loading Skeletons Display

**Purpose**: Verify loading skeletons appear while panels load.

**Steps**:

1. Navigate to root path
1. Quickly check for loading text

**Assertions**:

- Loading skeleton briefly visible (if timing allows)
- Panels eventually load and become visible

#### Test: Independent Panel Loading

**Purpose**: Verify each panel loads as separate code chunk.

**Steps**:

1. Monitor network requests
1. Filter for .js files containing "Panel" or "chunk"
1. Navigate to root

**Assertions**:

- Multiple separate chunk files loaded
- Indicates successful code splitting

---

### 5. Error Boundary Tests

#### Test: Panel Error Isolation

**Purpose**: Verify error in one panel doesn't crash entire app.

**Steps**:

1. Simulate error in AI panel (DOM manipulation)
1. Check other panels remain functional

**Assertions**:

- Email and Workflow panels remain visible
- App continues to function

#### Test: Error Recovery UI

**Purpose**: Verify error boundary structure exists.

**Steps**:

1. Check page content for error boundary presence

**Assertions**:

- Page content exists and is valid

#### Test: Panel Reset After Error

**Purpose**: Verify structure for reset functionality exists.

**Steps**:

1. Count panels with data-testid

**Assertions**:

- At least 3 panels present in DOM

---

### 6. Panel State Management Tests

#### Test: State Persists During Resize

**Purpose**: Verify panel state is maintained when resizing.

**Steps**:

1. Select email tab
1. Resize panel via drag handle
1. Verify panel remains visible with same state

**Assertions**:

- Email panel visible after resize
- Selected tab state preserved

#### Test: Minimum Size Constraints

**Purpose**: Verify panels respect minimum size constraints.

**Steps**:

1. Get initial AI panel width
1. Try to drag resize handle far left (below minimum)
1. Check final width

**Assertions**:

- Panel width stays above minimum (15% of viewport)
- Minimum constraint enforced

---

## Running Tests

### Run All E2E Tests

````bash
npm run test:e2e

```text

### Run Only 3-Panel Tests

```bash
npx playwright test 3-panel-layout

```text

### Run in UI Mode (Interactive)

```bash
npx playwright test 3-panel-layout --ui

```text

### Run Specific Test Suite

```bash
npx playwright test -g "Desktop Layout"
npx playwright test -g "Keyboard Navigation"
npx playwright test -g "Mobile Responsive"

```text

### Debug Mode

```bash
npx playwright test 3-panel-layout --debug

````

---

## Test Data Requirements

### Authentication

- Uses dev login endpoint: `/api/auth/login`
- Requires backend running on `http://localhost:3000`
- Test user automatically authenticated

### Browser Configuration

- **Desktop viewport**: 1920x1080
- **Mobile viewport**: 375x667
- **Timeout**: 60 seconds per test
- **Retries**: 0 (no automatic retries)

---

## Known Limitations

1. **Error Injection**: Currently uses DOM manipulation for error simulation. Real error injection would require development mode error triggers.

1. **Loading Timing**: Loading skeleton tests may not always catch the skeleton due to fast loading times.

1. **Mobile Drawer**: Menu button selector may vary; tests try multiple selectors for robustness.

1. **Resize Precision**: Resize tests allow tolerance in ratios due to flexbox rounding.

---

## Coverage Goals

- ✅ Desktop 3-panel rendering
- ✅ Panel sizing and proportions
- ✅ Resize functionality
- ✅ Keyboard shortcuts (Ctrl+1/2/3, Alt+1/2/3)
- ✅ Mobile single-panel layout
- ✅ Mobile drawer navigation
- ✅ Lazy loading verification
- ✅ Error boundary isolation
- ✅ Panel state persistence
- ✅ Minimum size constraints

---

## Future Enhancements

1. **Visual Regression Testing**: Add screenshot comparisons
1. **Performance Metrics**: Measure panel load times
1. **Accessibility Testing**: Verify ARIA attributes and screen reader support
1. **Touch Gestures**: Test mobile swipe interactions
1. **Panel Collapse**: Test panel hide/show functionality if implemented
1. **Cross-browser**: Extend tests to Safari, Firefox

---

## Maintenance

- Update test selectors if UI components change
- Adjust viewport sizes to match design system breakpoints
- Review timeout values if backend response times change
- Add new tests when features are added to panels
