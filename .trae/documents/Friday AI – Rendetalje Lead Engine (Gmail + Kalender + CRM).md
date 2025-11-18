## Formål

- Implementér en autonom “Rendetalje Lead Engine” der henter Gmail-leads, kategoriserer (P1/P2/P3/Avvist), skriver/sender opfølgningsmails i Rendetalje-tonen, foreslår kalenderbookinger, opdaterer labels/CRM og genererer en samlet rapport.

## Eksisterende Byggesten

- Gmail søgning og afsendelse:
  - `server/google-api.ts:359` `searchGmailThreads(params)`
  - `server/google-api.ts:521` `searchGmailThreadsPaged(params)`
  - `server/google-api.ts:612` `searchGmailThreadsByEmail(email)`
  - `server/google-api.ts:749` `sendGmailMessage(params)`
- Kalenderfunktioner:
  - `server/google-api.ts:1012` `listCalendarEvents(params)`
  - `server/google-api.ts:1251` `createCalendarEvent(params)`
  - `server/google-api.ts:1300` `checkCalendarAvailability(params)`
  - `server/google-api.ts:1323` `findFreeSlots(params)`
- Gmail labels:
  - `server/gmail-labels.ts:116` `getOrCreateLabel(name)`
  - `server/gmail-labels.ts:163` `ensureStandardLabels()`
  - `server/gmail-labels.ts:181` `addLabelToThread(threadId, labelName)`
  - `server/gmail-labels.ts:301` `archiveThread(threadId)`
- Orkestrering og overvågning:
  - `server/workflow-automation.ts:497` `workflowAutomation` (starter/stopper automation, proces-hooks)
  - `server/email-monitor.ts` (polling og automatisk inbox-håndtering)
  - `server/lead-source-detector.ts` (lead kilde-detektion og scoring)
- Friday systemprompt:
  - `server/friday-prompts.ts:376` `getFridaySystemPrompt()` (samler Friday’s hovedprompt + email/kalender regler)

## Implementeringstrin

1. Ny promptblok for Rendetalje

- Tilføj en dedikeret “Rendetalje Lead Engine”-blok i `server/friday-prompts.ts` og inkludér den i `getFridaySystemPrompt()` for kontekster der kører for `info@rendetalje.dk`.
- Indhold baseres på dine RULESET 1–6 (keywords, 90 dage, P1/P2/P3/Avvist, tone, rapportstruktur, autonomitet).

1. Gmail-indhentning (RULESET 1)

- Søg i indbakke+sendt for sidste 90 dage med nøgleord: “rengøring”, “fast rengøring”, “flytterengøring”, “hovedrengøring”, “tilbud”, “pris”. Brug `searchGmailThreads` og inkluder hele tråde.
- Ekstraher: navn, email, telefon (hvis muligt), type, nøgleinfo (adresse, m², ønsket dato/frekvens), “hvem skrev sidst”, “dato for sidste mail”, status (aktiv/passiv/afvist).
- Filtrér spam, automatiske mails, duplikater og tråde uden reel efterspørgsel.

1. Kategorisering (RULESET 2)

- P1: Kunden skrev sidst → vi skylder svar.
- P2: Vi skrev sidst → kunden skylder svar; opfølgning timer styres af “dage siden sidste kontakt”.
- P3: Inaktiv/kold (>14 dage) → afsluttende opfølgning + arkiv.
- Avvist: Kunden har sagt nej → markér “Closed-Lost”.
- Beregn “Dage siden” fra `lastMessageDate`; brug Gmail-trådens sidste afsender til at afgøre “hvem skrev sidst”.

1. Handlinger (RULESET 3)

- P1: Generér varm, kort, professionel mail; tjek kalender (`checkCalendarAvailability`/`findFreeSlots`) og foreslå 1–2 realistiske tider; send via `sendGmailMessage`; tilføj label `Needs Reply`.
- P2: Ventetid >3 dage → venlig opfølgning; >10 dage → “sidste ping”; >14 dage → flyt til P3.
- P3: Send varm afslutningsmail (“Vi lukker sagen for nu…”); tilføj label `Archive` og arkivér tråden.
- Avvist: Tilføj label `Closed-Lost`; ingen mail.

1. Mailtone og indhold (RULESET 4)

- Brug Rendetalje-stilen: varm, menneskelig, ærlig, konkret; ingen robotsprog.
- Indsæt prislogik: `349 kr/time inkl. moms`; estimeret tid og pris; “Du betaler kun faktisk tidsforbrug”.
- Skabelon styres fra promptblokken og/eller en lille helper, så pris/tider kan beregnes og indsættes konsistent.

1. Rapportering (RULESET 5)

- Generér rapport med tabeller:
  - P1: `| Navn | Email | Type | Sidste kontakt | Dage siden | Nøgleinfo |`
  - P2: `| Navn | Email | Type | Sidste kontakt | Dage siden | Hvad vi tilbød |`
  - P3: `| Navn | Email | Type | Sidste kontakt | Anbefaling |`
- “Handlinger udført i Gmail”: liste over mails sendt, labels tilføjet, kalender events oprettet.
- Tilbyd en kommando/endpoint til at køre analysen on-demand og returnere rapporten.

1. Konfiguration

- Sikr korrekt impersonation: `GOOGLE_IMPERSONATED_USER` = `info@rendetalje.dk` (`server/_core/env.ts`).
- Kalender-ID: “RenOS Automatisk Booking” mappes til `ENV.GOOGLE_CALENDAR_ID`.
- Labels: valider/udvid standardlabels via `ensureStandardLabels()` (f.eks. `Needs Reply`, `Archive`, `Closed-Lost`).
- Tilføj “dry-run” toggle, så systemet kan køre uden at sende mails i første test.

1. Orkestrering

- Indbyg engine i `workflowAutomation` (`server/workflow-automation.ts`) og kør periodisk (daglig/ugentlig) eller ved manual trigger.
- Alternativt modul: `server/email-analysis-engine.ts` som pipeline-step der kaldes fra automation.

1. Sikkerhed og kvalitet

- Rate-limit/backoff ved Gmail/Calendar API kald.
- Fail-safe: hvis kundedata er uklare, undlad at sende og markér til manuel review (RULESET 6).
- Log alle sideeffekter (sendte mails, labels, events) for sporbarhed.

1. Verifikation

- Kør “dry-run” med rapport uden udsendelser.
- Brug eksisterende manual tests:
  - `tests/manual/test-google-api.mjs` (Gmail/Calendar)
  - `server/scripts/email-smoke-test.ts` (send/søg funktioner)
- Udvalgt prøvekørsel på et begrænset datointerval (fx 7 dage) før fuld 90-dages scan.

## Leverancer

- Ny promptblok (Rendetalje Lead Engine) integreret i `getFridaySystemPrompt()`.
- Orkestreret job der kører RULESET 1–6 og producerer rapporten.
- Sikker håndtering af labels, kalenderbooking og email-sending.
- Dry-run til test og en CLI/endpoint for manuel kørsel.

## Afklaringer (antagelser)

- Kalender-ID “RenOS Automatisk Booking” svarer til eksisterende `ENV.GOOGLE_CALENDAR_ID`.
- Labels `Needs Reply`, `Archive`, `Closed-Lost` findes eller oprettes via `ensureStandardLabels()`.
- Afsenderkontoen er `info@rendetalje.dk` med serviceaccount impersonation.

Bekræft venligst planen, så implementerer jeg den derefter i koden og sætter en dry-run op inden fuld automatisk kørsel.
