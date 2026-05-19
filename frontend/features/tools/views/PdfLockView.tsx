"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, LockOpen, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { FileDrop } from "@/features/tools/components/FileDrop";
import { ToolResult } from "@/features/tools/components/ToolResult";
import { ToolShell } from "@/features/tools/components/ToolShell";
import {
  lockPdf,
  toolDownloadUrl,
  unlockPdf,
  type ToolDownloadable,
} from "@/services/tools-api";
import { ApiError } from "@/services/api";

export interface PdfLockViewProps {
  mode?: "lock" | "unlock";
}

export function PdfLockView({ mode = "lock" }: PdfLockViewProps) {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ToolDownloadable | null>(null);

  const onSubmit = async () => {
    if (!file) {
      toast.error("Please select a PDF first.");
      return;
    }
    if (!password) {
      toast.error("Please enter a password.");
      return;
    }
    setBusy(true);
    setResult(null);
    try {
      const r = await (mode === "lock"
        ? lockPdf(file, password)
        : unlockPdf(file, password));
      setResult(r);
      toast.success(mode === "lock" ? "PDF locked" : "PDF unlocked");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Operation failed";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const isLock = mode === "lock";

  return (
    <ToolShell
      title={isLock ? "Password Protect PDF" : "Unlock PDF"}
      subtitle={
        isLock
          ? "Add AES-256 password protection to any PDF in seconds. Free, no signup."
          : "Remove the password from any PDF you own. Free, no signup, no watermark."
      }
      badge="NEW"
      icon={isLock ? Lock : LockOpen}
      gradient="from-slate-700 via-slate-600 to-slate-500"
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. {isLock ? "Pick the PDF to lock" : "Pick the locked PDF"}</CardTitle>
          </CardHeader>
          <CardContent>
            <FileDrop
              label="Upload PDF"
              accept={{ "application/pdf": [".pdf"] }}
              file={file}
              onChange={setFile}
              hint="Max 100 MB. Files auto-delete after 1 hour."
              testId="pdf-lock-drop"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              2. {isLock ? "Choose a password" : "Enter the password"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isLock ? "Pick a strong password" : "PDF password"}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                autoComplete={isLock ? "new-password" : "current-password"}
                data-testid="pdf-lock-password"
              />
              <button
                type="button"
                aria-label={show ? "Hide password" : "Show password"}
                onClick={() => setShow((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {isLock && (
              <p className="text-xs text-muted-foreground">
                Pick a password you can remember. There&apos;s no recovery, losing it means
                losing the PDF.
              </p>
            )}
          </CardContent>
        </Card>

        <Button
          variant="primary"
          size="lg"
          onClick={onSubmit}
          isLoading={busy}
          disabled={!file || !password || busy}
          data-testid="pdf-lock-submit"
        >
          <Wand2 className="h-4 w-4" />
          {isLock ? "Lock PDF" : "Unlock PDF"}
        </Button>

        {result && (
          <ToolResult
            filename={result.filename}
            size_bytes={result.size_bytes}
            description={isLock ? "AES-256 encrypted" : "Password removed"}
            downloadHref={toolDownloadUrl(result.output_id, result.filename)}
            output_id={isLock ? undefined : result.output_id}
            onDismiss={() => setResult(null)}
            testId="pdf-lock-result"
            tool={`pdf-${mode}`}
          />
        )}

        <Card>
          <CardHeader>
            <CardTitle>How it works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            {isLock ? (
              <>
                <p>
                  We re-write the PDF with AES-256 encryption, the same algorithm Adobe
                  Acrobat uses. Anyone who opens the file in any PDF reader will be asked
                  for the password.
                </p>
                <p>We never store your password. Files auto-delete one hour after upload.</p>
              </>
            ) : (
              <>
                <p>
                  We open the PDF with your password and save a copy without encryption.
                  The original is not modified.
                </p>
                <p>We never store your password. Files auto-delete one hour after upload.</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </ToolShell>
  );
}
