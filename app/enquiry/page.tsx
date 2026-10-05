import type { Metadata } from "next";
import { Suspense } from "react";
import { EnquiryForm } from "@/components/FlowViews";

export const metadata: Metadata = {
  title: "Customer enquiry",
  robots: { index: false, follow: false },
};

export default function EnquiryPage() {
  return (
    <Suspense fallback={<p className="px-4 py-8">Loading enquiry…</p>}>
      <EnquiryForm />
    </Suspense>
  );
}
