import type { Metadata } from "next";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/Card";
import { listPosts } from "@/lib/blog";
import { brand } from "@/brand.config";

const ogImage = `${brand.url}/og?title=${encodeURIComponent(
  `${brand.name} Blog`,
)}&subtitle=${encodeURIComponent("Guides on PDFs, OCR, and document workflows")}`;

export const metadata: Metadata = {
  title: "Blog – Guides on PDF tools, OCR, and document workflows",
  description:
    `Tutorials and guides on PDF merging, compression, OCR, document conversion, and other ${brand.name} tools. Free, no signup.`,
  alternates: { canonical: "/blog" },
  openGraph: {
    title: `${brand.name} Blog`,
    description: "Tutorials and guides on PDFs, OCR, and document workflows.",
    url: `${brand.url}/blog`,
    images: [{ url: ogImage, width: 1200, height: 630 }],
  },
};

export default function BlogIndex() {
  const posts = listPosts();
  return (
    <div className="space-y-8 max-w-3xl">
      <header>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Blog</h1>
        <p className="mt-2 text-muted-foreground">
          Guides on PDFs, OCR, document conversion, and other tool tips.
        </p>
      </header>
      <ul className="space-y-3">
        {posts.map((p) => (
          <li key={p.slug}>
            <Link href={`/blog/${p.slug}`}>
              <Card className="transition hover:shadow-md hover:-translate-y-0.5">
                <CardContent className="space-y-1">
                  <h2 className="font-semibold">{p.title}</h2>
                  <p className="text-sm text-muted-foreground">{p.description}</p>
                  <p className="text-xs text-muted-foreground/70 pt-1">
                    {new Date(p.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </CardContent>
              </Card>
            </Link>
          </li>
        ))}
        {posts.length === 0 && (
          <li className="text-sm text-muted-foreground">No posts yet.</li>
        )}
      </ul>
    </div>
  );
}
