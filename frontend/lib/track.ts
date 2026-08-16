type EventName =
  | "tool_view"
  | "tool_started"
  | "tool_completed"
  | "tool_failed"
  | "tool_downloaded"
  | "tool_search"
  | "category_view"
  | "tool_shared"
  | "share_clicked"
  | "email_captured"
  | "download_clicked"
  | "pwa_installed"
  | "pwa_install_prompted"
  | "lang_switched";

type EventProps = Record<string, string | number | boolean>;

/**
 * Keys that must never be sent to analytics. This is a privacy backstop: even
 * if a caller accidentally passes a filename or file content, it is dropped
 * before it reaches the analytics sink. We only ever want low-cardinality,
 * non-identifying product signals (which tool, which target, sizes, counts).
 */
const BLOCKED_PROP_KEYS = /(name|file|filename|content|text|value|token|secret|password|email|query|input|payload)/i;

function sanitize(props?: EventProps): EventProps | undefined {
  if (!props) return undefined;
  const clean: EventProps = {};
  for (const [k, v] of Object.entries(props)) {
    if (BLOCKED_PROP_KEYS.test(k)) continue; // never forward potentially sensitive keys
    // Only forward primitives; truncate long strings so free text can't leak.
    if (typeof v === "string") clean[k] = v.slice(0, 64);
    else if (typeof v === "number" || typeof v === "boolean") clean[k] = v;
  }
  return Object.keys(clean).length ? clean : undefined;
}

/**
 * Privacy-conscious event tracker. No-op unless an analytics sink is loaded
 * (Plausible, gated on NEXT_PUBLIC_PLAUSIBLE_DOMAIN) — so the app works
 * identically with analytics disabled. File contents, filenames, and secrets
 * are never sent: props are sanitized, and callers only pass coarse signals.
 */
export function trackEvent(name: EventName, props?: EventProps): void {
  if (typeof window === "undefined") return;
  const w = window as unknown as {
    plausible?: (event: string, opts?: { props: EventProps }) => void;
  };
  const clean = sanitize(props);
  w.plausible?.(name, clean ? { props: clean } : undefined);
}
