import type { Metadata } from "next";
import { BasketView } from "@/components/FlowViews";

export const metadata: Metadata = {
  title: "Enquiry basket",
  robots: { index: false, follow: false },
};

export default function BasketPage() {
  return <BasketView />;
}
