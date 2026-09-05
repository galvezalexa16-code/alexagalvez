"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type RoleOption = {
  key: string;
  label: string;
  description: string;
  color: string;
  icon: string;
};

const ROLES: RoleOption[] = [
  { key: "OWNER", label: "Owner", description: "Full system access", color: "bg-amber-500", icon: "👑" },
  { key: "ADMIN", label: "Admin", description: "Menu, users & reports", color: "bg-purple-500", icon: "🛡️" },
  { key: "SUPERVISOR", label: "Supervisor", description: "Menu, inventory & orders", color: "bg-blue-500", icon: "📋" },
];

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) {
      toast.error("Please select a role first");
      return;
    }
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid email or password");
      } else {
        toast.success("Welcome back!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-amber-500 flex items-center justify-center text-slate-900 font-bold text-2xl mx-auto mb-4 shadow-lg">
            E
          </div>
          <h1 className="text-white text-2xl font-bold">Ericahticos Cafe</h1>
          <p className="text-slate-400 text-sm mt-1">Staff Management Portal</p>
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700">
          {/* Role selection */}
          <div className="mb-6">
            <p className="text-slate-300 text-sm font-medium mb-3">Select your role</p>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map((role) => (
                <button
                  key={role.key}
                  type="button"
                  onClick={() => setSelectedRole(role.key)}
                  className={`relative p-3 rounded-xl border-2 text-center transition-all duration-150 ${
                    selectedRole === role.key
                      ? "border-amber-500 bg-amber-500/10"
                      : "border-slate-600 hover:border-slate-500 bg-slate-700/50"
                  }`}
                >
                  <div className="text-xl mb-1">{role.icon}</div>
                  <p className={`text-xs font-semibold ${selectedRole === role.key ? "text-amber-400" : "text-slate-300"}`}>
                    {role.label}
                  </p>
                  <p className="text-slate-500 text-[10px] mt-0.5 leading-tight">{role.description}</p>
                  {selectedRole === role.key && (
                    <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Login form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1.5" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@ericahticos.com"
                required
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1.5" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !selectedRole}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/40 disabled:cursor-not-allowed text-slate-900 font-semibold rounded-lg transition-colors duration-150 text-sm shadow-md"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Demo hint */}
          <div className="mt-4 p-3 bg-slate-700/50 rounded-lg border border-slate-600">
            <p className="text-slate-400 text-xs font-medium mb-1">Demo credentials:</p>
            <p className="text-slate-300 text-xs">owner@cafe.com / password123</p>
            <p className="text-slate-300 text-xs">admin@cafe.com / password123</p>
            <p className="text-slate-300 text-xs">supervisor@cafe.com / password123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
