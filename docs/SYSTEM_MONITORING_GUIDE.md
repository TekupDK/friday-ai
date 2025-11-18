# System Resource Monitoring Guide

Denne guide forklarer hvordan du overvåger system ressourcer (CPU, GPU, RAM) for Tekup AI v2.

## Oversigt

Vi har to hovedværktøjer til system monitoring:

1. **Real-time Monitoring** - Overvåger system ressourcer live og logger til fil
2. **Log Analysis** - Analyserer historiske data og giver forbedringsforslag

## Quick Start

### Start Real-time Monitoring

```bash
# Basis monitoring (logger til logs/system-resources.log)
pnpm run monitor:system

# Med CSV export (til Excel/analyse)
pnpm run monitor:system:csv

# Eller direkte med PowerShell
.\scripts\monitor-system-resources.ps1
```

### Analysér Historiske Data

```bash
# Analysér sidste 24 timer
pnpm run monitor:system:analyze

# Eller direkte med PowerShell
.\scripts\analyze-system-logs.ps1 -Hours 24
```

## Detaljeret Brug

### Real-time Monitoring Script

**Fil:** `scripts/monitor-system-resources.ps1`

**Parametre:**

```powershell
# Basis brug
.\scripts\monitor-system-resources.ps1

# Med custom interval (sekunder mellem målinger)
.\scripts\monitor-system-resources.ps1 -IntervalSeconds 10

# Med tidsbegrænsning (minutter)
.\scripts\monitor-system-resources.ps1 -DurationMinutes 60

# Med CSV export
.\scripts\monitor-system-resources.ps1 -ExportCSV

# Custom log fil
.\scripts\monitor-system-resources.ps1 -LogFile "logs/custom-monitor.log"
```

**Eksempel Output:**

```
╔══════════════════════════════════════════════════════════════╗
║   TEKUP AI V2 - SYSTEM RESOURCE MONITOR                    ║
╚══════════════════════════════════════════════════════════════╝

📁 Log fil: logs/system-resources.log
⏱️  Interval: 5 sekunder
⏰ Varighed: Indtil Ctrl+C

──────────────────────────────────────────────────────────────

2025-01-28 14:30:15 | CPU: 45.2% | GPU: 12.5% | RAM: 8.5GB/16.0GB (53.1%) | Disk: R:2.3MB/s W:1.1MB/s | Net: ↓0.5MB/s ↑0.2MB/s | Top: Code
```

**Hvad bliver målt:**

- **CPU**: Total CPU brug (%)
- **GPU**: GPU brug (hvis NVIDIA/AMD driver tilgængelig)
- **RAM**: Brugt/total RAM (GB og %)
- **Disk I/O**: Læs/skriv hastighed (MB/s)
- **Network I/O**: Modtaget/sendt data (MB/s)
- **Top Processer**: Processer med højest CPU/RAM brug

### Log Analysis Script

**Fil:** `scripts/analyze-system-logs.ps1`

**Parametre:**

```powershell
# Analysér sidste 24 timer (standard)
.\scripts\analyze-system-logs.ps1

# Analysér sidste 12 timer
.\scripts\analyze-system-logs.ps1 -Hours 12

# Analysér sidste 7 dage
.\scripts\analyze-system-logs.ps1 -Hours 168

# Custom log fil
.\scripts\analyze-system-logs.ps1 -LogFile "logs/custom-monitor.log"
```

**Eksempel Output:**

```
╔══════════════════════════════════════════════════════════════╗
║   TEKUP AI V2 - SYSTEM LOG ANALYZER                         ║
╚══════════════════════════════════════════════════════════════╝

📁 Analyserer: logs/system-resources.log
⏰ Tidsperiode: Sidste 24 timer

✅ Fundet 1728 datapunkter

═══════════════════════════════════════════════════════════════
📊 STATISTIK
═══════════════════════════════════════════════════════════════

🖥️  CPU:
   Gennemsnit: 42.3%
   Minimum:    12.5%
   Maksimum:   89.2%
   95. percentil: 78.5%

💾 RAM:
   Gennemsnit: 58.7%
   Minimum:    45.2%
   Maksimum:   72.3%
   95. percentil: 68.9%

═══════════════════════════════════════════════════════════════
💡 FORBEDRINGSFORSLAG
═══════════════════════════════════════════════════════════════

💡 CPU brug er moderat-høj (gennemsnit: 42.3%)
   → Overvåg nøje og overvej optimering

💡 RAM brug er moderat-høj (gennemsnit: 58.7%)
   → Overvåg nøje og luk unødvendige programmer
```

## Forbedringsforslag Baseret på Data

### Høj CPU Brug (>80%)

**Symptomer:**

- Systemet føles langsomt
- Faner er høje
- Programmer reagerer langsomt

**Løsninger:**

1. Luk unødvendige programmer
2. Kør `pnpm run optimize` for at lukke unødvendige processer
3. Tjek Task Manager for CPU-intensive processer
4. Overvej at opgradere CPU hvis problemet er konstant

### Høj RAM Brug (>85%)

**Symptomer:**

- Systemet bruger swap/virtual memory
- Programmer crasher
- Meget langsomt system

**Løsninger:**

1. Kør `pnpm run optimize` for at frigøre RAM
2. Luk unødvendige browser tabs
3. Genstart VS Code hvis TypeScript server bruger for meget
4. Overvej at tilføje mere RAM hvis problemet er konstant

### Høj Disk I/O

**Symptomer:**

- Systemet "fryser" periodisk
- Lyden af harddisk aktivitet

