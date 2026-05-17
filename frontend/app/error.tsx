"use client";

import Link from "next/link";

import { Button } from "@/components/ui/Button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ reset }: ErrorProps) {
  return (
    <div className="grid place-items-center py-24 text-center">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold">Something went sideways</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          A page error occurred. You can try again, or jump back home.
        </p>
        <div className="flex justify-center gap-2 pt-2">
          <Button onClick={reset} variant="primary">
            Try again
          </Button>
          <Link href="/">
            <Button variant="outline">Go home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
