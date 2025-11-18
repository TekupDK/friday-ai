## Mål og Principper

- Udvid Friday AI v2 med en mobil-først oplevelse, der matcher Apple UI og bevarer 3‑panel arkitekturen i en kondenseret form.

- Genbrug eksisterende paneler og hooks, undgå dobbelt‑logik, og hold tema/typografi konsistent.

## Arkitektur & Navigation

- Opret en mobil skal: `client/src/mobile/MobileShell.tsx` med bund‑tabbar.

- Ruter: tilføj `/m` route i `client/src/App.tsx:51-58` og lazy‑load mobilskallen.

- Tabs (bundnavigation): Home, Chat, Email, Workspace, Settings.

- Bevar desktop flow uændret; mobil og desktop ruter lever side‑om‑side.

## Genbrug af Eksisterende Dele

- Chat: brug `AIAssistantPanelV2` (lazy) – allerede tilgængelig via `WorkspaceLayout.tsx:42-44`.

- Email: brug `EmailCenterPanel` – se `WorkspaceLayout.tsx:45-47`.

- Workspace: brug `SmartWorkspacePanel` – se `WorkspaceLayout.tsx:48-50`.

- Apple UI: brug komponenter fra `client/src/components/crm/apple-ui` (fx `AppleButton`, `AppleCard`, `AppleInput`).

- Auth: fortsæt med `useAuth` fra `@/_core/hooks/useAuth` som i `App.tsx:24-41`.

- Tema: brug eksisterende `ThemeProvider` (`App.tsx:100-112`).

## Skærme (Mobil)

- `client/src/mobile/tabs/HomeTab.tsx`
  - Kondenseret “3‑panel” oversigt: mini‑kort for AI, Email, Workspace.

  - Check‑in status, system badges (DB, Billy, Google) som i headeren `WorkspaceLayout.tsx:181-253`.

- `client/src/mobile/tabs/ChatTab.tsx`
  - Wrapper der renderer `AIAssistantPanelV2` fuldskærm, med mobile header og hurtige handlinger.

  - Voice input (Web Speech API) via `client/src/hooks/useVoiceInput.ts`.

- `client/src/mobile/tabs/EmailTab.tsx`
  - Renderer `EmailCenterPanel` med swipe‑gestures (listet UI‑adfærd), quick‑reply chips og trådvisning tilpasset mobil.

- `client/src/mobile/tabs/WorkspaceTab.tsx`
  - Renderer `SmartWorkspacePanel` til team‑kontekst, mål og næste skridt.

- `client/src/mobile/tabs/SettingsTab.tsx`
  - Integrations (Gmail/Calendar/Billy), tema (lys/mørk/system), notifikationer.

## Friday Check‑in (Mobil Wizard)

- `client/src/mobile/checkin/CheckInWizard.tsx`
  - Trin: Wins → Blockers → Mood (emoji) → Goals → Review.

  - Brug `AppleCard` for hvert trin, progressindikator og `AppleButton` CTA’er.

  - Forbind til eksisterende data (emails/CRM) via trpc.

## PWA, Notifikationer & Deling

- PWA: `public/manifest.webmanifest` + `public/service-worker.js` for offline cache og push.

- Push: web‑push for reminders (server understøttelse skitseres), fallback til email hvis push ikke er aktiveret.

- Native deling: brug Web Share API til “Share to Slack/Link”; Slack via eksisterende backend‑integration hvis tilgængelig.

## Offline & Caching

- Brug TanStack Query persistering med `localStorage` for mobil.

- Kø‑baserede mutationer ved offline; synkroniser ved genopkobling.

- Cache warming som i `App.tsx:76-95`, udvidet til mobil ruter.

## Tema & Apple UI Konsistens

- Typografi: SF Pro (som i `AppleUIDemo.tsx:33`).

- Farver: systemfarver; primær blå til Apple‑CTA, respekt for eksisterende tema.

- Mikrointeraktioner: bløde skygger, elevation og haptisk feedback (web‑simuleret).

## Data & API’er

- TRPC: genbrug klienten `client/src/lib/trpc.ts` til alle mobilskærme.

- Auth‑flow identisk med desktop; session deles mellem `/` og `/m`.

## Test & Verifikation

- Storybook: mobil‑stories for HomeTab/CheckInWizard.

- Unit: Vitest for hooks (fx `useVoiceInput`).

- E2E: Playwright mobil viewport (iPhone 14) for tab‑navigation, check‑in og deling.

## Leverancer (Filer & Opdateringer)

- Nye: `mobile/MobileShell.tsx`, `mobile/tabs/*`, `mobile/checkin/CheckInWizard.tsx`, `hooks/useVoiceInput.ts`, `public/manifest.webmanifest`, `public/service-worker.js`.

- Opdater: `client/src/App.tsx` for `/m` route, evt. små helpers til system badges (genbrug fra workspace header).

## Faser

1. Mobil shell + bund‑tabbar + `/m` route.

1. ChatTab (AIAssistantPanelV2 wrapper) + voice input.

1. EmailTab (swipes, quick replies) + performance tweaks.

1. HomeTab + system badges + check‑in CTA.

1. Check‑in wizard end‑to‑end (TRPC integration).
1. WorkspaceTab + team features.

1. PWA/offline/push + Web Share.

1. Tests, Storybook og QA.

## Risici & Afbødning

- Push notifikationer kræver bruger‑samtykke → fallback til email.

- Web Speech API understøttelse varierer → fallback til klassisk input.

- Offline sync konflikter → vis review‑dialog før endelig merge.

## Godkendelse

- Når planen er godkendt, implementerer jeg fase 1–2 først og demonstrerer mobilruten med bundtabs, ChatTab og voice input i en lokal preview.
