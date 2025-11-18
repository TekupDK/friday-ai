# Scripts Directory

Utility scripts for development, deployment, maintenance, and testing.

## Structure

```
scripts/
├── dev/              # Development scripts (tunnels, local dev)
├── deploy/           # Deployment scripts
├── docs/             # Documentation generation and maintenance
├── maintenance/      # Maintenance and cleanup scripts
├── testing/          # Test scripts and utilities
├── utils/            # General utility scripts
├── analysis/         # Analysis and reporting scripts
├── database/         # Database scripts
├── migrations/       # Migration scripts
└── python/           # Python scripts
```

## Usage

### Development Scripts

- `dev/dev-with-tunnel.mjs` - Start dev server with tunnel
- `dev/tunnel-ngrok.mjs` - Create ngrok tunnel
- `dev/tunnel-localtunnel.mjs` - Create localtunnel

### Documentation Scripts

- `docs/auto-categorize-docs.ts` - Auto-categorize documentation
- `docs/fix-docs-links.ts` - Fix broken documentation links
- `docs/generate-ai-components-docs.ts` - Generate AI component docs
- `docs/import-docs.ts` - Import documentation
- `docs/recategorize-docs.ts` - Recategorize documentation

### Maintenance Scripts

- `maintenance/backup-db.ps1` - Backup database
- `maintenance/cleanup-*.ps1` - Cleanup scripts
- `maintenance/restart-comet.ps1` - Restart services
- `maintenance/organize-*.ps1` - Organization scripts

### Testing Scripts

- `testing/run-ai-tests.ts` - Run AI tests
- `testing/test-*.mjs` - Various test utilities

### Utilities

- `utils/monitor-logs.ps1` - Monitor application logs
- `utils/monitor-system-resources.ps1` - Monitor system resources
- `utils/optimize-performance.ps1` - Performance optimization
- `utils/fix-llama-server.ps1` - Fix Llama server issues
- `utils/fix-markdown-lint.ps1` - Fix markdown linting
- `utils/reorganize-docs.ps1` - Reorganize documentation

## Running Scripts

### TypeScript/JavaScript

```bash
# Using tsx
tsx scripts/docs/auto-categorize-docs.ts

# Using node
node scripts/dev/dev-with-tunnel.mjs
```

### PowerShell

```powershell
# Run PowerShell scripts
.\scripts\utils\monitor-logs.ps1
.\scripts\maintenance\backup-db.ps1
```

### Python

```bash
# Run Python scripts
python scripts/python/extract_google_data.py
```

## Adding New Scripts

When adding new scripts:

1. Place them in the appropriate subdirectory
2. Use descriptive names
3. Add documentation in this README if needed
4. Follow existing naming conventions
