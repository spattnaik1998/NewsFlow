import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <p className="font-mono text-6xl font-bold text-muted-foreground/20 mb-4">404</p>
        <h1 className="text-xl font-semibold mb-2">Page not found</h1>
        <p className="text-sm text-muted-foreground mb-6">
          This page doesn&apos;t exist or has been moved.
        </p>
        <Button asChild size="sm" className="gap-2">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            Back to feed
          </Link>
        </Button>
      </div>
    </div>
  );
}
