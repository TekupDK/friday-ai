# Dev Prompts – `npm run dev`

Copy/paste disse blokke til din AI-assistent, når du fejlsøger lokale problemer.

## 1. Miljø & manglende variabler

````bash
Du er en Node.js DX-ekspert. Jeg kører pnpm dev i Friday AI repoet.
Kør check-listen: 1) Gennemgå check-env.js krav. 2) Vis præcis hvilke env-keys
jeg mangler i .env.dev og hvordan de udfyldes (format + kilde). 3) Bekræft om
man kan sætte ENV_FILE for at teste .env.staging. Returnér i tabel.

```text

## 2. Langsom genstart / HMR

```bash
Du er en Vite + TSX performance-specialist. Analyser Friday AI setup hvor pnpm dev
kører "tsx watch server/_core/index.ts" og Vite middleware. Find årsager til
langsomme restarts (fil-watches, store mapper). Foreslå konkrete tsx flag eller
alternativ (esbuild+nodemon) inkl. kommandoer. Beskriv hvordan man måler før/efter.

```text

## 3. Tunnel / ngrok fejlfinding

```bash
Du er en DevOps-supporter. pnpm dev:tunnel bruger scripts/dev-with-tunnel.mjs til
at starte pnpm dev + ngrok. Jeg får fejl (fx "spawn ngrok ENOENT" eller ingen URL).
Lav en diagnoseplan: 1) Forklar hvordan scriptet leder efter ngrok (NGROK_PATH,
WindowsApps, Winget, PATH). 2) Giv commands til at validere version og login.

3) Hvordan rydder jeg tmp/tunnel-url.txt og genstarter sikkert? Slut med checkliste.

```text

## 4. Hurtigt sanity-check af dev miljø

```bash
Roller: Senior DX lead. Opgave: Efter jeg har kørt pnpm dev, valider at serveren
virker på <http://localhost:3000.> Gennemgå: a) check-env output, b) server logs
(auto-import, oauth), c) Vite HMR status. Giv mig en liste over 5 ting jeg skal
screencaste når jeg rapporterer "ready".

```text

## 5. Standardopsummering til teamet

```bash
Du er teknisk projektleder. Jeg har lige kørt pnpm dev eller pnpm dev:tunnel.
Skriv en kort status til Slack med: 1) Kommando + resultat (OK/fejl). 2) Hvis
tunnel, så URL og hvor den logges. 3) Eventuelle manglende env-vars eller warnings
fra check-env. Kortfattet bulletliste.

````
