import type { Role } from "@/types";

interface AuthUser {
  role?: string;
}

interface Session {
  user?: AuthUser;
}

export function requireRole(session: Session | null, allowed: Role[]): void {
  if (!session?.user?.role) {
    throw new Error("Unauthorized");
  }
  if (!allowed.includes(session.user.role as Role)) {
    throw new Error("Forbidden");
  }
}

export function hasRole(session: Session | null, allowed: Role[]): boolean {
  if (!session?.user?.role) return false;
  return allowed.includes(session.user.role as Role);
}
