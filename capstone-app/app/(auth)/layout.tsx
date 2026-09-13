// Public layout for unauthenticated pages (e.g. /login).
// No session guard here — the middleware handles public route access.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
