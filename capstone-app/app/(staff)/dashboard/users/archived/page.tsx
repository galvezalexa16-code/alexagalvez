import { DashboardLayout } from "@/components/staff/layout/DashboardLayout";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { ArchivedUsersClientView } from "./ArchivedUsersClientView";

export const dynamic = "force-dynamic";

export default async function ArchivedUsersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const role = session.user.role;
  if (role !== "OWNER" && role !== "ADMIN") redirect("/dashboard");

  // ── Real DB query ────────────────────────────────────────────────────────
  const archivedUsers = await db.user.findMany({
    where: { status: "ARCHIVED" },
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

  const serialized = archivedUsers.map((u) => ({
    ...u,
    lastActive: u.lastActive ? u.lastActive.toISOString() : null,
  }));

  return (
    <DashboardLayout title="Archived Users">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <Link
          href="/dashboard/users"
          className="text-sm text-slate-500 hover:text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors font-medium inline-flex items-center gap-1"
        >
          ← View Active Users
        </Link>
      </div>
      <ArchivedUsersClientView users={serialized} />
    </DashboardLayout>
  );
}
