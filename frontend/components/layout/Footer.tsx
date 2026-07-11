import Link from "next/link";

import { LogoMark } from "@/components/brand/Logo";
import { EmailCapture } from "@/components/email/EmailCapture";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-card/40 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 grid gap-6 sm:grid-cols-4 text-sm">
        <div>
          <div className="flex items-center gap-2">
            <LogoMark size={28} className="rounded-lg" />
            <p className="font-semibold">
              PDF<span className="gradient-text">Studio</span>
            </p>
          </div>
          <p className="mt-2 text-muted-foreground">
            Free, fast, private PDF tools - for everyone, everywhere.
          </p>
        </div>
        <div>
          <p className="font-semibold mb-2">Tools</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>
              <Link href="/workspace" className="hover:text-foreground">
                Merge &amp; Compress
              </Link>
            </li>
            <li>
              <Link href="/pdf-to-jpg" className="hover:text-foreground">
                PDF to JPG
              </Link>
            </li>
            <li>
              <Link href="/lock-pdf" className="hover:text-foreground">
                Lock / Unlock PDF
              </Link>
            </li>
            <li>
              <Link href="/pdf-ocr" className="hover:text-foreground">
                PDF OCR
              </Link>
            </li>
            <li>
              <Link href="/tools" className="hover:text-foreground">
                All tools →
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-semibold mb-2">Company</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>
              <Link href="/blog" className="hover:text-foreground">
                Blog
              </Link>
            </li>
            <li>
              <Link href="/roadmap" className="hover:text-foreground">
                Roadmap
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-foreground">
                About
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-foreground">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-foreground">
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-semibold mb-2">Stay in the loop</p>
          <p className="text-muted-foreground mb-2">
            One email when we ship a new tool. No spam.
          </p>
          <EmailCapture source="footer" />
          <p className="mt-4 text-xs text-muted-foreground">
            Files auto-delete one hour after upload. No tracking.
          </p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pb-6 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <p>© {year} PDF Studio. All rights reserved.</p>
        <p>
          Built by{" "}
          <Link
            href="/about"
            className="font-medium text-foreground hover:text-primary transition"
          >
            Abdur Rahman
          </Link>
        </p>
      </div>
    </footer>
  );
}
