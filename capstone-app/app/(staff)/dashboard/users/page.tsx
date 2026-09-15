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

const MOCK_USERS: MockUser[] = [
  { id: 1, name: "Maria Santos",    email: "owner@ericahlicious.com",      role: "OWNER",      status: "ACTIVE",   lastActive: "2026-09-13T10:00:00" },
  { id: 2, name: "Juan dela Cruz",  email: "admin@ericahlicious.com",      role: "ADMIN",      status: "ACTIVE",   lastActive: "2026-09-13T09:45:00" },
  { id: 3, name: "Ana Reyes",       email: "supervisor@ericahlicious.com", role: "SUPERVISOR", status: "ACTIVE",   lastActive: "2026-09-13T10:20:00" },
  { id: 4, name: "Carlo Mendoza",   email: "carlo@ericahlicious.com",      role: "ADMIN",      status: "ACTIVE",   lastActive: "2026-09-12T15:30:00" },
  { id: 5, name: "Liza Bautista",   email: "liza@ericahlicious.com",       role: "SUPERVISOR", status: "ACTIVE",   lastActive: "2026-09-11T08:00:00" },
];

export default async function UsersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const role = session.user.role;
  if (role !== "OWNER" && role !== "ADMIN") redirect("/dashboard");

  const activeUsers = MOCK_USERS.filter((u) => u.status === "ACTIVE");

  return (
    <DashboardLayout title="User Management">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search users..."
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent w-64"
            />
          </div>
          <Link
            href="/dashboard/users/archived"
            className="text-sm text-slate-500 hover:text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Archived
          </Link>
        </div>
        <button className="bg-amber-500 hover:bg-amber-400 text-slate-900 px-4 py-2 rounded-lg font-medium shadow-sm transition-colors text-sm flex items-center gap-2">
          + Add User
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Active Users</h3>
          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">{activeUsers.length} users</span>
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
              {activeUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-semibold text-sm flex-shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <span className="font-medium text-slate-800">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">{user.email}</td>
                  <td className="px-5 py-3.5">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="badge border bg-green-100 text-green-800 border-green-200">
                      Active
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs">
                    {user.lastActive ? formatDate(user.lastActive) : "Never"}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button className="text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors">
                        View
                      </button>
                      <button className="text-xs font-medium text-red-500 hover:text-red-700 px-3 py-1.5 hover:bg-red-50 rounded-md transition-colors">
                        Archive
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
