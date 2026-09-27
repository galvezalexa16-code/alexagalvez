import { DashboardLayout } from "@/components/staff/layout/DashboardLayout";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { UserClientView } from "./UserClientView";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const role = session.user.role;
  if (role !== "OWNER" && role !== "ADMIN") redirect("/dashboard");

  // ── Real DB query (replaces MOCK_USERS) ─────────────────────────────────
  const activeUsers = await db.user.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      lastActive: true,
    },
  });

  // Serialize dates for the client component
  const serialized = activeUsers.map((u) => ({
    ...u,
    lastActive: u.lastActive ? u.lastActive.toISOString() : null,
  }));

  return (
    <DashboardLayout title="User Management">
      <UserClientView initialUsers={serialized} />
    </DashboardLayout>
  );
}
