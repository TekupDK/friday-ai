# 📜 Tekup AI v2 - Server Logs

Dette directory indeholder automatisk genererede server logs.

## Log Filer

- **`dev-server.log`** - Development server logs (NODE_ENV=development)
- **`prod-server.log`** - Production server logs (NODE_ENV=production)

## Log Format

- **Console Output**: Pretty-formatted med farver og timestamps
- **File Output**: JSON format for let parsing og analyse

## Log Levels

- **Development**: `debug` (alle logs)
- **Production**: `info` (kun info, warn, error)

Du kan overskrive med environment variable:

```bash
LOG_LEVEL=warn pnpm run dev
```

## Læs Logs

### Live (tail latest):

```powershell
Get-Content logs/dev-server.log -Wait -Tail 50
```

### Søg efter fejl:

```powershell
Select-String -Path logs/dev-server.log -Pattern "error|ERROR"
```

### Analyse JSON logs:

```powershell
Get-Content logs/dev-server.log | ConvertFrom-Json | Where-Object { $_.level -eq 50 }
```

## Log Rotation

Logs roteres ikke automatisk. For production, anbefales det at:

1. Bruge en log rotation service (logrotate på Linux)
2. Eller tilføje `pino-roll` package for automatisk rotation

## 🚨 Vigtigt

- Log filer er ignoreret i git (.gitignore)
- Slet gamle logs manuelt hvis de bliver for store
- Undgå at logge sensitive data (passwords, API keys, etc.)
