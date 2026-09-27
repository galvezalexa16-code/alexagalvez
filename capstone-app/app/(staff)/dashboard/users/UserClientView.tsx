"use client";

import { useState, useTransition } from "react";
import { RoleBadge } from "@/components/staff/users/RoleBadge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { UserFormModal } from "@/components/staff/users/UserFormModal";
import { createUser, updateUser, archiveUser } from "./actions";
import type { Role } from "@/types";
import { Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  status: "ACTIVE" | "ARCHIVED";
  lastActive: string | null;
}

interface UserClientViewProps {
  initialUsers: User[];
}

export function UserClientView({ initialUsers }: UserClientViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredUsers = initialUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleSubmit = (data: any) => {
    startTransition(async () => {
      try {
        if (editingUser) {
          await updateUser({
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role,
          });
          toast.success("User updated successfully.");
        } else {
          await createUser({
            name: data.name,
            email: data.email,
            role: data.role,
            password: data.password,
          });
          toast.success("User created successfully.");
        }
        setIsModalOpen(false);
      } catch (err: any) {
        toast.error(err?.message ?? "Something went wrong.");
      }
    });
  };

  const handleArchive = (id: number) => {
    if (!confirm("Are you sure you want to archive this user?")) return;
    startTransition(async () => {
      try {
        await archiveUser(id);
        toast.success("User archived.");
      } catch {
        toast.error("Failed to archive user.");
      }
    });
  };

  return (
    <>
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent w-64 shadow-sm"
            />
          </div>
          <Link
            href="/dashboard/users/archived"
            className="text-sm text-slate-500 hover:text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors font-medium"
          >
            Archived
          </Link>
        </div>
        <button
          onClick={handleOpenAdd}
          disabled={isPending}
          className="bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-900 px-4 py-2 rounded-lg font-semibold shadow-sm transition-colors text-sm flex items-center gap-2"
        >
          {isPending ? <Loader2 size={14} className="animate-spin" /> : null}
          + Add User
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Active Users</h3>
          <span className="text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full font-medium">
            {filteredUsers.length} users
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
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm flex-shrink-0">
                        {user.name.charAt(0).toUpperCase()}
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
                      <button
                        onClick={() => handleOpenEdit(user)}
                        disabled={isPending}
                        className="text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors disabled:opacity-60"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleArchive(user.id)}
                        disabled={isPending}
                        className="text-xs font-medium text-red-500 hover:text-red-700 px-3 py-1.5 hover:bg-red-50 rounded-md transition-colors disabled:opacity-60"
                      >
                        Archive
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                    No active users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={editingUser}
        onSubmit={handleSubmit}
      />
    </>
  );
}
