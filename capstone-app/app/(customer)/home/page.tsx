import Link from "next/link";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { UtensilsCrossed, Clock, MapPin, Star, ChevronRight, Coffee } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Ericahlicious Cafe — Home",
  description: "A cozy cafe serving Filipino-inspired food, coffee, and sweet drinks.",
};

async function getFeaturedItems() {
  try {
    return await db.menuItem.findMany({
      where: { isArchived: false },
      include: { category: true },
      take: 6,
      orderBy: { createdAt: "asc" },
    });
  } catch {
    return [];
  }
}

export default async function LandingPage() {
  const featuredItems = await getFeaturedItems();

  return (
    <div className="min-h-screen bg-[#fdf8f3]">
      {/* ── NAV ───────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-amber-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-slate-900 font-black text-lg shadow-md">
              E
            </div>
            <span className="font-bold text-slate-900 text-lg tracking-tight">Ericahlicious</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/store"
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-amber-600 transition-colors"
            >
              <UtensilsCrossed size={15} />
              Order Now
            </Link>
            <Link
              href="/store"
              className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm px-4 py-2 rounded-full shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              View Menu
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 pt-20 pb-28">
        {/* decorative blobs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-300/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-orange-300/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-5 text-center">
          <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-amber-200">
            <Coffee size={12} />
            Open Daily · 7AM – 10PM
          </span>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-slate-900 leading-tight tracking-tight mb-6">
            Good food,<br />
            <span className="text-amber-500">great vibes.</span>
          </h1>
          <p className="text-slate-600 text-lg sm:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
            Filipino-inspired cafe fare — pasta, rice meals, pastries and handcrafted coffee drinks made fresh every day.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/store"
              className="group flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-base px-8 py-4 rounded-2xl shadow-xl transition-all hover:shadow-amber-200/60 hover:-translate-y-1"
            >
              Order Now
              <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/store"
              className="flex items-center gap-2 text-slate-700 hover:text-amber-600 font-semibold text-base px-6 py-4 rounded-2xl border border-slate-200 bg-white hover:border-amber-300 transition-all shadow-sm"
            >
              Browse Menu
            </Link>
          </div>
        </div>
      </section>

      {/* ── WHY US ────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[
              {
                icon: <UtensilsCrossed size={28} className="text-amber-500" />,
                title: "Fresh Every Day",
                desc: "All our dishes are prepared fresh daily with quality local ingredients.",
              },
              {
                icon: <Clock size={28} className="text-amber-500" />,
                title: "Fast Service",
                desc: "Scan, order, and enjoy — our digital ordering cuts your wait time.",
              },
              {
                icon: <Star size={28} className="text-amber-500" />,
                title: "Filipino Favorites",
                desc: "Rice meals, pasta, and handcrafted drinks inspired by local flavors.",
              },
            ].map((f) => (
              <div key={f.title} className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-amber-50 border border-amber-100">
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-amber-100">
                  {f.icon}
                </div>
                <h3 className="font-bold text-slate-900 text-lg">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED MENU ─────────────────────────────────────── */}
      {featuredItems.length > 0 && (
        <section className="py-20 bg-[#fdf8f3]">
          <div className="max-w-6xl mx-auto px-5">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-amber-600 font-semibold text-sm uppercase tracking-widest mb-2">What we serve</p>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Featured Items</h2>
              </div>
              <Link
                href="/store"
                className="hidden sm:flex items-center gap-1 text-amber-600 hover:text-amber-700 font-semibold text-sm"
              >
                See all <ChevronRight size={15} />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredItems.map((item) => (
                <Link
                  key={item.id}
                  href="/store"
                  className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="h-48 bg-gradient-to-br from-amber-50 to-orange-50 relative overflow-hidden">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        🍽️
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="bg-white/90 backdrop-blur-sm text-slate-600 text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-sm border border-white">
                        {item.category.name}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-slate-900 text-base leading-snug mb-1">{item.name}</h3>
                    <p className="text-amber-600 font-bold text-base">{formatCurrency(Number(item.price))}</p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link
                href="/store"
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-8 py-4 rounded-2xl shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-amber-200/60"
              >
                View Full Menu
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── INFO ──────────────────────────────────────────────── */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-amber-400 font-semibold text-sm uppercase tracking-widest mb-3">Find us</p>
              <h2 className="text-3xl sm:text-4xl font-black mb-6 leading-tight">Come visit us<br />anytime</h2>
              <div className="space-y-4 text-slate-300">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-amber-400 mt-0.5 shrink-0" />
                  <p className="text-sm leading-relaxed">Somewhere in Cavite, Philippines<br />Near the town center</p>
                </div>
                <div className="flex items-start gap-3">
                  <Clock size={18} className="text-amber-400 mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p>Monday – Friday: 7:00 AM – 9:00 PM</p>
                    <p>Saturday – Sunday: 8:00 AM – 10:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Order digitally</p>
                <p className="text-slate-200 text-sm leading-relaxed mb-4">
                  Scan the QR code on your table to browse the menu and place your order directly from your phone — no app needed.
                </p>
                <Link
                  href="/store"
                  className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-sm px-5 py-2.5 rounded-xl transition-colors"
                >
                  Order Online
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer className="bg-slate-950 py-8 text-center text-slate-500 text-sm">
        <p>© 2026 Ericahlicious Cafe. All rights reserved.</p>
        <div className="mt-2 flex items-center justify-center gap-4 text-xs">
          <Link href="/store" className="hover:text-amber-400 transition-colors">Menu</Link>
          <Link href="/login" className="hover:text-amber-400 transition-colors">Staff Login</Link>
        </div>
      </footer>
    </div>
  );
}
