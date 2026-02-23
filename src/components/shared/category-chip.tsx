"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { CATEGORIES } from "@/lib/constants";
import type { Category } from "@/lib/types";

interface CategoryChipProps {
  category: Category;
  asLink?: boolean;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export function CategoryChip({
  category,
  asLink = true,
  active = false,
  onClick,
  className,
}: CategoryChipProps) {
  const meta = CATEGORIES[category];
  if (!meta) return null;

  const classes = cn(
    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition-all duration-150",
    "border border-transparent",
    active
      ? "ring-2 ring-offset-1 ring-offset-background ring-current opacity-100"
      : "opacity-80 hover:opacity-100",
    meta.color,
    className
  );

  if (asLink) {
    return (
      <Link href={`/category/${category}`} className={classes} onClick={onClick}>
        <span className="text-[11px]">{meta.icon}</span>
        {meta.label}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} onClick={onClick}>
      <span className="text-[11px]">{meta.icon}</span>
      {meta.label}
    </button>
  );
}
