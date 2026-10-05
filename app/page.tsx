import type { Metadata } from "next";
import { HomePage } from "@/components/HomePage";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function Page() {
  return <HomePage />;
}
