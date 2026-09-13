import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

export async function DashboardLayout({ children, title }: DashboardLayoutProps) {
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
        <TopBar title={title} />
        <main className="dashboard-content fade-in">{children}</main>
      </div>
    </div>
  );
}
