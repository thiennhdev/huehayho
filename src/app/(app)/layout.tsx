import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { getUser, partnerOf } from "@/lib/users";
import { ProgressProvider } from "@/components/ProgressProvider";
import { AppShell } from "@/components/AppShell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) redirect("/login");
  const partner = getUser(partnerOf(user.id))!;
  return (
    <ProgressProvider user={user} partner={partner}>
      <AppShell>{children}</AppShell>
    </ProgressProvider>
  );
}
