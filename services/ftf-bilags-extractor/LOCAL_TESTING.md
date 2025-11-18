# Lokal Test Guide

## ✅ Status: Klar til lokal test

Projektet er færdigt og klar til lokal test. PDF-parsing logikken er verificeret med sample data.

## Hurtig Start

### 1. Installer dependencies (hvis ikke allerede gjort)

```bash
cd services/ftf-bilags-extractor
pnpm install
```

### 2. Test PDF-parsing med din fil

**Placer PDF-filen** i test-data mappen:
```bash
# Kopier din PDF fil til:
cp "C:\Users\empir\Tekup\services\tekup-ai-v2\foodtruck fiesta\Åbenstående 2+3 kvt. 2025.pdf" \
   test-data/Åbenstående\ 2+3\ kvt.\ 2025.pdf
```

**Eller på Windows:**
```powershell
Copy-Item "C:\Users\empir\Tekup\services\tekup-ai-v2\foodtruck fiesta\Åbenstående 2+3 kvt. 2025.pdf" `
           "services\ftf-bilags-extractor\test-data\Åbenstående 2+3 kvt. 2025.pdf"
```

### 3. Se ekstraheret tekst fra PDF

```bash
pnpm view-pdf "test-data/Åbenstående 2+3 kvt. 2025.pdf"
```

Dette viser den rå tekst, som `pdf-parse` ekstraherer fra PDF'en.

### 4. Test parsing (dry-run)

```bash
pnpm start --input "test-data/Åbenstående 2+3 kvt. 2025.pdf" --output ./test-output --dry-run
```

Dette vil:
- Parse PDF'en og ekstrahere transaktioner
- Gætte leverandører for hver transaktion
- Generere en rapport (men ikke downloade fra Gmail endnu)

### 5. Tjek resultaterne

```bash
# Se rapporten
cat test-output/report.json | jq '.'  # hvis du har jq installeret
# Eller bare:
cat test-output/report.json

# Se CSV rapporten
cat test-output/report.csv
```

## Næste Skridt: Gmail Integration

Når PDF-parsing virker korrekt, kan du teste Gmail-integrationen:

1. **Første gang - autoriser Gmail:**
   ```bash
   pnpm start --input "test-data/Åbenstående 2+3 kvt. 2025.pdf" --output ./test-output
   ```
   Følg instruktionerne i konsollen for at autorisere Gmail.

2. **Efter autorisering** vil tokens blive gemt i `~/.config/ftf-bilag-extractor/token.json`

## Filstruktur

```
services/ftf-bilags-extractor/
├── src/
│   ├── bankImport.ts      # PDF/XLS/CSV parsing
│   ├── gmailAuth.ts       # OAuth2 flow
│   ├── gmailClient.ts     # Gmail API wrapper
│   ├── matcher.ts         # Matching logic
│   ├── supplierMapping.ts # Supplier detection
│   ├── dedupe.ts          # SHA-256 deduplication
│   ├── report.ts          # Report generation
│   └── cli.ts             # CLI entry point
├── test-data/             # Placer PDF her
├── test-output/           # Output fra tests
└── .env                   # OAuth credentials (ikke i git)
```

## Troubleshooting

### PDF parsing fejler
- Tjek at PDF'en er i `test-data/` mappen
- Kør `pnpm view-pdf` for at se om tekst ekstraktion virker
- Tjek `TEST_RESULTS.md` for eksempler på hvad der forventes

### Build fejler
```bash
pnpm install  # Installer dependencies
pnpm build    # Byg projektet
```

### Gmail auth fejler
- Tjek at `.env` filen indeholder korrekte credentials
- Se `SETUP.md` for detaljerede instruktioner

## Dokumentation

- `README.md` - Komplet dokumentation
- `SETUP.md` - Setup guide
- `TEST_RESULTS.md` - PDF parsing test resultater
- `HOW_TO_TEST.md` - Detaljeret test guide