**Løsninger:**

1. Opgrader til SSD hvis du bruger HDD
2. Tjek for disk-intensive operationer
3. Defragmenter disk (kun HDD)
4. Overvej at flytte database til hurtigere disk

### GPU Monitoring

GPU monitoring kræver:

- **NVIDIA**: `nvidia-smi` skal være installeret og i PATH
- **AMD**: Kræver ekstra tools (ikke implementeret endnu)

Hvis GPU ikke vises, er det normalt - det betyder bare at GPU monitoring ikke er tilgængelig.

## Log Filer

### Standard Placering

- **Real-time logs**: `logs/system-resources.log`
- **CSV export**: `logs/system-resources.csv` (hvis `-ExportCSV` bruges)

### Log Format

**Tekst Log:**

```
2025-01-28 14:30:15 | CPU: 45.2% | GPU: 12.5% | RAM: 8.5GB/16.0GB (53.1%) | Disk: R:2.3MB/s W:1.1MB/s | Net: ↓0.5MB/s ↑0.2MB/s | Top: Code
```

**CSV Format:**

```csv
Timestamp,CPU_Percent,GPU_Percent,RAM_Used_GB,RAM_Total_GB,RAM_Percent,Disk_Read_MBps,Disk_Write_MBps,Network_Received_MBps,Network_Sent_MBps,Top_Process_CPU,Top_Process_RAM_MB
2025-01-28 14:30:15,45.2,12.5,8.5,16.0,53.1,2.3,1.1,0.5,0.2,Code,1250.5
```

## Best Practices

### 1. Regelmæssig Monitoring

Kør monitoring i baggrunden under udvikling:

```powershell
# Start monitoring i separat terminal
Start-Process pwsh -ArgumentList "-File", "scripts/monitor-system-resources.ps1", "-ExportCSV"
```

### 2. Daglig Analyse

Analysér data dagligt for at identificere trends:

```powershell
# Kør hver morgen
.\scripts\analyze-system-logs.ps1 -Hours 24
```

### 3. Før/Ogter Tests

Kør monitoring før og efter performance tests:

```powershell
# Før test
.\scripts\monitor-system-resources.ps1 -DurationMinutes 30 -ExportCSV

# Kør test...

# Efter test - analysér
.\scripts\analyze-system-logs.ps1 -LogFile "logs/system-resources.log"
```

### 4. Automatisk Logging

Opret en scheduled task for automatisk logging:

```powershell
# Opret scheduled task (kør hver time)
$action = New-ScheduledTaskAction -Execute "pwsh.exe" -Argument "-File `"$PWD\scripts\monitor-system-resources.ps1`" -DurationMinutes 5"
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Hours 1)
Register-ScheduledTask -TaskName "TekupSystemMonitor" -Action $action -Trigger $trigger
```

## Integration med Eksisterende Scripts

### Performance Optimizer

Brug monitoring data til at identificere hvad der skal optimeres:

```powershell
# 1. Kør monitoring
.\scripts\monitor-system-resources.ps1 -DurationMinutes 10

# 2. Analysér data
.\scripts\analyze-system-logs.ps1 -Hours 1

# 3. Kør optimizer baseret på anbefalinger
.\scripts\optimize-performance.ps1
```

### Log Monitor

Kombinér system monitoring med application logs:

```powershell
# Terminal 1: System resources
.\scripts\monitor-system-resources.ps1

# Terminal 2: Application logs
pnpm run logs
```

## Troubleshooting

### "Log fil ikke fundet"

**Løsning:** Kør monitoring script først for at oprette log filen.

### "GPU: N/A"

**Årsag:** GPU monitoring kræver NVIDIA eller AMD driver.

**Løsning:**

- Installer NVIDIA driver og `nvidia-smi`
- Eller ignorer GPU data (ikke kritisk)

### "Ingen data fundet"

**Årsag:** Ingen målinger i den valgte tidsperiode.

**Løsning:**

- Tjek at monitoring script har kørt
- Prøv at øge `-Hours` parameteren

### Høj CPU fra Script Selv

**Årsag:** Script kan bruge CPU under måling.

**Løsning:**

- Øg `-IntervalSeconds` til 10-15 sekunder
- Script bruger typisk <1% CPU

## Eksempler

### Eksempel 1: Quick Check

```powershell
# Hurtig 5 minutters check
.\scripts\monitor-system-resources.ps1 -DurationMinutes 5
```

### Eksempel 2: Daglig Analyse

```powershell
# Kør i baggrunden hele dagen
Start-Process pwsh -ArgumentList "-File", "scripts/monitor-system-resources.ps1", "-ExportCSV", "-DurationMinutes", "480"

# Analysér om aftenen
.\scripts\analyze-system-logs.ps1 -Hours 8
```

### Eksempel 3: Performance Test

```powershell
# Før test
.\scripts\monitor-system-resources.ps1 -ExportCSV -LogFile "logs/before-test.log" -DurationMinutes 10

# Kør test...

# Efter test
.\scripts\monitor-system-resources.ps1 -ExportCSV -LogFile "logs/after-test.log" -DurationMinutes 10

# Sammenlign
Compare-Object (Get-Content "logs/before-test.csv") (Get-Content "logs/after-test.csv")
```

## Yderligere Ressourcer

- [Performance Optimization Script](../scripts/optimize-performance.ps1)
- [Log Monitor Script](../scripts/monitor-logs.ps1)
- [Architecture Documentation](./ARCHITECTURE.md)

---

**Opdateret:** 2025-01-28
