import { Suspense } from "react";
import MessagesContent from "./messages-content";
import { Skeleton } from "@/components/ui/skeleton";

export default function MessagesPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
      <MessagesContent />
    </Suspense>
  );
}
