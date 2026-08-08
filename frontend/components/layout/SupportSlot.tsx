import { Heart } from "lucide-react";

import { brand } from "@/brand.config";

/**
 * Placeholder for a future "support this project" link.
 *
 * Deliberately has no payment logic, no provider SDK and no external request -
 * it reserves the layout slot and the copy so adding a real donation link later
 * is a one-component change rather than a footer redesign.
 */
export function SupportSlot() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-dashed border-border px-4 py-3 text-center text-xs text-muted-foreground">
      <Heart aria-hidden className="h-3.5 w-3.5 text-primary" />
      <span>
        {brand.name} is free and has no ads on tool results. If it saved you time, support is
        coming soon.
      </span>
    </div>
  );
}
