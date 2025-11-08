# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]: "[plugin:vite:import-analysis] Failed to resolve import \"@/components/docs/DocumentEditor\" from \"client/src/pages/docs/DocsPage.tsx\". Does the file exist?"
  - generic [ref=e5]: C:/Users/empir/Tekup/services/tekup-ai-v2/client/src/pages/docs/DocsPage.tsx:18:31
  - generic [ref=e6]: "18 | import { DocumentList } from \"@/components/docs/DocumentList\"; 19 | import { DocumentViewer } from \"@/components/docs/DocumentViewer\"; 20 | import { DocumentEditor } from \"@/components/docs/DocumentEditor\"; | ^ 21 | import { ConflictList } from \"@/components/docs/ConflictList\"; 22 | import { useDocuments, useConflicts } from \"@/hooks/docs/useDocuments\";"
  - generic [ref=e7]: at TransformPluginContext._formatLog (C:\Users\empir\Tekup\node_modules\.pnpm\vite@7.1.12_@types+node@24._5ccb86b18a05f8e9bca972dc23163fd3\node_modules\vite\dist\node\chunks\config.js:31106:43) at TransformPluginContext.error (C:\Users\empir\Tekup\node_modules\.pnpm\vite@7.1.12_@types+node@24._5ccb86b18a05f8e9bca972dc23163fd3\node_modules\vite\dist\node\chunks\config.js:31103:14) at normalizeUrl (C:\Users\empir\Tekup\node_modules\.pnpm\vite@7.1.12_@types+node@24._5ccb86b18a05f8e9bca972dc23163fd3\node_modules\vite\dist\node\chunks\config.js:29590:18) at process.processTicksAndRejections (node:internal/process/task_queues:105:5) at async <anonymous> (C:\Users\empir\Tekup\node_modules\.pnpm\vite@7.1.12_@types+node@24._5ccb86b18a05f8e9bca972dc23163fd3\node_modules\vite\dist\node\chunks\config.js:29648:32) at async Promise.all (index 10) at async TransformPluginContext.transform (C:\Users\empir\Tekup\node_modules\.pnpm\vite@7.1.12_@types+node@24._5ccb86b18a05f8e9bca972dc23163fd3\node_modules\vite\dist\node\chunks\config.js:29616:4) at async EnvironmentPluginContainer.transform (C:\Users\empir\Tekup\node_modules\.pnpm\vite@7.1.12_@types+node@24._5ccb86b18a05f8e9bca972dc23163fd3\node_modules\vite\dist\node\chunks\config.js:30905:14) at async loadAndTransform (C:\Users\empir\Tekup\node_modules\.pnpm\vite@7.1.12_@types+node@24._5ccb86b18a05f8e9bca972dc23163fd3\node_modules\vite\dist\node\chunks\config.js:26043:26)
  - generic [ref=e8]:
    - text: Click outside, press Esc key, or fix the code to dismiss.
    - text: You can also disable this overlay by setting
    - code [ref=e9]: server.hmr.overlay
    - text: to
    - code [ref=e10]: "false"
    - text: in
    - code [ref=e11]: vite.config.js
    - text: .
```