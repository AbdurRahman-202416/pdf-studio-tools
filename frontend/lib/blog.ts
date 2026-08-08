import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";

import { brand } from "@/brand.config";

export interface BlogFrontmatter {
  title: string;
  description: string;
  date: string; // ISO date
  author?: string;
  tags?: string[];
}

export interface BlogPostMeta extends BlogFrontmatter {
  slug: string;
}

export interface BlogPost extends BlogPostMeta {
  body: string; // raw MDX source
}

const POSTS_DIR = path.join(process.cwd(), "content", "blog");

export function listPosts(): BlogPostMeta[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
      const { data } = matter(raw);
      const meta = data as BlogFrontmatter;
      return {
        slug,
        ...meta,
        title: applyBrand(meta.title ?? ""),
        description: applyBrand(meta.description ?? ""),
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

/**
 * Blog prose refers to the product as {{brand}} rather than by name, so a
 * rename in brand.config.ts flows through published posts too. Applied to the
 * body and to frontmatter title/description.
 */
function applyBrand(text: string): string {
  return text.replaceAll("{{brand}}", brand.name);
}

export function getPost(slug: string): BlogPost | null {
  const file = path.join(POSTS_DIR, `${slug}.mdx`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);
  const meta = data as BlogFrontmatter;
  return {
    slug,
    body: applyBrand(content),
    ...meta,
    title: applyBrand(meta.title ?? ""),
    description: applyBrand(meta.description ?? ""),
  };
}

export function listSlugs(): string[] {
  return listPosts().map((p) => p.slug);
}
