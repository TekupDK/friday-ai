# Kopier PDF og Test

## Trin 1: Kopier PDF-filen til workspace

Din PDF-fil er på Windows-stien:
```
C:\Users\empir\Tekup\services\tekup-ai-v2\foodtruck fiesta\Åbenstående 2+3 kvt. 2025.pdf
```

For at teste i workspace, skal du kopiere den til en af disse steder:

### Option A: I test-data mappen (anbefalet)
```bash
# Fra workspace root:
cp "/path/to/your/local/file/Åbenstående 2+3 kvt. 2025.pdf" services/ftf-bilags-extractor/test-data/
```

### Option B: Brug direkte sti
Du kan også bruge den fulde sti direkte i kommandoerne nedenfor.

## Trin 2: Test PDF-parsing

Når filen er kopieret, kør disse kommandoer:

### 2a. Se PDF-indhold (debug)
```bash
cd services/ftf-bilags-extractor
pnpm view-pdf "test-data/Åbenstående 2+3 kvt. 2025.pdf"
```

Dette viser:
- Antal sider
- Udpakket tekst
- Første 20 linjer

### 2b. Parse PDF (dry-run - ingen Gmail-kald)
```bash
cd services/ftf-bilags-extractor
pnpm start --input "test-data/Åbenstående 2+3 kvt. 2025.pdf" --output ./test-output --dry-run
```

Dette vil:
- Parse PDF'en til transaktioner
- Gætte leverandører
- Generere rapport (uden at downloade fra Gmail)

### 2c. Se resultater
```bash
# Se JSON rapport
cat test-output/report.json | head -50

# Se CSV rapport
cat test-output/report.csv | head -20
```

## Alternativ: Brug test-scriptet

Hvis filen er i `test-data/` mappen:
```bash
cd services/ftf-bilags-extractor
chmod +x test-pdf.sh
./test-pdf.sh "test-data/Åbenstående 2+3 kvt. 2025.pdf"
```

## Fejlfinding

Hvis du får fejl:
1. **"File not found"**: Tjek at filstien er korrekt (brug absolut sti hvis nødvendigt)
2. **"Cannot parse PDF"**: Kør `view-pdf` først for at se den udpakkede tekst
3. **"No transactions found"**: PDF'en har måske et andet format - se `view-pdf` output for at justere parseren
