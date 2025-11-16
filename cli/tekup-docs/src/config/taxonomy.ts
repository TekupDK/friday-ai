interface TaxonomyOption {
  id: string;
  label: string;
  aliases?: string[];
}

const CATEGORY_OPTIONS: TaxonomyOption[] = [
  { id: "general", label: "General" },
  { id: "architecture", label: "Architecture", aliases: ["system", "infra"] },
  { id: "api", label: "API" },
  { id: "crm", label: "CRM" },
  { id: "email", label: "Email" },
  { id: "ai", label: "AI" },
  { id: "automation", label: "Automation" },
  { id: "status", label: "Status" },
  { id: "guide", label: "Guide", aliases: ["tutorial"] },
  { id: "ops", label: "Operations", aliases: ["operations", "devops"] },
  { id: "release", label: "Release" },
  { id: "research", label: "Research" },
];

const TAG_OPTIONS: TaxonomyOption[] = [
  { id: "status", label: "status" },
  { id: "roadmap", label: "roadmap" },
  { id: "guide", label: "guide" },
  { id: "api", label: "api" },
  { id: "crm", label: "crm" },
  { id: "email", label: "email" },
  { id: "ai", label: "ai" },
  { id: "infra", label: "infra" },
  { id: "ops", label: "ops" },
  { id: "testing", label: "testing" },
  { id: "release", label: "release" },
  { id: "plan", label: "plan" },
  { id: "spec", label: "spec" },
  { id: "integration", label: "integration" },
  { id: "analysis", label: "analysis" },
  { id: "dashboard", label: "dashboard" },
];

function normalize(input: string): string {
  return input.trim().toLowerCase();
}

function resolveOption(
  input: string,
  collection: TaxonomyOption[],
  kind: "category" | "tag"
): TaxonomyOption {
  const normalized = normalize(input);
  const match = collection.find(option => {
    if (option.id === normalized) return true;
    if (option.label.toLowerCase() === normalized) return true;
    if (option.aliases?.some(alias => alias.toLowerCase() === normalized)) {
      return true;
    }
    return false;
  });

  if (!match) {
    const available = collection.map(option => option.label).join(", ");
    throw new Error(
      `Invalid ${kind}: ${input}. Allowed ${kind}s: ${available}`
    );
  }

  return match;
}

export function resolveCategory(category: string): string {
  return resolveOption(category, CATEGORY_OPTIONS, "category").label;
}

export function resolveTags(rawTags: string[]): string[] {
  const unique = Array.from(new Set(rawTags.map(tag => normalize(tag)))).filter(
    Boolean
  );
  if (unique.length === 0) return [];
  return unique.map(tag => resolveOption(tag, TAG_OPTIONS, "tag").id);
}

export function describeTaxonomy(): string {
  const categories = CATEGORY_OPTIONS.map(option => option.label).join(", ");
  const tags = TAG_OPTIONS.map(option => option.id).join(", ");
  return `Categories: ${categories}\nTags: ${tags}`;
}
