// Shared TypeScript types and enums matching the Prisma schema

export type Role = "OWNER" | "ADMIN" | "SUPERVISOR";
export type UserStatus = "ACTIVE" | "ARCHIVED";
export type StockStatus = "GOOD" | "LOW" | "OUT_OF_STOCK";
export type OrderType = "DINE_IN" | "TAKE_OUT";
export type OrderStatus = "PENDING" | "PREPARING" | "READY" | "COMPLETED" | "CANCELLED";
export type PaymentMethod = "CASH" | "CARD" | "QRPH";
export type PaymentStatus = "PAID" | "REFUNDED";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  roles: Role[];
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard", roles: ["OWNER", "ADMIN", "SUPERVISOR"] },
  { label: "Orders", href: "/dashboard/orders", icon: "ClipboardList", roles: ["OWNER", "SUPERVISOR"] },
  { label: "Users", href: "/dashboard/users", icon: "Users", roles: ["OWNER", "ADMIN"] },
  { label: "Menu", href: "/dashboard/menu", icon: "UtensilsCrossed", roles: ["OWNER", "ADMIN", "SUPERVISOR"] },
  { label: "Inventory", href: "/dashboard/inventory", icon: "Package", roles: ["OWNER", "SUPERVISOR"] },
  { label: "Transactions", href: "/dashboard/transactions", icon: "Receipt", roles: ["OWNER", "SUPERVISOR"] },
  { label: "Reports", href: "/dashboard/reports", icon: "BarChart3", roles: ["OWNER", "ADMIN", "SUPERVISOR"] },
  { label: "Menu Availability", href: "/dashboard/menu-availability", icon: "ListChecks", roles: ["OWNER", "SUPERVISOR"] },
];

export const ROLE_COLORS: Record<Role, string> = {
  OWNER: "bg-amber-100 text-amber-800",
  ADMIN: "bg-purple-100 text-purple-800",
  SUPERVISOR: "bg-blue-100 text-blue-800",
};

export const STOCK_STATUS_COLORS: Record<StockStatus, string> = {
  GOOD: "bg-green-100 text-green-800",
  LOW: "bg-yellow-100 text-yellow-800",
  OUT_OF_STOCK: "bg-red-100 text-red-800",
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PREPARING: "bg-blue-100 text-blue-800",
  READY: "bg-green-100 text-green-800",
  COMPLETED: "bg-gray-100 text-gray-800",
  CANCELLED: "bg-red-100 text-red-800",
};
