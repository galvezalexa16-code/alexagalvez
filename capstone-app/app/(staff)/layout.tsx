import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/staff/layout/Sidebar";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role;
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
