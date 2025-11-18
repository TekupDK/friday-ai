# System Monitoring - Quick Start

## 🚀 Hurtig Start

### Start Real-time Monitoring

```bash
# Basis monitoring
pnpm run monitor:system

# Med CSV export (til Excel)
pnpm run monitor:system:csv
```

### Analysér Data

```bash
# Analysér sidste 24 timer og få forbedringsforslag
pnpm run monitor:system:analyze
```

## 📊 Hvad Bliver Målt?

- **CPU**: Total CPU brug (%)
- **GPU**: GPU brug (hvis NVIDIA driver tilgængelig)
- **RAM**: Brugt/total RAM (GB og %)
- **Disk I/O**: Læs/skriv hastighed (MB/s)
- **Network I/O**: Modtaget/sendt data (MB/s)
- **Top Processer**: Processer med højest CPU/RAM brug

## 💡 Eksempel Output

```
2025-01-28 14:30:15 | CPU: 45.2% | GPU: 12.5% | RAM: 8.5GB/16.0GB (53.1%) |
Disk: R:2.3MB/s W:1.1MB/s | Net: ↓0.5MB/s ↑0.2MB/s | Top: Code
```

## 🔍 Forbedringsforslag

Scriptet giver automatisk forbedringsforslag baseret på:

- **Høj CPU (>80%)**: Luk unødvendige programmer, kør `pnpm run optimize`
- **Høj RAM (>85%)**: Frigør RAM, luk browser tabs, genstart VS Code
- **Høj Disk I/O**: Overvej SSD opgradering
- **Peak Times**: Identificer tidspunkter med høj belastning

## 📁 Log Filer

- **Tekst log**: `logs/system-resources.log`
- **CSV export**: `logs/system-resources.csv` (hvis `-ExportCSV` bruges)

## 📖 Fuld Dokumentation

Se [SYSTEM_MONITORING_GUIDE.md](./SYSTEM_MONITORING_GUIDE.md) for detaljeret dokumentation.
