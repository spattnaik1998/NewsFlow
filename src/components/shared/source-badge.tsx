import { cn } from "@/lib/utils";
import type { Source } from "@/lib/types";
import { SOURCE_LABELS } from "@/lib/constants";

const SOURCE_STYLES: Record<Source, { bg: string; dot: string; label?: string }> = {
  "hacker-news": {
    bg: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    dot: "bg-orange-500",
    label: "HN",
  },
  reddit: {
    bg: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    dot: "bg-red-500",
  },
  arxiv: {
    bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    dot: "bg-emerald-500",
    label: "arXiv",
  },
  devto: {
    bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    dot: "bg-blue-500",
    label: "dev.to",
  },
  github: {
    bg: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
    dot: "bg-slate-500",
    label: "GitHub",
  },
  rss: {
    bg: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
    dot: "bg-violet-500",
    label: "RSS",
  },
  press: {
    bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    dot: "bg-amber-500",
    label: "Press",
  },
  serper: {
    bg: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
    dot: "bg-sky-500",
    label: "GNews",
  },
  tavily: {
    bg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    dot: "bg-indigo-500",
    label: "Deep",
  },
};

interface SourceBadgeProps {
  source: Source;
  sourceName?: string;
  className?: string;
}

export function SourceBadge({ source, sourceName, className }: SourceBadgeProps) {
  const style = SOURCE_STYLES[source];
  const label = style.label ?? SOURCE_LABELS[source] ?? source;
  const displayName = sourceName && sourceName !== SOURCE_LABELS[source] ? sourceName : label;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[10px] font-medium tracking-wide uppercase",
        style.bg,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", style.dot)} />
      {displayName}
    </span>
  );
}
