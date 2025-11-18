# Sådan tester du PDF-parsing

## Situation
Din PDF-fil er på Windows-stien:
```
C:\Users\empir\Tekup\services\tekup-ai-v2\foodtruck fiesta\Åbenstående 2+3 kvt. 2025.pdf
```

Workspace kører på Linux, så filen skal kopieres til workspace først.

## Trin-for-trin test

### Trin 1: Kopier PDF til workspace

**Option A: Via Cursor/VS Code**
1. Åbn filen i Cursor (`C:\Users\empir\Tekup\services\tekup-ai-v2\foodtruck fiesta\Åbenstående 2+3 kvt. 2025.pdf`)
2. Kopier den til `services/ftf-bilags-extractor/test-data/` mappen i workspace

**Option B: Via terminal (hvis du har adgang)**
```bash
# Fra din lokale Windows-maskine, kopier til workspace
# (afhænger af hvordan workspace er sat op)
```

**Option C: Upload via Cursor**
1. Højreklik på `services/ftf-bilags-extractor/test-data/` mappen
2. Vælg "Upload" eller "Paste"
3. Indsæt PDF-filen

### Trin 2: Test PDF-visning (se indhold)

Når filen er i workspace, kør:

```bash
cd services/ftf-bilags-extractor
pnpm view-pdf "test-data/Åbenstående 2+3 kvt. 2025.pdf"
```

Dette viser:
- Antal sider i PDF'en
- Hele den udpakkede tekst
- Første 20 linjer for debugging

### Trin 3: Test PDF-parsing (dry-run)

Parse PDF'en til transaktioner uden at kalde Gmail:

```bash
cd services/ftf-bilags-extractor
pnpm start --input "test-data/Åbenstående 2+3 kvt. 2025.pdf" --output ./test-output --dry-run
```

Dette vil:
- ✅ Parse PDF'en og finde transaktioner
- ✅ Gætte leverandører (Danfoods, Dagrofa, etc.)
- ✅ Generere rapport i `test-output/`
- ❌ IKKE kalde Gmail API (dry-run mode)

### Trin 4: Se resultater

```bash
# Se JSON rapport med alle transaktioner
cat test-output/report.json | head -100

# Se CSV rapport (god til Excel)
cat test-output/report.csv | head -30

# Se samlet statistik
cat test-output/report.json | grep -o '"status":"[^"]*"' | sort | uniq -c
```

## Forventet output

Efter parsing skulle du se noget lignende:

```
📄 Importing bank statement: test-data/Åbenstående 2+3 kvt. 2025.pdf
✅ Imported 45 transactions

🔍 Matching transactions...
  [Dry-run mode: Skipping Gmail API calls]

📊 Report Summary:
  Total transactions: 45
  Found: 0 (dry-run)
  Missing: 45 (dry-run)

✅ Report generated: test-output/report.json
✅ CSV report: test-output/report.csv
```

## Fejlfinding

**Problem: "File not found"**
- Tjek at filstien er korrekt
- Brug absolut sti: `pnpm view-pdf "/workspace/services/ftf-bilags-extractor/test-data/Åbenstående 2+3 kvt. 2025.pdf"`

**Problem: "Cannot parse PDF" eller "No transactions found"**
1. Kør `view-pdf` først for at se den udpakkede tekst
2. Tjek om dato/mængde-formater matcher danske bankformater
3. Hvis nødvendigt, juster regex-patterns i `src/bankImport.ts`

**Problem: "Module not found" eller build errors**
```bash
cd services/ftf-bilags-extractor
pnpm install
pnpm build
```

## Næste skridt

Når PDF-parsing virker:
1. Test med rigtig Gmail-integration (fjern `--dry-run`)
2. Tjek matching-logikken mod faktiske emails
3. Download attachments og generer endelig rapport
