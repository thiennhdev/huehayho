import type { Metadata } from "next";
import { Settings } from "@/components/Settings";

export const metadata: Metadata = { title: "Cài đặt" };

export default function SettingsPage() {
  return <Settings />;
}
