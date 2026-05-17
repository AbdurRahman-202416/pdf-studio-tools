import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// The widget route renders its children directly. The root layout's <Navbar />,
// <Sidebar />, and <Footer /> are conditionally hidden via the IsWidgetRoute
// check in app/layout.tsx (detected by pathname starting with `/widget`).
export default function WidgetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="widget-route min-h-screen p-4">{children}</div>;
}
