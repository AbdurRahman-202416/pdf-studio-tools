/**
 * Curated tool -> supporting-article links.
 *
 * The topic cluster only works if the pillar tool page links down to its
 * guides, not just the guides linking up. Related *tools* are computed
 * elsewhere; this is the article half, kept as a small hand-maintained map
 * because a good guide->tool pairing is an editorial judgement, not a score.
 *
 * Every slug here corresponds to a real file in content/blog/. Keep them in
 * sync when adding or renaming a post.
 */
export interface RelatedArticle {
  /** Blog slug, served at /blog/<slug>. */
  slug: string;
  /** Short link label. Descriptive anchor text, never "read more". */
  title: string;
}

export const RELATED_ARTICLES: Record<string, RelatedArticle[]> = {
  "nid-combine": [
    { slug: "combine-nid-front-back-pdf", title: "Combine NID front and back into one PDF" },
    { slug: "id-card-to-pdf-guide", title: "Put both sides of an ID card on one A4 page" },
  ],
  "pdf-to-word": [
    { slug: "convert-pdf-to-word-online-free", title: "How to convert PDF to Word, free" },
  ],
  "passport-photo-pdf": [
    { slug: "create-passport-photo-pdf-online", title: "Make a print-ready passport photo PDF" },
  ],
  "pdf-ocr": [
    { slug: "multi-language-pdf-ocr-guide", title: "Extract text from scanned PDFs in 100+ languages" },
  ],
  "compress-pdf": [
    { slug: "reduce-pdf-size-for-government-portals", title: "Reduce PDF size for government portals" },
  ],
  "compress-pdf-to-100kb": [
    { slug: "how-to-compress-pdf-to-100kb", title: "How to compress a PDF to 100KB" },
    { slug: "reduce-pdf-size-for-government-portals", title: "Reduce PDF size for government portals" },
  ],
  "compress-pdf-to-200kb": [
    { slug: "reduce-pdf-size-for-government-portals", title: "Reduce PDF size for government portals" },
  ],
  "compress-pdf-to-500kb": [
    { slug: "reduce-pdf-size-for-government-portals", title: "Reduce PDF size for government portals" },
  ],
  "compress-pdf-to-1mb": [
    { slug: "reduce-pdf-size-for-government-portals", title: "Reduce PDF size for government portals" },
  ],
};

export function relatedArticles(slug: string): RelatedArticle[] {
  return RELATED_ARTICLES[slug] ?? [];
}
