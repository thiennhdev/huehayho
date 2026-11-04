import type { Metadata } from "next";
import { QuickPractice } from "@/components/QuickPractice";

export const metadata: Metadata = { title: "Luyện nhanh" };

export default function PracticePage() {
  return <QuickPractice />;
}
