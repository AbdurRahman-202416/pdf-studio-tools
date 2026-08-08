import Link from "next/link";
import { notFound } from "next/navigation";

import { DeletePdfPagesView } from "@/features/tools/views/DeletePdfPagesView";
import { PdfLockView } from "@/features/tools/views/PdfLockView";
import { PdfToJpgView } from "@/features/tools/views/PdfToJpgView";
import { RotatePdfView } from "@/features/tools/views/RotatePdfView";
import { SplitPdfView } from "@/features/tools/views/SplitPdfView";
import { brand } from "@/brand.config";

const TOOL_MAP: Record<string, React.ComponentType> = {
  "pdf-to-jpg": PdfToJpgView,
  "pdf-lock": PdfLockView,
  "split-pdf": SplitPdfView,
  "rotate-pdf": RotatePdfView,
  "delete-pdf-pages": DeletePdfPagesView,
};

/**
 * Registry slug the "Powered by" backlink points at, where it differs from the
 * widget key. Widget URL segments are embedded on third-party sites and must
 * never change, but "pdf-lock" is not a registry slug - the real page is
 * /lock-pdf, so linking the raw key would 404.
 */
const BACKLINK_SLUG: Record<string, string> = {
  "pdf-lock": "lock-pdf",
};

export function generateStaticParams() {
  return Object.keys(TOOL_MAP).map((tool) => ({ tool }));
}

export const metadata = {
  title: `${brand.name} Widget`,
  robots: { index: false, follow: false },
};

export default async function WidgetPage({
  params,
}: {
  params: Promise<{ tool: string }>;
}) {
  const { tool } = await params;
  const View = TOOL_MAP[tool];
  if (!View) notFound();

  return (
    <div className="space-y-3">
      <View />
      <p className="text-center text-xs text-muted-foreground pt-4">
        Powered by{" "}
        <Link
          href={`${brand.url}/${BACKLINK_SLUG[tool] ?? tool}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          {brand.name}
        </Link>
      </p>
    </div>
  );
}
