import { FeedList } from "@/components/feed/feed-list";
import { FeedSidebar } from "@/components/feed/feed-sidebar";

export default function FeedPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px] max-w-5xl mx-auto w-full">
      <div>
        <h1 className="mb-6 text-2xl font-bold">Feed</h1>
        <FeedList />
      </div>
      <aside className="hidden lg:block">
        <FeedSidebar />
      </aside>
    </div>
  );
}
