#!/usr/bin/env node
/**
 * Fails the build if the brand name is hardcoded anywhere outside
 * brand.config.ts.
 *
 * Without this, the single source of truth silently rots: someone adds a page
 * with the name typed in, and six months later a rename means grepping 40
 * files again. Runs as `prebuild`, so `npm run build` - and therefore CI -
 * enforces it.
 *
 * Blog prose is exempt from the literal check because it uses the {{brand}}
 * token, which lib/blog.ts substitutes at read time.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, extname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");

const SOURCE_OF_TRUTH = "brand.config.ts";
const SEARCH_DIRS = ["app", "components", "features", "lib", "content", "tests", "store", "services"];
const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mdx", ".json"]);
const SKIP_DIRS = new Set(["node_modules", ".next", "test-results", "playwright-report", "scripts"]);

/** Read the literal name out of the config without importing TypeScript. */
function brandNameFromConfig() {
  const src = readFileSync(join(ROOT, SOURCE_OF_TRUTH), "utf8");
  const name = src.match(/const NAME\s*=\s*"([^"]+)"/)?.[1];
  const domain = src.match(/const DOMAIN\s*=\s*"([^"]+)"/)?.[1];
  if (!name || !domain) {
    console.error(`✗ Could not read NAME/DOMAIN from ${SOURCE_OF_TRUTH}.`);
    process.exit(1);
  }
  return { name, domain };
}

function* walk(dir) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) yield* walk(full);
    else if (EXTENSIONS.has(extname(full))) yield full;
  }
}

const { name, domain } = brandNameFromConfig();
// Also catch the no-space form ("PDFStudio") and the bare domain.
const noSpace = name.replace(/\s+/g, "");
const patterns = [name, noSpace, domain].filter((p, i, a) => p && a.indexOf(p) === i);

const offenders = [];
for (const dir of SEARCH_DIRS) {
  for (const file of walk(join(ROOT, dir))) {
    const rel = relative(ROOT, file);
    const isBlogProse = rel.startsWith(join("content", "blog"));
    const text = readFileSync(file, "utf8");
    text.split("\n").forEach((line, i) => {
      for (const pattern of patterns) {
        if (!line.includes(pattern)) continue;
        // Blog prose is allowed to mention it only via the token.
        if (isBlogProse) continue;
        offenders.push({ file: rel, line: i + 1, pattern, text: line.trim().slice(0, 100) });
      }
    });
  }
}

if (offenders.length) {
  console.error(
    `\n✗ The brand name is hardcoded in ${offenders.length} place${offenders.length === 1 ? "" : "s"}.\n` +
      `  It must live only in ${SOURCE_OF_TRUTH}, so renaming stays a one-line change.\n`,
  );
  for (const o of offenders.slice(0, 40)) {
    console.error(`  ${o.file}:${o.line}  "${o.pattern}"\n    ${o.text}`);
  }
  if (offenders.length > 40) console.error(`  …and ${offenders.length - 40} more.`);
  console.error(
    `\n  Fix: import { brand } from "@/brand.config" and use brand.name / brand.domain.\n` +
      `  In .mdx prose, write {{brand}} instead - lib/blog.ts substitutes it.\n`,
  );
  process.exit(1);
}

console.log(`✓ Brand name "${name}" is defined only in ${SOURCE_OF_TRUTH}.`);
