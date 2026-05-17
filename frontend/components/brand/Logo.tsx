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
      <defs>
        <linearGradient
          id="pdf-studio-grad"
          x1="0"
          y1="0"
          x2="64"
          y2="64"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#6366f1" />
          <stop offset="0.55" stopColor="#7c3aed" />
          <stop offset="1" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#pdf-studio-grad)" />
      {/* Folded corner detail (PDF metaphor) */}
      <path d="M44 12 L52 20 L44 20 Z" fill="white" fillOpacity="0.22" />
      {/* Bold P letter with evenodd inner hole */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18 14V50H26V38H36C43 38 48 33 48 26C48 19 43 14 36 14H18ZM26 21V31H36C38 31 40 29 40 26C40 23 38 21 36 21H26Z"
        fill="white"
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
      aria-label="PDF Studio home"
    >
      <LogoMark
        size={size}
        className="shadow-md transition-transform group-hover:scale-105 rounded-xl"
      />
      {showWordmark && (
        <span className="font-bold tracking-tight text-base sm:text-lg truncate">
          PDF<span className="gradient-text">Studio</span>
        </span>
      )}
    </Link>
  );
}
