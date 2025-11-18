# Phase 0 – Apple UI Theme Verification

## Formål

- Verificere at Apple UI komponenter skifter tema korrekt (light/dark) via `data-theme` og/eller system preferencer.

- Få 11/11 PASS med deterministisk verifikationsflow, uafhængigt af dev/HMR.

## Komponenter

- AppleButton, AppleInput, AppleModal, AppleBadge, AppleCard, ScrollToTop, AppleSearchField, AppleListItem, AppleDrawer, AppleSheet, AppleTag

## Storybook Opsætning

- Statisk build for stabil runtime:
  - `npm run build-storybook`

  - `pnpm dlx serve storybook-static -l 6006 --no-clipboard`

## Story IDs

- Manager viser “kind” IDs (fx `apple-ui-applebutton`). Konkrete stories følger mønsteret:
  - `apple-ui-<component>--<storyname>`

  - Eksempler:
    - AppleBadge: `new`, `active`, `vip`, `at-risk`, `all-statuses`, `all-sizes`

    - AppleButton: `primary`, `secondary`, `tertiary`, `small`, `medium`, `large`, `with-left-icon`, `with-right-icon`, `loading`, `disabled`, `full-width`, `all-variants`

    - AppleInput: `default`, `with-left-icon`, `with-helper-text`, `with-error`, `all-states`

    - AppleCard: `elevated`, `filled`, `glass`, `outlined`, `all-variants`

    - AppleModal: `default`, `without-title`, `large-modal`

    - ScrollToTop: `default`, `custom-threshold`

## Verifikationsscript

- Fil: `scripts/verify-phase0-components.mjs`

- Arkitektur:
  - Playwright (Chromium) per komponent (page isolation)

  - Discovery af IDs via manager + generering af kandidat‑stories

  - Toggling af `data-theme` på `documentElement` og `#storybook-root`

  - Stil‑sampling med brede selektorer og fallback til inline styles

  - Rapport: `test-results/phase0-verification/report.json`

## Hurtig Kørsel

1. Build og serve Storybook statisk
   - `npm run build-storybook`

   - `pnpm dlx serve storybook-static -l 6006 --no-clipboard`

1. Kør verifikationen
   - `node scripts/verify-phase0-components.mjs`

1. Se resultater
   - `test-results/phase0-verification/stories.json`

   - `test-results/phase0-verification/report.json`

## Fejlfinding

- Connection refused
  - Sørg for at statisk server kører på `<http://localhost:6006/`>

- PASS/FAIL er ens (ingen forskel)
  - Vent efter tema‑toggle (`await page.waitForTimeout(500-1000ms)`)

  - Sample inline styles (`el.style.color`, `el.style.backgroundColor`)

  - Udvid selektorer til at matche selve komponentens DOM (fx `[class*='AppleBadge']`, `button`, `input`)

- Story ikke fundet
  - Brug kendte storynavne (se ovenfor) sammen med `apple-ui-<component>--<storyname>`

## Acceptkriterier

- 11/11 komponenter PASS med dokumenterede forskelle mellem light/dark.
