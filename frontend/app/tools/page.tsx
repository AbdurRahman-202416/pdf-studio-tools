import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  Camera,
  IdCard,
  Image as ImageIcon,
  Languages,
  Layers,
  Lock,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "All PDF tools",
  description:
    "Browse every PDF Studio tool: merge, compress, PDF to JPG, lock/unlock PDF, Bangla OCR, NID combine, bank statement to Excel, passport photo PDF, government forms.",
  alternates: { canonical: "/tools" },
  openGraph: {
    title: "All PDF tools · PDF Studio",
    description:
      "Eight free PDF utilities: merge, compress, PDF→JPG, lock/unlock, OCR, NID, bank-to-Excel.",
  },
};

const tools = [
  {
    href: "/tools/nid-combine",
    title: "NID Combiner",
    title_bn: "এনআইডি কম্বাইনার",
    description: "Combine NID front + back into a single, print-ready A4 PDF in real ID-card dimensions.",
    icon: IdCard,
    gradient: "from-indigo-500 via-violet-500 to-fuchsia-500",
    badge: "Popular",
  },
  {
    href: "/tools/bangla-ocr",
    title: "Bangla OCR",
    title_bn: "বাংলা ওসিআর",
    description: "Extract Bangla & English text from scanned PDFs. Copy or download as plain text.",
    icon: Languages,
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    badge: "Bangla",
  },
  {
    href: "/tools/bank-to-excel",
    title: "Bank Statement → Excel",
    title_bn: "ব্যাংক স্টেটমেন্ট → এক্সেল",
    description: "Convert Bangladeshi bank statement PDFs to clean, formatted Excel spreadsheets.",
    icon: Banknote,
    gradient: "from-amber-500 via-orange-500 to-rose-500",
    badge: "Pro",
  },
  {
    href: "/tools/photo-to-pdf",
    title: "Passport Photo PDF",
    title_bn: "পাসপোর্ট ছবি PDF",
    description: "Auto-arrange passport, visa, or stamp size photos on A4, perfect for print shops.",
    icon: Camera,
    gradient: "from-sky-500 via-blue-500 to-indigo-500",
    badge: "New",
  },
  {
    href: "/tools/pdf-to-jpg",
    title: "PDF → JPG",
    title_bn: "পিডিএফ থেকে JPG",
    description: "Export every PDF page as a high-quality JPG or PNG image. ZIP download.",
    icon: ImageIcon,
    gradient: "from-pink-500 via-rose-500 to-orange-500",
    badge: "New",
  },
  {
    href: "/tools/pdf-lock",
    title: "Lock / Unlock PDF",
    title_bn: "পিডিএফ পাসওয়ার্ড",
    description: "Add or remove a password (AES-256). Same algorithm used by Acrobat.",
    icon: Lock,
    gradient: "from-slate-700 via-slate-600 to-slate-500",
    badge: "New",
  },
  {
    href: "/workspace",
    title: "Merge & Compress",
    title_bn: "মার্জ ও কম্প্রেস",
    description: "The classic PDF workspace: drag, drop, reorder, merge, and compress at three levels.",
    icon: Layers,
    gradient: "from-gray-700 via-gray-600 to-gray-500",
  },
];

export default function ToolsIndexPage() {
  return (
    <div className="space-y-10">
      <header className="text-center max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-medium text-muted-foreground">
          🇧🇩 Built for Bangladesh
        </span>
        <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight">
          PDF tools that <span className="gradient-text">actually fit your workflow</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Niche tools for NID, OCR, bank statements, photos, and government forms, alongside
          the classic merger.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.href}
              href={tool.href}
              data-testid={`tool-${tool.href.split("/").pop()}`}
              className="block group"
            >
              <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1 hover:border-primary/30 overflow-hidden">
                <div
                  className={cn(
                    "h-1.5 w-full bg-gradient-to-r",
                    tool.gradient,
                  )}
                />
                <CardContent className="space-y-3 pt-5">
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className={cn(
                        "grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br text-white shadow",
                        tool.gradient,
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    {tool.badge && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
                        {tool.badge}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold flex items-baseline gap-2">
                      {tool.title}
                      <span className="text-xs text-muted-foreground font-normal">
                        {tool.title_bn}
                      </span>
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">{tool.description}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition">
                    Open <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
