import type { Metadata } from "next";
import { Suspense } from "react";
import { PaymentDemo } from "@/components/FlowViews";

export const metadata: Metadata = {
  title: "Payment demonstration",
  robots: { index: false, follow: false },
};

export default function PaymentPage() {
  return (
    <Suspense fallback={<p className="px-4 py-8">Loading payment demonstration…</p>}>
      <PaymentDemo />
    </Suspense>
  );
}
