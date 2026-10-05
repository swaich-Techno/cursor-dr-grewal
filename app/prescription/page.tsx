import type { Metadata } from "next";
import { PrescriptionForm } from "@/components/FlowViews";

export const metadata: Metadata = {
  title: "Prescription upload",
  robots: { index: false, follow: false },
};

export default function PrescriptionPage() {
  return <PrescriptionForm />;
}
