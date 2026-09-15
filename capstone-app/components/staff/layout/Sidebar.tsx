"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  UtensilsCrossed,
  Package,
  Receipt,
  BarChart3,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";
import { NAV_ITEMS } from "@/types";

const ICON_MAP = {
  LayoutDashboard,
  ClipboardList,
  Users,
  UtensilsCrossed,
  Package,
  Receipt,
  BarChart3,
};

interface SidebarProps {
  role: Role;
  userName: string;
}

export function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname();

  const filteredNav = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <aside className="dashboard-sidebar">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-slate-900 font-bold text-sm flex-shrink-0">
            E
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">Ericahlicious</p>
            <p className="text-slate-400 text-xs">Cafe & Restaurant</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-6 py-4 border-b border-slate-700">
        <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Logged in as</p>
        <p className="text-white text-sm font-medium truncate">{userName}</p>
        <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-medium">
          {role}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="px-3 text-slate-500 text-xs uppercase tracking-wider mb-2">Management</p>
        <ul className="space-y-1">
          {filteredNav.map((item) => {
            const Icon = ICON_MAP[item.icon as keyof typeof ICON_MAP];
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-amber-500 text-slate-900"
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  )}
                >
                  {Icon && <Icon size={17} />}
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-slate-700">
        <button
          onClick={() => signOut({ callbackUrl: window.location.origin + "/login" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-700 hover:text-white transition-all duration-150"
        >
          <LogOut size={17} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
