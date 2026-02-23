"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[NewsFlow Error]", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="rounded-full border-2 border-destructive/20 bg-destructive/5 p-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
        </div>
        <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
        <p className="text-sm text-muted-foreground mb-6">
          {error.message || "An unexpected error occurred while loading the feed."}
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button onClick={reset} size="sm" className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" />
            Try again
          </Button>
          <Button variant="outline" size="sm" asChild className="gap-2">
            <Link href="/">
              <Home className="h-3.5 w-3.5" />
              Home
            </Link>
          </Button>
        </div>
        {error.digest && (
          <p className="mt-4 font-mono text-[10px] text-muted-foreground/40">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
