import Link from "next/link";
import { Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background/50 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 text-amber-500" />
          <span className="font-semibold">NewsFlow</span>
          <span className="text-muted-foreground/40">·</span>
          <span>Tech news from 8+ sources</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/sources" className="hover:text-foreground transition-colors">
            Source Status
          </Link>
          <Link href="/api/sources/status" target="_blank" className="hover:text-foreground transition-colors font-mono">
            /api
          </Link>
        </div>
      </div>
    </footer>
  );
}
