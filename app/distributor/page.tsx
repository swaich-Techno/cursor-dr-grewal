import type { Metadata } from "next";
import { DistributorForm } from "@/components/FlowViews";

export const metadata: Metadata = {
  title: "Distributor enquiry",
  robots: { index: false, follow: false },
};

export default function DistributorPage() {
  return <DistributorForm />;
}
