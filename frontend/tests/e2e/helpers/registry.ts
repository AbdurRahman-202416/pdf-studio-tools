/**
 * Single source of truth for the E2E suite: the production tool registry.
 *
 * Importing the app's own registry means the smoke sweep can never drift from
 * the catalogue — add tool #82 and it is tested automatically, exactly the
 * philosophy lib/tools/validate.ts already applies at build time.
 */
import { tools } from "@/lib/tools";
import type { ToolMeta } from "@/lib/tools/types";

export { tools };
export type { ToolMeta };

export const liveTools = tools.filter((t) => t.status === "live");
export const clientTools = liveTools.filter((t) => t.runtime === "client");
export const serverTools = liveTools.filter((t) => t.runtime === "server");

export function byDomain(domain: ToolMeta["domain"]): ToolMeta[] {
  return liveTools.filter((t) => t.domain === domain);
}

export function bySlug(slug: string): ToolMeta {
  const t = tools.find((x) => x.slug === slug);
  if (!t) throw new Error(`no such tool: ${slug}`);
  return t;
}
