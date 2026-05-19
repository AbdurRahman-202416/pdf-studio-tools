type EventName =
  | "tool_started"
  | "tool_completed"
  | "tool_failed"
  | "tool_shared"
  | "share_clicked"
  | "email_captured"
  | "download_clicked"
  | "pwa_installed"
  | "pwa_install_prompted"
  | "lang_switched";

type EventProps = Record<string, string | number | boolean>;

export function trackEvent(name: EventName, props?: EventProps): void {
  if (typeof window === "undefined") return;
  const w = window as unknown as {
    plausible?: (event: string, opts?: { props: EventProps }) => void;
  };
  w.plausible?.(name, props ? { props } : undefined);
}
