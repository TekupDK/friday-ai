# Config Directory

Configuration files for build tools, linters, and project settings.

## Structure

```
config/
├── ai-eval-config.yaml      # AI evaluation configuration
└── promptfooconfig.yaml      # Promptfoo configuration
```

## Files

### ai-eval-config.yaml

Configuration for AI model evaluation and testing.

### promptfooconfig.yaml

Configuration for promptfoo testing framework.

## Note

Most build tool configs (vite.config.ts, drizzle.config.ts, etc.) remain in the root directory as they need to be discovered by their respective tools. Only project-specific configs are stored here.

## Adding New Configs

When adding new configuration files:

1. Use descriptive names
2. Document purpose in this README
3. Consider if the config needs to be in root (for tool discovery) or can be in config/
