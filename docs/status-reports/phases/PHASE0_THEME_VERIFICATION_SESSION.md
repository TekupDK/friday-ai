# Phase 0 Theme Verification Session - Nov 12, 2025

## Sessionssammenfatning

### Mål

Færdiggørelse af automatiseret tema-verifikation for Apple UI Phase 0 komponenter med fokus på at sikre pålidelig data-theme attribut håndtering.

### Udført Arbejde

#### 1. Verification Script Stabilisering

- **Problem**: Navigation interruptions og story ID inconsistencies

- **Løsning**: Per-component page isolation
  - Flyttede `const page = await context.newPage()` ind i component loop

  - Tilføjede `await page.close()` efter hver component test

  - Fjernede `about:blank` navigation reset der forårsagede interruptions

#### 2. Story ID Format Opdatering

- **Problem**: 5 komponenter kunne ikke findes (crm-apple-ui-\* prefix fejlede)

- **Løsning**: Opdaterede alle story IDs til `apple-ui-*` format som primary
  - Behold fallback til `crm-apple-ui-*` for bagudkompatibilitet

  - Verificerede mod Storybook's faktiske exports

#### 3. Selector Forbedring

- **Enhancement**: Bredere selectors for mere robust element matching
  - Tilføjede multiple selector options per komponent

  - Inkluderede `#storybook-root button` fallbacks

  - Håndterede både CSS Modules og almindelige class names

### Resultater

#### ✅ PASS - 5 komponenter med bekræftet theme switching

1. **AppleSearchField**
   - Light: `rgb(242,242,247)` background

   - Dark: `rgb(44,44,46)` background

   - Input color: `rgb(0,0,0)` → `rgb(255,255,255)`

1. **AppleListItem**
   - Light: `rgb(255,255,255)` background

   - Dark: `rgb(28,28,30)` background

1. **AppleDrawer**
   - Light: `rgb(255,255,255)` background

   - Dark: `rgb(28,28,30)` background

   - Backdrop: `rgba(0,0,0,0.3)` → `rgba(0,0,0,0.5)`

1. **AppleSheet**
   - Light: `rgb(255,255,255)` background

   - Dark: `rgb(28,28,30)` background

   - Backdrop: `rgba(0,0,0,0.2)` → `rgba(0,0,0,0.4)`

1. **AppleTag**
   - Light: `rgb(0,122,255)` color

   - Dark: `rgb(10,132,255)` color

#### ❌ FAIL - 6 komponenter med issues

**Story Not Found (5 komponenter):**

- AppleButton

- AppleInput

- AppleModal

- AppleBadge

- AppleCard

- Fejl: "Failed to load story" for både crm-\* og non-crm story IDs

**CSS Theme Not Working (1 komponent):**

- ScrollToTop

- Story loads successfully

- Men `lightColors === darkColors` (begge viser `rgb(255,255,255)`)

- Indikerer manglende theme CSS rules

### Teknisk Implementation

#### Verification Harness Architecture

````javascript
// Per-component page isolation
for (const component of components) {
  const page = await context.newPage()  // Isolated page

  // Try story ID candidates with port fallback
  for (const storyId of [primaryId, fallbackId]) {
    for (const port of [6006, 6007]) {
      await page.goto(`<http://localhost:${port}/iframe.html?id=${storyId}...`>)
    }
  }

  // Story load validation
  const hasError = await page.locator('.sb-errordisplay #error-message').count()
  const hasContent = await page.locator('#storybook-root > *').count()

  // Theme toggling
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'light')
    document.querySelector('#storybook-root')?.setAttribute('data-theme', 'light')
  })

  // Style sampling with multiple selectors
  const lightColors = await page.evaluate((selectors) => {
    // Find visible elements matching selectors
    // Collect backgroundColor, color, borderColor
  }, component.selectors)

  // Repeat for dark theme

  // Compare and report
  const passed = JSON.stringify(lightColors) !== JSON.stringify(darkColors)

  await page.close()  // Cleanup
}

```text

#### Key Patterns

- **Isolation**: New page per component prevents cross-contamination

- **Fallback Logic**: Multiple story IDs and ports for robustness

- **Validation**: Both error message and content checks

- **Theme Scope**: Sets data-theme on both documentElement and wrapper

- **Broad Selectors**: Multiple options increase match probability

### Næste Skridt

#### Priority 1: Fix Story ID Issues (5 komponenter)

```bash

# Check actual story exports

1. Review AppleButton.stories.tsx export names
2. Review AppleInput.stories.tsx export names
3. Review AppleModal.stories.tsx export names
4. Review AppleBadge.stories.tsx export names
5. Review AppleCard.stories.tsx export names

# Update verification script

scripts/verify-phase0-components.mjs

- Update component definitions with correct story IDs

```text

#### Priority 2: Fix ScrollToTop Theme CSS

```bash

# Review and add theme rules

client/src/components/crm/apple-ui/ScrollToTop.module.css

- Add [data-theme="light"] selectors

- Add [data-theme="dark"] selectors

- Ensure color differences between themes

```text

#### Priority 3: Re-run Verification

```bash
node scripts/verify-phase0-components.mjs

# Target: 11/11 PASS

````

### Læringer

1. **Per-component Page Isolation** er mere pålideligt end single page reuse

1. **Story ID Format** skal matche Storybook exports præcist

1. **Story Load Validation** kræver både HTTP response og DOM content checks

1. **Selectors** skal være brede nok til at håndtere varierende markup

1. **About:blank Navigation** kan forårsage interruption errors

### Files Modified

- `scripts/verify-phase0-components.mjs`: Main verification script

- `test-results/phase0-verification/report.json`: Latest verification results

### Metrics

- **Test Time**: ~30 sekunder for 11 komponenter

- **Success Rate**: 45% (5/11 PASS)

- **Target**: 100% (11/11 PASS)

- **Port**: 6006 (primary), 6007 (refuses connection)

### Technical Debt

- Story ID inconsistencies i Storybook exports

- Manglende theme CSS for ScrollToTop

- Port 6007 connectivity issues (low priority)

---

**Session End**: 2025-11-12T18:00:00Z
**Status**: Verification harness stabilized, clear path to 11/11 PASS identified
**Next Session**: Fix story IDs and CSS, achieve full verification
