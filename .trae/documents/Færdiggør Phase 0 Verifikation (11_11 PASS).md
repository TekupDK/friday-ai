## Mål

- Opnå fuld verifikation af Apple UI Phase 0 (11/11 PASS) og stabil theme‑måling.

## Ændringer (uden kodekørsel før godkendelse)

- Ensret alle story titles til formatet "Apple UI/<Komponent>" og bekræft at de matcher:
  - AppleButton, AppleInput, AppleModal, AppleBadge, AppleCard, ScrollToTop, AppleSearchField, AppleListItem, AppleDrawer, AppleSheet, AppleTag.

- Udbyg verifikationsscriptet med robust discovery af story IDs:
  - Brug manager‑DOM eller `window.__STORYBOOK_CLIENT_API__.getStories()` til at hente faktiske `id`s.

  - Hvis kun "kind" findes (fx `apple-ui-applebutton`), generér kandidater med kendte storynavne:
    - AppleButton: `primary`, `secondary`, `tertiary`, `small`, `medium`, `large`, `with-left-icon`, `with-right-icon`, `loading`, `disabled`, `full-width`, `all-variants`

    - AppleInput: `default`, `with-left-icon`, `with-helper-text`, `with-error`, `all-states`

    - AppleModal: `default`, `without-title`, `large-modal`

    - AppleCard: `elevated`, `filled`, `glass`, `outlined`, `all-variants`

    - ScrollToTop: `default`, `custom-threshold`

    - AppleBadge: `new`, `active`, `vip`, `at-risk`, `all-statuses`, `all-sizes`

    - AppleSearchField: `default`

    - AppleListItem: `default`

    - AppleDrawer: `default`

    - AppleSheet: `default`

    - AppleTag: `new`, `all-variants`

- Forbedr målelogik og selektorer pr. komponent:
  - Vent på `#storybook-root` og indhold, tilføj korte timeouts.

  - Selektorer: `button`, `input`, `[class*="Card"]`, `[class*="Modal"]`, `[class*="Drawer"]`, `[class*="Sheet"]`, `[class*="badge|Badge|tag|Tag"]`, mm.

  - Saml `backgroundColor`, `color`, `borderColor`, `boxShadow` for 1‑3 synlige elementer.

- Theme toggling:
  - Sæt `data-theme` på `documentElement` og `#storybook-root` for `light` og `dark`.

- Rapportering:
  - Gem `stories.json` (discovery) og `report.json` (PASS/FAIL + style samples) under `test-results/phase0-verification/`.

## Kørsel efter godkendelse

- Start Storybook (`<http://localhost:6006/`>).

- Kør verifikationsscriptet.

- Iterér på eventuelle FAILs (juster CSS forskelle hvor nødvendigt, fx ScrollToTop) til vi når 11/11 PASS.

## Acceptkriterier

- `report.json` viser 11/11 PASS med dokumenterede stilforskelle mellem light/dark.

- Discovery og verifikationsflow er deterministisk og robust (ingen NoStoryMatchError).

Bekræft planen, så udfører jeg ændringerne, kører verifikationen og leverer rapporten.
