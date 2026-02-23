"use client";

import { useState, useEffect } from "react";
import { timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface TimeAgoProps {
  date: string;
  className?: string;
}

export function TimeAgo({ date, className }: TimeAgoProps) {
  const [display, setDisplay] = useState(() => timeAgo(date));

  useEffect(() => {
    setDisplay(timeAgo(date));
    const interval = setInterval(() => setDisplay(timeAgo(date)), 60_000);
    return () => clearInterval(interval);
  }, [date]);

  return (
    <time
      dateTime={date}
      title={new Date(date).toLocaleString()}
      className={cn("tabular-nums", className)}
    >
      {display}
    </time>
  );
}
