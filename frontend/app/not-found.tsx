import Link from "next/link";

import { Button } from "@/components/ui/Button";

export const metadata = { title: "Not found · PDF Studio" };

export default function NotFound() {
  return (
    <div className="grid place-items-center py-24 text-center">
      <div className="space-y-3">
        <p className="text-sm font-medium text-primary">404</p>
        <h1 className="text-3xl font-bold">Page not found</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          The page you were looking for moved, was renamed, or never existed.
        </p>
        <div className="flex justify-center gap-2 pt-2">
          <Link href="/">
            <Button variant="primary">Home</Button>
          </Link>
          <Link href="/tools">
            <Button variant="outline">Browse tools</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
