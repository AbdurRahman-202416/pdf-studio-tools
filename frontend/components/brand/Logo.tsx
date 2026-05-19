import Link from "next/link";

interface LogoMarkProps {
  size?: number;
  className?: string;
}

export function LogoMark({ size = 36, className }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="PDF Studio"
      className={className}
    >
      <rect width="64" height="64" rx="12" className="fill-foreground" />
      {/* Folded corner — amber accent */}
      <path d="M44 12 L52 20 L44 20 Z" className="fill-primary" fillOpacity="0.95" />
      {/* Bold P letter — knocked out to background */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18 14V50H26V38H36C43 38 48 33 48 26C48 19 43 14 36 14H18ZM26 21V31H36C38 31 40 29 40 26C40 23 38 21 36 21H26Z"
        className="fill-background"
      />
    </svg>
  );
}

interface LogoProps {
  size?: number;
  className?: string;
  showWordmark?: boolean;
}

export function Logo({ size = 36, className, showWordmark = true }: LogoProps) {
  return (
    <Link
      href="/"
      className={`flex items-center gap-2 group min-w-0 ${className ?? ""}`}
      // When the wordmark is visible, let the visible text BE the accessible
      // name so Lighthouse's label-content-name-mismatch passes.
      aria-label={showWordmark ? undefined : "PDF Studio home"}
    >
      <LogoMark
        size={size}
        className="transition-transform group-hover:scale-105 rounded-xl"
      />
      {showWordmark && (
        <span className="font-display text-lg sm:text-xl font-medium tracking-tight truncate">
          PDF<em className="not-italic text-primary">Studio</em>
        </span>
      )}
    </Link>
  );
}
