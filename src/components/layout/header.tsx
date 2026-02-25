"use client";

import Link from "next/link";
import { Search, Zap, Newspaper } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

interface HeaderProps {
  onSearchOpen?: () => void;
  className?: string;
}

export function Header({ onSearchOpen, className }: HeaderProps) {
  const pathname = usePathname();
  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md",
        className
      )}
    >
      <div className="flex h-14 items-center gap-4 px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500 shadow-sm">
            <Zap className="h-4 w-4 text-white fill-white" />
          </div>
          <span className="font-bold text-[15px] tracking-tight">
            News<span className="text-amber-500">Flow</span>
          </span>
        </Link>

        {/* Daily Brief nav link — visible on all screen sizes */}
        <Link
          href="/briefing"
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap",
            pathname === "/briefing"
              ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Newspaper className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="hidden sm:inline">Daily Brief</span>
        </Link>

        <div className="flex-1" />

        {/* Search trigger */}
        <button
          onClick={onSearchOpen}
          className={cn(
            "hidden md:flex items-center gap-2 rounded-lg border border-border",
            "bg-muted/50 hover:bg-muted px-3 py-1.5 text-sm text-muted-foreground",
            "transition-colors duration-150 cursor-pointer w-52"
          )}
        >
          <Search className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="flex-1 text-left text-xs">Search articles…</span>
          <kbd className="hidden lg:inline-flex h-5 items-center gap-0.5 rounded border border-border bg-background px-1.5 font-mono text-[10px] text-muted-foreground">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>

        <button
          onClick={onSearchOpen}
          className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <Search className="h-4 w-4" />
        </button>

        <ThemeToggle />
      </div>
    </header>
  );
}
