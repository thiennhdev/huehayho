import { getOutline } from "@/content";
import { Dashboard } from "@/components/Dashboard";

export default function Home() {
  return <Dashboard outline={getOutline()} />;
}
