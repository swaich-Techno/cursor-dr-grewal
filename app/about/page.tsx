import type { Metadata } from "next";
import { AboutView } from "@/components/FlowViews";

export const metadata: Metadata = {
  title: "About Us",
  robots: { index: false, follow: false },
};

export default function AboutPage() {
  return <AboutView />;
}
