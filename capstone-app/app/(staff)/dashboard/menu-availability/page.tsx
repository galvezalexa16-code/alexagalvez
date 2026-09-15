import Link from "next/link";
import { ArrowLeft, UtensilsCrossed, XCircle, HelpCircle, CheckCircle2 } from "lucide-react";
import { DashboardLayout } from "@/components/staff/layout/DashboardLayout";
import { MenuAvailabilityTable } from "@/components/staff/dashboard/MenuAvailabilityTable";

export const dynamic = "force-dynamic";

export default function MenuAvailabilityPage() {
  return (
    <DashboardLayout title="Menu Availability">
      <div className="mb-6">
        <Link href="/dashboard/inventory" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors mb-2">
          <ArrowLeft size={16} className="mr-1" />
          Back to Inventory
        </Link>
        <p className="text-slate-500 text-sm mt-2">
          Which dishes can still be sold &mdash; from ingredient stock, or from a counted item&apos;s own number on hand.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Dishes on the menu */}
        <div className="bg-white p-5 rounded-xl border-2 border-slate-700 flex gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
            <UtensilsCrossed className="text-blue-500" size={20} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Dishes on the menu</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">151</p>
            <p className="text-xs text-slate-400 mt-1">show everything</p>
          </div>
        </div>

        {/* Blocked */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 flex gap-4">
          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
            <XCircle className="text-red-500" size={20} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Blocked</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">1</p>
            <p className="text-xs text-slate-400 mt-1">cannot be sold now</p>
          </div>
        </div>

        {/* Needs a recipe */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 flex gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
            <HelpCircle className="text-amber-500" size={20} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Needs a recipe</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">2</p>
            <p className="text-xs text-slate-400 mt-1">availability not tracked</p>
          </div>
        </div>

        {/* Sellable */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 flex gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="text-emerald-500" size={20} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Sellable</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">148</p>
            <p className="text-xs text-slate-400 mt-1">good to go</p>
          </div>
        </div>
      </div>

      <MenuAvailabilityTable />
    </DashboardLayout>
  );
}
