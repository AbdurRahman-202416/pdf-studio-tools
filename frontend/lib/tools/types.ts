/**
 * Tool platform type layer.
 *
 * Two deliberately separate shapes:
 *
 *   ToolMeta    - slim, client-safe. Identity, taxonomy, runtime, card copy.
 *                 Everything needed to *list*, *search*, or *route to* a tool.
 *   ToolContent - heavy SEO prose. Server-only (see content/index.ts). Never
 *                 reaches the browser, so the registry can grow to hundreds of
 *                 tools without inflating a single client bundle.
 *
 * The old `ToolEntry` merged both, which is why three client components used to
 * pull every tool's FAQ prose into their chunks.
 */

/** Media/subject domain. Owns the accent hue on a tool page. */
export type Domain =
  | "pdf"
  | "image"
  | "text"
  | "data"
  | "code"
  | "color"
  | "convert"
  | "calc"
  | "security";

/** What the tool does to its input. Orthogonal to domain. */
export type Operation =
  | "convert"
  | "optimize"
  | "edit"
  | "organize"
  | "secure"
  | "extract"
  | "generate"
  | "format"
  | "analyze";

/**
 * Where the work happens.
 * - `client` runs entirely in the browser: no upload, no server cost.
 * - `server` posts to the FastAPI backend.
 */
export type Runtime = "client" | "server";

/** Which input UI the generic tool page renders. */
export type Surface = "drop" | "text" | "form";

export type Region = "global" | "BD" | "IN" | "US" | "EU";

export type ToolStatus = "live" | "beta" | "soon";

/** Show an option only when another option holds a given value. */
export interface ShowIf {
  key: string;
  equals: string | number | boolean;
}

export interface OptionChoice {
  value: string;
  label: string;
  /** Short clarifier rendered under the label, e.g. "10 MB limit". */
  hint?: string;
}

/**
 * Declarative option descriptor. One `<ToolOptionsPanel>` renders every tool's
 * controls from these, so a new tool needs no bespoke form code. Tools with
 * genuinely custom interaction keep the `view` escape hatch instead.
 */
export type OptionSchema =
  | {
      kind: "select";
      key: string;
      label: string;
      default: string;
      choices: OptionChoice[];
      help?: string;
      showIf?: ShowIf;
    }
  | {
      kind: "number";
      key: string;
      label: string;
      default: number;
      min?: number;
      max?: number;
      step?: number;
      unit?: string;
      help?: string;
      showIf?: ShowIf;
    }
  | {
      kind: "toggle";
      key: string;
      label: string;
      default: boolean;
      help?: string;
      showIf?: ShowIf;
    }
  | {
      kind: "color";
      key: string;
      label: string;
      default: string;
      help?: string;
      showIf?: ShowIf;
    }
  | {
      kind: "text";
      key: string;
      label: string;
      default: string;
      placeholder?: string;
      maxLength?: number;
      help?: string;
      showIf?: ShowIf;
    };

/** Slim, client-safe tool descriptor. Keep this cheap - it ships to browsers. */
export interface ToolMeta {
  /** Stable identity. Survives slug changes; used by analytics and the API. */
  id: string;
  /** Canonical URL segment. Lives at `/<slug>`. */
  slug: string;
  /** Previous slug, still 308-redirected in next.config.ts. */
  legacySlug?: string;
  domain: Domain;
  operation: Operation;
  runtime: Runtime;
  surface: Surface;
  /** Lucide icon name, resolved at render time to keep this serializable. */
  iconName: string;
  status: ToolStatus;
  /** Short label for cards, nav, search. */
  cardTitle: string;
  /** ~6-10 words of human copy under the title on a card. */
  cardBlurb: string;
  /** Backend POST path relative to NEXT_PUBLIC_API_BASE_URL. Absent for client tools. */
  backendEndpoint?: string;
  /** Declarative controls. Empty when the tool ships a custom view. */
  options?: OptionSchema[];
  /** Where this tool is surfaced. Omitted means everywhere. */
  regions?: Region[];
  /** MIME patterns accepted, for search ("png" -> every PNG tool) and validation. */
  accepts?: string[];
  /** Curated related tools. When absent, related tools are computed by score. */
  relatedOverride?: string[];
  /** Shown in the homepage slider. Curated, and deliberately cross-domain. */
  featured?: boolean;
  /** Shown in this domain's hub slider. */
  trending?: boolean;
}

/** Heavy SEO payload. Server-only - never import from a client component. */
export interface ToolFaq {
  q: string;
  a: string;
}

export interface ToolHowToStep {
  name: string;
  text: string;
}

export interface ToolContent {
  slug: string;
  /** Exact primary keyword. Used as H1 and as the base for <title>. */
  primaryKeyword: string;
  /** <160 chars, unique across the registry (enforced by the registry test). */
  metaDescription: string;
  relatedKeywords: string[];
  faqs: ToolFaq[];
  howTo: ToolHowToStep[];
  seoCopy: string;
}
