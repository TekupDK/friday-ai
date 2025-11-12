/*
  Auto-generate docs for React components under a target directory.
  - Default target: client/src/components/ai
  - If the default directory doesn't exist, falls back to a heuristic scan of client/src/components for AI-related components.

  Output: AI_DOCS_COMPONENTS_AI.md in repo root
*/

import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

type PropDoc = {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
  description?: string;
};

type ComponentDoc = {
  name: string;
  filePath: string;
  props: PropDoc[];
  dependencies: string[];
};

const repoRoot = process.cwd();
const DEFAULT_TARGET = path.join(repoRoot, "client", "src", "components", "ai");
const COMPONENTS_ROOT = path.join(repoRoot, "client", "src", "components");
const CHAT_FALLBACK = path.join(COMPONENTS_ROOT, "chat");
const OUTPUT_FILE = path.join(repoRoot, "AI_DOCS_COMPONENTS_AI.md");

function exists(p: string) {
  try {
    fs.accessSync(p, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function walkFiles(dir: string, exts = [".tsx", ".ts"]): string[] {
  const out: string[] = [];
  if (!exists(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "__tests__") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkFiles(full, exts));
    else if (exts.includes(path.extname(entry.name))) out.push(full);
  }
  return out;
}

function collectDependencies(sf: ts.SourceFile): string[] {
  const deps = new Set<string>();
  sf.forEachChild(node => {
    if (ts.isImportDeclaration(node) && node.moduleSpecifier) {
      const text = node.moduleSpecifier.getText(sf).replace(/^['"]|['"]$/g, "");
      deps.add(text);
    }
  });
  return Array.from(deps).sort();
}

function getJsDoc(_node: ts.Node): string | undefined {
  // Simplified: descriptions optional; returning undefined keeps the table minimal.
  return undefined;
}

function isExported(node: ts.Node): boolean {
  return (
    (ts.getCombinedModifierFlags(node as any) & ts.ModifierFlags.Export) !==
      0 ||
    (!!node.parent &&
      ts.isSourceFile(node.parent) &&
      node.parent.statements.some(
        s =>
          ts.isExportAssignment(s) &&
          (s.expression as any)?.escapedText === (node as any).name?.escapedText
      ))
  );
}

function getDefaultExportName(sf: ts.SourceFile): string | undefined {
  for (const s of sf.statements) {
    if (ts.isExportAssignment(s)) {
      if (ts.isIdentifier(s.expression)) return s.expression.text;
      if (ts.isFunctionDeclaration(s.expression) && s.expression.name)
        return s.expression.name.text;
      if (ts.isArrowFunction(s.expression)) return "default";
    }
  }
  return undefined;
}

function resolvePropsFromFunction(
  checker: ts.TypeChecker,
  func: ts.FunctionLikeDeclarationBase
): { type: ts.Type | undefined; param: ts.ParameterDeclaration | undefined } {
  if (!func.parameters?.length) return { type: undefined, param: undefined };
  const param = func.parameters[0];
  if (param.type) {
    const t = checker.getTypeFromTypeNode(param.type);
    return { type: t, param };
  }
  // destructured parameter without explicit type
  const t = checker.getTypeAtLocation(param);
  return { type: t, param };
}

function resolvePropsFromReactFC(
  checker: ts.TypeChecker,
  varDecl: ts.VariableDeclaration
): ts.Type | undefined {
  if (!varDecl.type) return undefined;
  // Expect React.FC<Props> or FC<Props>
  if (
    ts.isTypeReferenceNode(varDecl.type) &&
    varDecl.type.typeArguments?.length
  ) {
    const arg = varDecl.type.typeArguments[0];
    return checker.getTypeFromTypeNode(arg);
  }
  return undefined;
}

function flattenProps(
  checker: ts.TypeChecker,
  type: ts.Type,
  paramDefaults?: Record<string, string>
): PropDoc[] {
  const props: PropDoc[] = [];
  const symbol = type.getSymbol();
  const members = symbol
    ? checker.getPropertiesOfType(type)
    : type.getProperties();
  for (const m of members) {
    const decl = m.valueDeclaration || m.declarations?.[0];
    const propType = checker.getTypeOfSymbolAtLocation(
      m,
      decl ?? m.valueDeclaration ?? (m as any)
    );
    const typeStr = checker.typeToString(propType);
    const isOptional = (m.getFlags() & ts.SymbolFlags.Optional) !== 0;
    const defaultValue = paramDefaults?.[m.getName()];
    const description = decl ? getJsDoc(decl) : undefined;
    props.push({
      name: m.getName(),
      type: typeStr,
      required: !isOptional,
      defaultValue,
      description,
    });
  }
  return props.sort((a, b) => a.name.localeCompare(b.name));
}

function collectComponents(
  program: ts.Program,
  fileName: string
): ComponentDoc[] {
  const sf = program.getSourceFile(fileName);
  if (!sf) return [];
  const checker = program.getTypeChecker();
  const deps = collectDependencies(sf);
  const defaultExportName = getDefaultExportName(sf);

  const components: ComponentDoc[] = [];

  function extractParamDefaults(
    func: ts.FunctionLikeDeclarationBase | undefined
  ): Record<string, string> | undefined {
    if (!func || !func.parameters?.length) return undefined;
    const param = func.parameters[0];
    if (!param || !param.name) return undefined;
    const defaults: Record<string, string> = {};
    if (ts.isObjectBindingPattern(param.name)) {
      for (const el of param.name.elements) {
        const name = el.name.getText(sf);
        if (el.initializer) defaults[name] = el.initializer.getText(sf);
      }
      return defaults;
    }
    // parameter default (e.g., props = {})
    if (param.initializer && ts.isObjectLiteralExpression(param.initializer)) {
      for (const p of param.initializer.properties) {
        if (ts.isPropertyAssignment(p) && ts.isIdentifier(p.name)) {
          defaults[p.name.text] = p.initializer.getText(sf);
        }
      }
      return defaults;
    }
    return undefined;
  }

  function pushComponent(
    name: string,
    propsType: ts.Type | undefined,
    funcOrDecl?: ts.Node
  ) {
    let props: PropDoc[] = [];
    let paramDefaults: Record<string, string> | undefined;
    if (
      funcOrDecl &&
      (ts.isFunctionDeclaration(funcOrDecl) ||
        ts.isArrowFunction(funcOrDecl) ||
        ts.isFunctionExpression(funcOrDecl))
    ) {
      paramDefaults = extractParamDefaults(funcOrDecl);
    } else if (
      funcOrDecl &&
      ts.isVariableDeclaration(funcOrDecl) &&
      funcOrDecl.initializer &&
      (ts.isArrowFunction(funcOrDecl.initializer) ||
        ts.isFunctionExpression(funcOrDecl.initializer))
    ) {
      paramDefaults = extractParamDefaults(funcOrDecl.initializer);
    }
    if (propsType) props = flattenProps(checker, propsType, paramDefaults);
    // If no props extracted and function has parameters, attempt default value inference
    components.push({
      name,
      filePath: path.relative(repoRoot, fileName).replaceAll("\\", "/"),
      props,
      dependencies: deps,
    });
  }

  sf.forEachChild(node => {
    // export function Component(props: Props) {}
    if (ts.isFunctionDeclaration(node) && node.name && isExported(node)) {
      const { type: propsType } = resolvePropsFromFunction(checker, node);
      pushComponent(node.name.text, propsType, node);
    }
    // export const Component = (props: Props) => {}
    if (ts.isVariableStatement(node) && isExported(node)) {
      node.declarationList.declarations.forEach(decl => {
        if (ts.isVariableDeclaration(decl) && decl.name && decl.initializer) {
          if (
            ts.isArrowFunction(decl.initializer) ||
            ts.isFunctionExpression(decl.initializer)
          ) {
            const propsFromFunc = resolvePropsFromFunction(
              checker,
              decl.initializer
            );
            let propsType = propsFromFunc.type;
            if (!propsType) propsType = resolvePropsFromReactFC(checker, decl);
            const name = (decl.name as ts.Identifier).text;
            pushComponent(name, propsType, decl);
          } else if (ts.isCallExpression(decl.initializer)) {
            // const Comp = memo((props: Props) => ...) or forwardRef<HTMLDivElement, Props>((props) => ...)
            const call = decl.initializer;
            const calleeName = ts.isIdentifier(call.expression)
              ? call.expression.text
              : ts.isPropertyAccessExpression(call.expression)
              ? call.expression.name.text
              : undefined;
            if (calleeName && /(memo|forwardRef)$/.test(calleeName) && call.arguments.length > 0) {
              const firstArg = call.arguments[0];
              if (ts.isArrowFunction(firstArg) || ts.isFunctionExpression(firstArg)) {
                const { type: propsType } = resolvePropsFromFunction(checker, firstArg);
                const name = (decl.name as ts.Identifier).text;
                pushComponent(name, propsType, firstArg);
              }
            }
          }
        }
      });
    }
    // export default function Component(props: Props) {}
    if (ts.isExportAssignment(node)) {
      if (ts.isFunctionDeclaration(node.expression) && node.expression.name) {
        const { type: propsType } = resolvePropsFromFunction(
          checker,
          node.expression
        );
        pushComponent(node.expression.name.text, propsType, node.expression);
      } else if (ts.isCallExpression(node.expression)) {
        const call = node.expression;
        const calleeName = ts.isIdentifier(call.expression)
          ? call.expression.text
          : ts.isPropertyAccessExpression(call.expression)
          ? call.expression.name.text
          : undefined;
        if (calleeName && /(memo|forwardRef)$/.test(calleeName) && call.arguments.length > 0) {
          const firstArg = call.arguments[0];
          if (ts.isArrowFunction(firstArg) || ts.isFunctionExpression(firstArg)) {
            const { type: propsType } = resolvePropsFromFunction(checker, firstArg);
            const inferredName = path.basename(fileName, path.extname(fileName));
            pushComponent(inferredName, propsType, firstArg);
          }
        }
      }
    }
  });

  // If we didn't find any named exported components but there's a default export identifier, try to resolve it
  if (components.length === 0 && defaultExportName) {
    sf.forEachChild(node => {
      if (
        ts.isFunctionDeclaration(node) &&
        node.name?.text === defaultExportName
      ) {
        const { type: propsType } = resolvePropsFromFunction(
          program.getTypeChecker(),
          node
        );
        pushComponent(defaultExportName, propsType, node);
      }
      if (ts.isVariableStatement(node)) {
        node.declarationList.declarations.forEach(decl => {
          if (
            ts.isVariableDeclaration(decl) &&
            ts.isIdentifier(decl.name) &&
            decl.name.text === defaultExportName
          ) {
            if (decl.initializer) {
              if (
                ts.isArrowFunction(decl.initializer) ||
                ts.isFunctionExpression(decl.initializer)
              ) {
                const { type: propsType } = resolvePropsFromFunction(
                  program.getTypeChecker(),
                  decl.initializer
                );
                pushComponent(defaultExportName, propsType, decl);
              } else if (ts.isCallExpression(decl.initializer)) {
                const call = decl.initializer;
                const calleeName = ts.isIdentifier(call.expression)
                  ? call.expression.text
                  : ts.isPropertyAccessExpression(call.expression)
                  ? call.expression.name.text
                  : undefined;
                if (calleeName && /(memo|forwardRef)$/.test(calleeName) && call.arguments.length > 0) {
                  const firstArg = call.arguments[0];
                  if (ts.isArrowFunction(firstArg) || ts.isFunctionExpression(firstArg)) {
                    const { type: propsType } = resolvePropsFromFunction(
                      program.getTypeChecker(),
                      firstArg
                    );
                    pushComponent(defaultExportName, propsType, firstArg);
                  }
                }
              }
            }
          }
        });
      }
    });
  }

  // Final fallback: include file as a component entry if nothing found
  if (components.length === 0) {
    components.push({
      name: path.basename(fileName, path.extname(fileName)),
      filePath: path.relative(repoRoot, fileName).replaceAll("\\", "/"),
      props: [],
      dependencies: deps,
    });
  }

  return components;
}

function heuristicFilterAI(filePaths: string[]): string[] {
  const aiLike = [
    /[\\/](ai)[\\/]/i, // directory named ai
    /[\\/](chat)[\\/]/i, // chat directory
    /\bAI[A-Za-z]/, // filenames starting with AI*
    /Chat/i,
    /Agent/i,
    /Suggest/i,
  ];
  return filePaths.filter(p => aiLike.some(rx => rx.test(p)));
}

function buildProgram(files: string[]): ts.Program {
  const options: ts.CompilerOptions = {
    allowJs: true,
    jsx: ts.JsxEmit.ReactJSX,
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    skipLibCheck: true,
    strict: false,
    types: [],
  };
  return ts.createProgram(files, options);
}

function generateMarkdown(docs: ComponentDoc[]): string {
  const lines: string[] = [];
  lines.push("# Friday AI Components – Auto-Docs");
  lines.push("");
  lines.push(`Generated on ${new Date().toISOString()}\n`);
  if (docs.length === 0) {
    lines.push(
      "No components found under client/src/components/ai (or AI-like fallbacks)."
    );
    return lines.join("\n");
  }
  // Group by directory
  const byDir = new Map<string, ComponentDoc[]>();
  for (const d of docs) {
    const dir = path.dirname(d.filePath).replaceAll("\\", "/");
    const arr = byDir.get(dir) || [];
    arr.push(d);
    byDir.set(dir, arr);
  }
  const sortedDirs = Array.from(byDir.keys()).sort();
  for (const dir of sortedDirs) {
    lines.push(`## ${dir}`);
    const comps = (byDir.get(dir) || []).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    for (const c of comps) {
      lines.push("");
      lines.push(`### ${c.name}`);
      lines.push("");
      lines.push(`- File: \`${c.filePath}\``);
      if (c.dependencies.length) {
        lines.push("- Dependencies:");
        for (const dep of c.dependencies) lines.push(`  - ${dep}`);
      } else {
        lines.push("- Dependencies: (none)");
      }
      if (c.props.length) {
        lines.push("");
        lines.push("| Prop | Type | Required | Default | Description |");
        lines.push("|------|------|----------|---------|-------------|");
        for (const p of c.props) {
          const def = p.defaultValue
            ? p.defaultValue.replaceAll("\n", " ")
            : "";
          const desc = (p.description || "")
            .replaceAll("|", "\\|")
            .replaceAll("\n", " ");
          lines.push(
            `| ${p.name} | ${p.type} | ${p.required ? "yes" : "no"} | ${def} | ${desc} |`
          );
        }
      } else {
        lines.push("");
        lines.push("_No props detected._");
      }
      lines.push("");
    }
  }
  return lines.join("\n");
}

function main() {
  let targetDir = process.argv[2]
    ? path.isAbsolute(process.argv[2])
      ? process.argv[2]
      : path.join(repoRoot, process.argv[2])
    : DEFAULT_TARGET;
  let files: string[] = [];
  if (exists(targetDir)) {
    files = walkFiles(targetDir);
  } else if (exists(CHAT_FALLBACK)) {
    files = walkFiles(CHAT_FALLBACK);
    console.warn(
      `[warn] Directory not found: ${path.relative(repoRoot, DEFAULT_TARGET)}. Using structured fallback: ${path.relative(repoRoot, CHAT_FALLBACK)} (${files.length} files).`
    );
  } else {
    // fallback heuristic
    const all = walkFiles(COMPONENTS_ROOT);
    files = heuristicFilterAI(all);
    console.warn(
      `[warn] Directory not found: ${path.relative(repoRoot, DEFAULT_TARGET)}. Using heuristic fallback (${files.length} files).`
    );
    const chatCount = files.filter(f => /[\\/]chat[\\/]/i.test(f)).length;
    const aiDirCount = files.filter(f => /[\\/]components[\\/]ai[\\/]/i.test(f)).length;
    console.log(`[info] Heuristic breakdown: chat=${chatCount}, aiDir=${aiDirCount}`);
  }

  // If AI folder exists but contains no components, try structured fallback then heuristic
  const tsFiles = files.filter(f => f.endsWith(".tsx") || f.endsWith(".ts"));
  if (tsFiles.length === 0) {
    if (exists(CHAT_FALLBACK)) {
      files = walkFiles(CHAT_FALLBACK);
      console.warn(
        `[warn] No TS/TSX in ${path.relative(repoRoot, targetDir)}. Using structured fallback: ${path.relative(repoRoot, CHAT_FALLBACK)} (${files.length} files).`
      );
    }
    if (!files.length) {
      const all = walkFiles(COMPONENTS_ROOT);
      files = heuristicFilterAI(all);
      console.warn(
        `[warn] Structured fallback empty. Using heuristic fallback (${files.length} files).`
      );
    }
  }
  // Filter TSX/TS files that likely contain React components
  files = files.filter(f => f.endsWith(".tsx") || f.endsWith(".ts"));
  if (files.length === 0) {
    fs.writeFileSync(OUTPUT_FILE, generateMarkdown([]), "utf8");
    console.log(
      `[ok] Wrote ${path.relative(repoRoot, OUTPUT_FILE)} (no components found).`
    );
    return;
  }
  const program = buildProgram(files);
  const allDocs: ComponentDoc[] = [];
  for (const f of files) {
    try {
      const docs = collectComponents(program, f);
      // If a file exports multiple components, include them all
      for (const d of docs) allDocs.push(d);
    } catch (err) {
      console.warn(
        `[warn] Failed to parse ${path.relative(repoRoot, f)}:`,
        (err as Error).message
      );
    }
  }
  const md = generateMarkdown(allDocs);
  fs.writeFileSync(OUTPUT_FILE, md, "utf8");
  console.log(
    `[ok] Wrote ${path.relative(repoRoot, OUTPUT_FILE)} with ${allDocs.length} component(s).`
  );
}

main();
