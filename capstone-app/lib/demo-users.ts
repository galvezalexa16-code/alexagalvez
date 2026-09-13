import bcrypt from "bcryptjs";
import type { Role } from "@/types";

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
}

// Pre-hash passwords at module load time (sync, safe for server-only module)
const SALT_ROUNDS = 10;

export const DEMO_USERS: DemoUser[] = [
  {
    id: "demo-owner-1",
    name: "Owner",
    email: "owner@ericahticos.com",
    passwordHash: bcrypt.hashSync("password123", SALT_ROUNDS),
    role: "OWNER",
  },
  {
    id: "demo-admin-1",
    name: "Admin",
    email: "admin@ericahticos.com",
    passwordHash: bcrypt.hashSync("password123", SALT_ROUNDS),
    role: "ADMIN",
  },
  {
    id: "demo-supervisor-1",
    name: "Supervisor",
    email: "supervisor@ericahticos.com",
    passwordHash: bcrypt.hashSync("password123", SALT_ROUNDS),
    role: "SUPERVISOR",
  },
];

export function findDemoUserByEmail(email: string): DemoUser | undefined {
  return DEMO_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
}
