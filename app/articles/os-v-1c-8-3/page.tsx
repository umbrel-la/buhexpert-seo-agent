import { Suspense } from "react";
import { ArticlePage } from "@/components/ArticlePage";

export default function OsIn1cArticlePage() {
  return (
    <Suspense fallback={null}>
      <ArticlePage />
    </Suspense>
  );
}
