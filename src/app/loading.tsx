import { FeedSkeleton } from "@/components/feed/feed-skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="h-14 border-b border-border/60 bg-background/80" />
      <div className="flex flex-1">
        <aside className="hidden lg:block w-56 border-r border-border/60" />
        <main className="flex-1 p-4 md:p-6">
          <div className="h-10 mb-4" />
          <FeedSkeleton count={9} />
        </main>
      </div>
    </div>
  );
}
