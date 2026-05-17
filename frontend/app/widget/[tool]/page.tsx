import Link from "next/link";
import { notFound } from "next/navigation";

import { PdfLockView } from "@/features/tools/views/PdfLockView";
import { PdfToJpgView } from "@/features/tools/views/PdfToJpgView";

const TOOL_MAP: Record<string, React.ComponentType> = {
  "pdf-to-jpg": PdfToJpgView,
  "pdf-lock": PdfLockView,
};

export function generateStaticParams() {
  return Object.keys(TOOL_MAP).map((tool) => ({ tool }));
}

export const metadata = {
  title: "PDF Studio Widget",
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
          href={`https://pdfstudio.app/tools/${tool}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          PDF Studio
        </Link>
      </p>
    </div>
  );
}
