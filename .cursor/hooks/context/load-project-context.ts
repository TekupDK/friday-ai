/**
 * Context Hook: Load Project Context
 * 
 * Loads project-specific context for agent
 */

export interface ProjectContext {
  projectName: string;
  stack: string[];
  database: string;
  integrations: string[];
  rules: string[];
}

/**
 * Load project context
 */
export async function loadProjectContext(): Promise<ProjectContext> {
  return {
    projectName: "Friday AI Chat",
    stack: [
      "React 19",
      "TypeScript",
      "Tailwind CSS 4",
      "shadcn/ui",
      "Express 4",
      "tRPC 11",
      "Drizzle ORM",
    ],
    database: "MySQL/TiDB",
    integrations: ["Google Workspace", "Billy.dk"],
    rules: [".cursorrules", "docs/CURSOR_RULES.md"],
  };
}

