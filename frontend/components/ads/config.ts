/**
 * AdSense wiring is entirely env-driven so ads can be turned on per deploy
 * without a commit, and so preview/dev builds never load ad scripts.
 *
 *   NEXT_PUBLIC_ADSENSE_CLIENT     ca-pub-XXXXXXXXXXXXXXXX (publisher id)
 *   NEXT_PUBLIC_ADSENSE_SLOT_TOOL  numeric slot id shown on tool pages
 *   NEXT_PUBLIC_ADSENSE_SLOT_HUB   numeric slot id shown on hub pages
 *
 * A missing client id disables everything; a missing slot id disables just
 * that placement. References must stay fully static (`process.env.NEXT_...`)
 * for Next to inline them into the client bundle.
 */
export const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

export const ADSENSE_SLOTS = {
  tool: process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOOL,
  hub: process.env.NEXT_PUBLIC_ADSENSE_SLOT_HUB,
} as const;

export type AdPlacement = keyof typeof ADSENSE_SLOTS;
