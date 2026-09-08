"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/staff/layout/DashboardLayout";
import { OrderTable } from "@/components/staff/orders/OrderTable";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Order } from "@prisma/client";

interface OrderWithItems extends Order {
  items: any[];
  transaction: any;
  table: any;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedStatus && selectedStatus !== "all") {
        params.append("status", selectedStatus);
      }

      const response = await fetch(`/api/orders?${params.toString()}`);
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [selectedStatus]);

  const statuses = ["PENDING", "PREPARING", "READY", "COMPLETED"];
  const statusCounts = {
    PENDING: orders.filter((o) => o.status === "PENDING").length,
    PREPARING: orders.filter((o) => o.status === "PREPARING").length,
    READY: orders.filter((o) => o.status === "READY").length,
    COMPLETED: orders.filter((o) => o.status === "COMPLETED").length,
  };

  const filteredOrders =
    selectedStatus && selectedStatus !== "all"
      ? orders.filter((o) => o.status === selectedStatus)
      : orders;

  return (
    <DashboardLayout title="Orders">
      <div className="space-y-6">
        {/* Status Filter Tabs */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <Tabs value={selectedStatus || "all"} onValueChange={setSelectedStatus}>
            <TabsList className="grid w-full grid-cols-5 gap-2 bg-transparent h-auto p-0">
              <TabsTrigger
                value="all"
                className="rounded-lg data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900"
              >
                <span>All</span>
                <span className="ml-2 text-xs font-bold text-slate-600">
                  ({orders.length})
                </span>
              </TabsTrigger>
              {statuses.map((status) => (
                <TabsTrigger
                  key={status}
                  value={status}
                  className="rounded-lg data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900"
                >
                  <span>{status}</span>
                  <span className="ml-2 text-xs font-bold text-slate-600">
                    ({statusCounts[status as keyof typeof statusCounts]})
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Orders Table */}
        {loading ? (
          <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
            <div className="inline-flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
            </div>
            <p className="mt-4 text-slate-500">Loading orders...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <OrderTable orders={filteredOrders} onStatusChange={fetchOrders} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
