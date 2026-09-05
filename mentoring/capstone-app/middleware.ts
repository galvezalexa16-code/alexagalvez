import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes that don't require authentication
const publicRoutes = [
  "/login",
  "/menu",
  "/cart",
  "/qr",
  "/order",
];

const publicApiRoutes = [
  "/api/auth",
  "/api/menu",
  "/api/tables",
  "/api/orders",
];

export default auth((req: NextRequest & { auth: unknown }) => {
  const { pathname } = req.nextUrl;

  // Allow public routes
  const isPublicPage = publicRoutes.some((route) => pathname.startsWith(route));
  const isPublicApi = publicApiRoutes.some((route) => pathname.startsWith(route));

  if (isPublicPage || isPublicApi) {
    return NextResponse.next();
  }

  // Require auth for dashboard and protected API routes
  if (!req.auth) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg).*)",
  ],
};
