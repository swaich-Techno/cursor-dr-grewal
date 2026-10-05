import type { Metadata } from "next";
import { AdminDemo } from "@/components/AdminDemo";

export const metadata: Metadata = {
  title: "Admin demonstration",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminDemo />;
}
