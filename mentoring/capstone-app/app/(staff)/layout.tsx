import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/staff/layout/Sidebar";
import { TopBar } from "@/components/staff/layout/TopBar";
import type { Role } from "@/types";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const role = (session.user as { role: Role }).role;
  const userName = session.user.name ?? "Staff";

  return (
    <div className="dashboard-layout">
      <Sidebar role={role} userName={userName} />
      <div className="dashboard-main">
        {children}
      </div>
    </div>
  );
}
