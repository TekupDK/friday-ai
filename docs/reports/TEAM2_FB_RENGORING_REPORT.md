# Team 2 FB Rengøring Rapport

## Oversigt

Denne rapport analyserer Team 2 medarbejderes arbejdstid på "fb rengøring" (fast rengøring) opgaver for de sidste 14 dage (eller et andet antal dage).

## Hvad analyseres?

Rapporten sammenligner fire typer tidsdata:

1. **Kalendertid** - Tiden fra kalenderopgaver (startTime til endTime)
2. **Aftalt tid** - Tiden aftalt i Gmail tråde (tilbud, bekræftelser)
3. **Faktureret tid** - Tiden faktureret i fakturaer
4. **Faktisk arbejdstid** - Den faktiske tid brugt (ekstraheret fra Gmail tråde)

## Omkostningsberegning

Alle omkostninger beregnes som:
```
Omkostning = Timer × Antal personer × 90 DKK/time
```

## Brug

### Via tRPC API

```typescript
const result = await trpc.reports.team2FbRengoring.query({
  daysBack: 14, // Antal dage tilbage (standard: 14)
});

// Resultat indeholder:
// - summary: Oversigt med totals
// - tasks: Detaljeret liste over opgaver
// - report: Markdown rapport
```

### Via Kommandolinje

```bash
# Kør scriptet direkte
npx tsx server/scripts/team2-fb-rengoring-report.ts [daysBack]

# Eksempel: Sidste 14 dage (standard)
npx tsx server/scripts/team2-fb-rengoring-report.ts

# Eksempel: Sidste 30 dage
npx tsx server/scripts/team2-fb-rengoring-report.ts 30
```

Rapporten gemmes automatisk i `reports/team2-fb-rengoring-YYYY-MM-DD.md`

## Filtrering

Rapporten filtrerer for:

- **Team 2**: Opgaver hvor team info er "2" eller "Team 2"
- **FB Rengøring**: Opgaver der indeholder "fb rengøring", "fb rengoring", "fast rengøring", eller "fast rengoring" i titel eller beskrivelse
- **Periode**: Sidste N dage (standard: 14)
- **Status**: Kun bekræftede kalenderopgaver (status = "confirmed")

## Datakilder

### Kalendertid
- Hentes fra `calendar_events` tabellen
- Beregnet som `endTime - startTime`

### Aftalt tid
- Ekstraheret fra Gmail tråde (`emails` tabellen)
- Søger efter mønstre som "X timer", "X arbejdstimer", "X personer × Y timer"

### Faktureret tid
- Hentes fra `customer_invoices` tabellen
- Ekstraheret fra fakturabeskrivelse eller beregnet fra beløb ÷ 349 DKK/time

### Faktisk arbejdstid
- Ekstraheret fra Gmail tråde
- Søger efter mønstre som "vi brugte X timer", "arbejdede X timer", "faktisk X timer"

## Rapportformat

Rapporten genereres som Markdown og indeholder:

1. **Oversigt** - Tabel med totals for alle metrikker
2. **Detaljeret opgaveliste** - Tabel med alle opgaver og deres data
3. **Noter** - Forklaringer og særlige noter

## Eksempel output

```markdown
# Team 2 FB Rengøring Rapport

**Periode:** 15. januar 2025 - 29. januar 2025
**Antal opgaver:** 12
**Lønpris:** 90 DKK/time pr. person

## Oversigt

| Metrik | Timer | Omkostning (DKK) |
|--------|-------|------------------|
| Kalendertid | 48.00 | 8,640.00 |
| Aftalt tid | 45.00 | 8,100.00 |
| Faktureret tid | 46.50 | 8,370.00 |
| Faktisk arbejdstid | 47.00 | 8,460.00 |
```

## Fejlhåndtering

- Manglende data håndteres gracefully (returnerer 0)
- Hvis ingen opgaver findes, vises en besked
- Database fejl logges og kastes videre

## Begrænsninger

- Team info skal være eksplicit angivet i kalenderopgaver
- Faktisk arbejdstid kræver at medarbejdere rapporterer i Gmail tråde
- Faktureret tid kan være unøjagtig hvis fakturabeskrivelse mangler

## Forbedringer

Fremtidige forbedringer kunne inkludere:

- Eksport til Excel/CSV
- Grafisk visualisering
- Sammenligning med andre teams
- Automatisk email-rapportering
- Integration med tidsregistreringssystem




