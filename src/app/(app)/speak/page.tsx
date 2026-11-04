import type { Metadata } from "next";
import { pronunciation } from "@/content/pronunciation";
import { SpeakLab } from "@/components/SpeakLab";

export const metadata: Metadata = { title: "Luyện phát âm" };

export default function SpeakPage() {
  return <SpeakLab groups={pronunciation} />;
}
