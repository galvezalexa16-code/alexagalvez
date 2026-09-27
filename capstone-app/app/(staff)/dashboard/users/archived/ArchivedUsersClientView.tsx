"use client";

import { useTransition } from "react";
import { RoleBadge } from "@/components/staff/users/RoleBadge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { restoreUser } from "../actions";
import type { Role } from "@/types";
import { toast } from "sonner";

interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  status: "ACTIVE" | "ARCHIVED";
  lastActive: string | null;
}

export function ArchivedUsersClientView({ users }: { users: User[] }) {
  const [isPending, startTransition] = useTransition();

  const handleRestore = (id: number) => {
    startTransition(async () => {
      try {
        await restoreUser(id);
        toast.success("User restored successfully.");
      } catch {
        toast.error("Failed to restore user.");
      }
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
        <h3 className="font-semibold text-slate-800">Archived Users</h3>
        <span className="text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full font-medium">
          {users.length} archived
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
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                  No archived users.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors opacity-70">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-semibold text-sm flex-shrink-0">
                        {user.name.charAt(0).toUpperCase()}
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
                    <button
                      onClick={() => handleRestore(user.id)}
                      disabled={isPending}
                      className="text-xs font-medium text-green-600 hover:text-green-700 px-3 py-1.5 bg-green-50 hover:bg-green-100 rounded-md transition-colors disabled:opacity-60"
                    >
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
  );
}
