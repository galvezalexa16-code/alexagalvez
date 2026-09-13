import { DashboardLayout } from "@/components/staff/layout/DashboardLayout";
import { RoleBadge } from "@/components/staff/users/RoleBadge";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import type { Role } from "@/types";

export const dynamic = "force-dynamic";

interface MockUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  status: "ACTIVE" | "ARCHIVED";
  lastActive: string | null;
}

const MOCK_ARCHIVED_USERS: MockUser[] = [
  { id: 6, name: "Roberto Garcia",  email: "roberto@ericahticos.com",  role: "ADMIN",      status: "ARCHIVED", lastActive: "2026-08-20T14:00:00" },
  { id: 7, name: "Precy Villanueva",email: "precy@ericahticos.com",    role: "SUPERVISOR", status: "ARCHIVED", lastActive: "2026-07-15T09:00:00" },
];

export default async function ArchivedUsersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const role = session.user.role;
  if (role !== "OWNER" && role !== "ADMIN") redirect("/dashboard");

  return (
    <DashboardLayout title="Archived Users">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search archived users..."
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent w-64"
            />
          </div>
          <Link
            href="/dashboard/users"
            className="text-sm text-slate-500 hover:text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            ← View Active
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Archived Users</h3>
          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
            {MOCK_ARCHIVED_USERS.length} archived
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-5 py-3 text-left font-semibold text-slate-600">Name</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600">Email</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600">Role</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600">Status</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600">Last Active</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_ARCHIVED_USERS.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    No archived users.
                  </td>
                </tr>
              ) : (
                MOCK_ARCHIVED_USERS.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors opacity-70">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-semibold text-sm flex-shrink-0">
                          {user.name.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-700">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400">{user.email}</td>
                    <td className="px-5 py-3.5">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="badge border bg-orange-100 text-orange-700 border-orange-200">
                        Archived
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 text-xs">
                      {user.lastActive ? formatDate(user.lastActive) : "Never"}
                    </td>
                    <td className="px-5 py-3.5">
                      <button className="text-xs font-medium text-green-600 hover:text-green-700 px-3 py-1.5 bg-green-50 hover:bg-green-100 rounded-md transition-colors">
                        Restore
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
