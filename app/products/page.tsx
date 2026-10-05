import type { Metadata } from "next";
import { Suspense } from "react";
import { Catalogue } from "@/components/CatalogueViews";

export const metadata: Metadata = {
  title: "Products",
  robots: { index: false, follow: false },
};

export default function ProductsPage() {
  return (
    <Suspense fallback={<p className="px-4 py-8">Loading products…</p>}>
      <Catalogue />
    </Suspense>
  );
}
