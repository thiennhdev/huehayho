import type { Metadata } from "next";
import { Review } from "@/components/Review";

export const metadata: Metadata = { title: "Ôn tập" };

export default function ReviewPage() {
  return <Review />;
}
