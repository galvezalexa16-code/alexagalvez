import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ericahticos Cafe | Order Now",
  description: "Browse our menu and place your order",
};

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {children}
    </div>
  );
}
