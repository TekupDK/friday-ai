# CRM Brainstorm – Rendetalje Specifikke Features & Workflows

Version: 1.0.0
Dato: 2025-11-11
Status: Draft (klar til prioritering og design)

---

## Overblik

Dette dokument samler idéer og specifikke behov for Rendetalje’s rengøringsforretning, med fokus på ejendom, feltarbejde, lead intake og dansk forretningslogik.

Kilde: UI‑analyse "Rendetalje CRM Idéer" og eksisterende docs.

---

## 1) Ejendom Dashboard

Formål

- Hurtigt overblik over kundens ejendom(‑me), relevante noter, adgangsinfo og historik

Nøgleelementer

- Property kort: adresse, type (villa/lejlighed/kontor/sommerhus), m², etager, adgangskode, parkering
- Servicelog: tidligere services, fotos, materialer, varighed
- Tjeklister: standard vs. tilpassede (templates)

Workflow

1. Åbn Customer Profile → vælg Ejendom‑fanen
2. Se seneste jobs, planlagte bookinger og materialer
3. Opret ny booking direkte fra ejendomskortet

---

## 2) Mobile Field Worker App

Formål

- Enkel mobiloplevelse til udførelse af jobs, tjeklister, tidslog og fotodokumentation

Nøgleelementer

- Jobliste per dag; start/stop timer; materialer; fotos
- Offline‑capable cache; auto‑sync når online
- Enkle formularer; store touch‑mål; mørk tilstand

Workflow

1. Worker logger ind → ser dagens jobs
2. Åbner job → følger tjekliste → logger tid og materialer
3. Afslutter job → upload fotos → markér som “Complete” → trigger faktura

---

## 3) AI‑Powered Lead Intake (Fase 2)

Formål

- Hjælpe med at score og foreslå handlinger for leads; stadig manual‑first

Nøgleelementer

- Auto‑ekstraktion af nøgleoplysninger fra email/webformularer
- Forslag: “Konverter til kunde” + passende Service Template
- Churn / opportunity alerts; prioriteringsscore

Workflow

1. Lead importeres → vises i Leads Dashboard
2. AI foreslår næste skridt (assign/convert) → bruger godkender
3. Opret booking med foreslået template/pris (kan redigeres)

---

## 4) Dansk Forretningslogik

Formål

- Lokal kontekst: betalingsmetoder, sæsonmønstre, materialer, dokumentation

Nøgleelementer

- Betaling: MobilePay, Faktura (Billy)
- Sæsonlogik: flytterengøring peaks, vinduespudsning; kapacitetsplanlægning
- Materialer: standardiseret liste og forbrugstrack
- Dokumentation: fotokrav for kvalitetskontrol

Workflow

1. Booking → vælg betalingsmetode og sæsonmarkører
2. Job → følg materialetjekliste og fotokrav
3. Afslutning → faktura (Billy/MobilePay reference) → kundefeedback

---

## Supplerende Datapunkter

- Kundesegmenter
  - `status`: `new | active | inactive | vip | at_risk`
  - `tags[]`: f.eks. `"vinduespudsning"`, `"flytterengøring"`, `"erhverv"`
  - `customerType`: `private | business`

- Økonomi
  - `totalInvoiced`, `totalPaid`, `balance`, `invoiceCount`
  - Betalingskanaler: `MobilePay`, `Billy` (faktura)

- Aktivitet
  - `emailCount`, `lastContactDate`, `lastSyncDate`
  - Kalender: antal events pr. måned, no‑show rate

- Ejendom
  - Adresse, type, m², etager, adgangskode, parkering
  - Materialeforbrug pr. service; fotoarkiv til kvalitet

---

## Kapacitets- og Sæsonlogik

- Højtryk: flytninger (maj–september), efterårs/vinter vinduespudsning
- Kapacitetsplan: max jobs pr. dag/uge pr. worker; buffer til no‑shows
- Overlapdetektion: kalender events med konfliktadvarsel

---

## Materialelister (eksempler)

- Standard rengøring: universalrengøring, mikrofiberklude, moppesystem
- Vinduespudsning: skraber, sæbevand, pudseklude
- Flytterengøring: kraftigere midler, ovnrens, kalkfjerner

Registrering: pr. job logges materialer og forbrug (til senere optimering).

---

## Foto- og Kvalitetskrav

- Minimum 3 fotos pr. job: før, under, efter
- Klare retningslinjer for motiv og vinkler
- Upload fra mobil; offline support og auto‑sync

---

## Acceptkriterier (Brainstorm → Implementerbar)

- Ejendom Dashboard
  - Viser sidste 5 jobs, kommende bookinger og adgangsinfo
  - Kan oprette booking direkte; skabelonvalg fungerer

- Mobile Field Worker
  - Dagens jobliste; start/stop; materialer og fotos kan registreres
  - Offline → poster køres i kø og sync’er når online

- Lead Intake (Fase 2)
  - Auto‑ekstraktion foreslår felter; bruger godkender
  - Konvertering sætter `leadId` på `customer_profiles`

- Dansk Logik
  - MobilePay/Billy valg ved booking/fakturering
  - Sæsonmarkører påvirker planlægning (advarsler/kategorisering)

---

## Referencer & Datasporing

- Drizzle skema: `customer_profiles`, `customer_notes`, `leads`, `tasks`, `calendar_events`, `customer_invoices`
- Helper‑kode: `customer-db.ts` (profiler, noter, emails, fakturaer, kalender)
- Dokumenter: `CRM_REDESIGN_MANUAL_FIRST.md`, `CRM_MODULE_ANALYSIS.md`, `docs/CUSTOMER_PROFILE_CRM_FEATURES.md`, `docs/DATA_INTEGRATION_VERIFICATION.md`

3. Completion → faktura og planlagt opfølgning

---

## Supplerende Idéer

- Route optimization (Fase 2–3)
- Loyalty program og referrals
- VIP vs. standard segmenter; personaliserede templates
- Unified Activity Timeline (emails, fakturaer, kalender, noter)

---

## Acceptkriterier

- Ejendom‑data er first‑class og let tilgængelig i Customer Profile
- Mobile flow kan gennemføre et job end‑to‑end uden friktion
- Lead intake giver reelle tidsbesparelser uden at fjerne kontrol
- Dansk betalings-/dokumentationslogik understøttes konsekvent

---

## Næste Skridt

- Prioritér features i Fase 1 vs. Fase 2
- Design trinvise UI‑flows (wireframes)
- Afled konkrete API’er og DB‑felter fra workflows

---

## Referencer

- `CRM_MODULE_MASTER_INDEX.md`
- `CRM_MODULE_ANALYSIS.md`
- `CRM_REDESIGN_MANUAL_FIRST.md`
- `docs/CUSTOMER_PROFILE_CRM_FEATURES.md`
