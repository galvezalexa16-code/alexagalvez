import { cn } from "@/lib/utils";
import type { Role } from "@/types";

const ROLE_CONFIG: Record<Role, { label: string; className: string }> = {
  OWNER:      { label: "Owner",      className: "bg-amber-100 text-amber-800 border-amber-200" },
  ADMIN:      { label: "Admin",      className: "bg-purple-100 text-purple-800 border-purple-200" },
  SUPERVISOR: { label: "Supervisor", className: "bg-blue-100 text-blue-800 border-blue-200" },
};

export function RoleBadge({ role }: { role: Role }) {
  const config = ROLE_CONFIG[role];
  return (
    <span className={cn("badge border", config.className)}>
      {config.label}
    </span>
  );
}
