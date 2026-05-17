import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  className?: string;
  indeterminate?: boolean;
}

export function Progress({ value, className, indeterminate }: ProgressProps) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-muted",
        className,
      )}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={indeterminate ? undefined : pct}
    >
      <div
        className={cn(
          "h-full rounded-full bg-primary transition-[width] duration-300 ease-out",
          indeterminate && "w-1/3 animate-[indeterminate_1.4s_ease_infinite]",
        )}
        style={{ width: indeterminate ? undefined : `${pct}%` }}
      />
      <style>{`
        @keyframes indeterminate {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  );
}
