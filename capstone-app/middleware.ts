import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // If already authenticated and hitting the login page, redirect to dashboard
    if (pathname === "/login" && token) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Role-based route protection for /dashboard sub-routes
    if (pathname.startsWith("/dashboard/users") && token?.role !== "OWNER" && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (pathname.startsWith("/dashboard/inventory") && token?.role === "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token, req }) {
        const { pathname } = req.nextUrl;

        // Public routes — always allowed
        const publicRoutes = ["/login", "/menu", "/cart", "/qr", "/order"];
        const publicApiRoutes = ["/api/auth", "/api/menu", "/api/tables", "/api/orders"];

        const isPublicPage = publicRoutes.some((r) => pathname.startsWith(r));
        const isPublicApi = publicApiRoutes.some((r) => pathname.startsWith(r));

        if (isPublicPage || isPublicApi) {
          return true;
        }

        // All other routes require a valid token
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg).*)",
  ],
};
