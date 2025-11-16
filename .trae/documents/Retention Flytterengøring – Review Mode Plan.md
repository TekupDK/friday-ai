## Mål

- Kør en review-version af retention-kampagnen uden at sende mails til kunder.
- Find 5–10 relevante tråde i Gmail baseret på den angivne søgequery.
- Generér personlige mailkladder for hver kunde (varm, menneskelig, uden emojis/rabat/hårdt salg).
- Saml en oversigt og klargør en review-mail til Jonas.
- Returnér et JSON-debug‑output for Trae.ai.

## Datakilder og Søgning (Gmail)

- Gmail query: `(label:Kunder OR label:"Flytterengøring" OR subject:flytterengøring OR "move out cleaning") AND -label:Retention AND -label:Marketing AND -label:Klager`.
- Brug direkte Gmail API med servicekonto (domæne‑delegering) via `searchGmailThreads` i `server/google-api.ts:356`.
- Hent max 20 tråde, filtrér ned til 5–10 bedst matchede (flytterengøring‑relevans + ingen klage‑label).
- Notér `threadId` fra Gmail som stabil reference til hver kunde.

## Feltudledning pr. tråd

- Navn: udtræk display‑navn fra `From` header; fallback: første ord i mailbody med hilsen (“Hej …”).
- Email: udtræk e‑mail fra `From` header (`server/google-api.ts:417`).
- Sammendrag: brug `snippet` og sidste beskeds `body` (afkortet) (`server/google-api.ts:443`, `420–425`).
- Er opgaven flytterengøring: match på `label:"Flytterengøring"`, `subject:flytterengøring`, eller indhold der matcher "flytterengøring"/"move out cleaning".
- Sidste kontakt: sidste beskeds `date` (`server/google-api.ts:450–451`).
- Adresse: heuristik (Dk‑adresseformat): vejnavn + nr. + 4‑cifret postnummer; fallback: linjer med “Adresse:”/“Addresse:”.
- Tilfredshed: “tilfreds/neutral” hvis ingen `Klager`‑label og body indeholder tak/positiv frasering; ellers “neutral”.

## Kladdetekst (per kunde)

- Tone: varm, menneskelig, ærlig; ingen emojis; ingen rabatter; ingen hårdt salg.
- Indhold der flettes naturligt:
  - Vi hjalp med flytterengøring; håber I er faldet godt til i den nye bolig.
  - Mange flyttekunder får hjælp i starten (bad/kalk, køkken, støv, vinduer).
  - Tilbyd: ugentlig, hver 14. dag, eller “kom‑godt‑i‑gang” hovedrengøring.
  - Timepris: `349 kr inkl. moms`, svanemærkede produkter.
  - Område: Aarhus og omegn.
  - Foreslå tider: `torsdag kl. 10` eller `fredag formiddag`.
  - Varm og professionel afslutning.
- Oprettelse som Gmail‑kladde via `createGmailDraft(to, subject, body)` (`server/google-api.ts:699–744`).
- Sikkerhed: ingen kald til `sendGmailMessage` i review‑mode (`server/google-api.ts:749–804`).

## Etiketter og Sikkerhed

- Søgning udelukker `Retention`, `Marketing`, `Klager` via query.
- Valgfrit: tilføj intern label til kladder (f.eks. `Retention-Testbatch`) først ved produktionsgodkendelse.
- Ingen udsendelse til kunder i review‑mode.

## Review‑oversigt til Jonas

- Form: én mail med emne: `Review: Retention flytterengøringskampagne (kladder)`.
- Body indeholder blokke for 5–10 kunder i formatet:

```text
  Kunde #X
  Navn:
  Email:
  Tråd-id:
  Sammendrag:
  Foreslået e-mail:
  -----------------------------------------

  ```

- Selve review‑mailen kan oprettes som intern draft til senere afsendelse.

## Debug JSON (Trae.ai)

- Returnér:

  ```json
  {
    "status": "review_ready",
    "batch_count": <antal_i_batch>,
    "sent_to": "<jonasabde@icloud.com>",
    "note": "Ingen kunde-mails sendt. Kun kladder genereret."
  }

  ```

## Eksisterende Moduler at Genbruge

- Gmail API: `searchGmailThreads` `server/google-api.ts:356`, `getGmailThread` `624`, `createGmailDraft` `699`.
- Tool‑handlers for robusthed (retries): `handleCreateGmailDraft` i `server/friday-tool-handlers.ts:454–471`.
- Label‑mapping: `gmail-labels.ts` (navne/ID’er) til visning.

## Produktionsskift ved “Godkend”

- Udvid søgning til alle kvalificerede kunder; generér og send via `sendGmailMessage` (`server/google-api.ts:749–804`).
- Opdater CRM (customers/leads) via eksisterende routers (`server/customer-router.ts`, `server/routers/crm-*`).
- Send statusrapport til Jonas med totaler (sendte, bounce, svar).
