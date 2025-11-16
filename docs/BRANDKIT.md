# Friday AI Brandkit

Denne fil beskriver de fem centrale aktiver i brandkittet og hvor de bør anvendes.

## 1. Primært logo (med tekst)

- **Fil:** `client/public/brandkit/logo-full.png`
- **Indhold:** Planet-ikon + "FRIDAY AI"-wordmark.
- **Bruges til:**
  - Website-header og hero-sektioner
  - Præsentationer og pitch decks
  - Visitkort og e-mail-signaturer
  - Sociale medier bannere
  - Marketingmateriale, hvor det fulde navn skal fremgå

## 2. Ikon uden tekst (planet + ring)

- **Fil:** `client/public/brandkit/logo-icon.png`
- **Indhold:** Kun det rene planetikon.
- **Bruges til:**
  - Favicon i høj opløsning
  - Splash/loader-skærme
  - Vandmærker
  - UI-elementer med begrænset plads
  - App-interne badges

## 3. Avatar-ikon (rund baggrund)

- **Fil:** `client/public/brandkit/logo-avatar.png`
- **Indhold:** Planetikon i cirkulær badge.
- **Bruges til:**
  - Profilbilleder i chat og beskeder
  - AI-avatar i notifikationer
  - Sociale medier profilbillede / rund maskering
  - Slack/Teams integrationer

## 4. App-ikon (rounded square)

- **Fil:** `client/public/brandkit/logo-app-icon.png`
- **Indhold:** Planetikon i rundet kvadrat.
- **Bruges til:**
  - iOS/Android app-ikoner
  - Desktop PWA / pinned sites
  - OS-genveje og shortcuts
  - Store-listinger og widgets

## 5. Chat UI ikon (flat outline)

- **Fil:** `client/public/brandkit/logo-chat-icon.png`
- **Indhold:** Simplificeret, fladt ikon med outline.
- **Bruges til:**
  - Chat-knappen i Friday AI UI
  - Inline UI-ikoner (12–24 px)
  - Minimalistiske hjørneikoner
  - Tooltips og mikrointeraktioner

## Anbefalinger

- Bevar PNG-filerne som kilde til hurtig brug; overvej at supplere med SVG senere for skalering.
- Alle filer ligger i `client/public/brandkit/` og kan refereres direkte i frontend som `/brandkit/<filnavn>.png`.
- Ved nye platforme: vælg det ikon der matcher formatet (tekst vs. ikon, rund vs. kvadrat).

## Frontend usage

- Frontend konstanter findes i `client/src/const.ts` for nem og konsistent import:
  - `APP_LOGO_ICON` (compact app icon)
  - `APP_LOGO_FULL` (full wordmark + icon)
  - `APP_LOGO_AVATAR` (avatar/round)
  - `APP_LOGO_APP_ICON` (app / favicons)
  - `APP_LOGO_CHAT` (chat/icon variant)
  - `APP_LOGO` (backwards compatible alias; points to `APP_LOGO_ICON`)

Eksempel: `import { APP_LOGO_FULL } from "@/const";` og brug `src={APP_LOGO_FULL}` i komponenter hvor det er passende.
