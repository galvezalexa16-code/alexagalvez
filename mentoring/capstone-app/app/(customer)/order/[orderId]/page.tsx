"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { formatCurrency, generateOrderId, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Clock,
  ChefHat,
  Package,
  AlertCircle,
  QrCode,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import type { Order } from "@prisma/client";

interface OrderWithItems extends Order {
  items: any[];
  transaction: any;
  table: any;
}

const statusConfig = {
  PENDING: { icon: Clock, label: "Waiting", color: "text-yellow-600", bg: "bg-yellow-50" },
  PREPARING: {
    icon: ChefHat,
    label: "Preparing",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  READY: {
    icon: Package,
    label: "Ready for Pickup",
    color: "text-green-600",
    bg: "bg-green-50",
  },
  COMPLETED: {
    icon: CheckCircle2,
    label: "Completed",
    color: "text-slate-600",
    bg: "bg-slate-50",
  },
  CANCELLED: {
    icon: AlertCircle,
    label: "Cancelled",
    color: "text-red-600",
    bg: "bg-red-50",
  },
};

export default function OrderStatusPage({
  params,
}: {
  params: { orderId: string };
}) {
  const router = useRouter();
  const orderId = parseInt(params.orderId);
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD" | "QRPH">(
    "CASH"
  );

  // Fetch order details
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders?id=${orderId}`);
        const data = await response.json();
        if (data.length > 0) {
          setOrder(data[0]);
        }
      } catch (error) {
        console.error("Failed to fetch order:", error);
        toast.error("Failed to load order details");
      }
    };

    fetchOrder();
  }, [orderId]);

  // Generate QR code
  useEffect(() => {
    const generateQR = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}/qr`);
        const data = await response.json();
        setQrCode(data.qr);
      } catch (error) {
        console.error("Failed to generate QR:", error);
      }
    };

    generateQR();
  }, [orderId]);

  // Poll for order status updates
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/orders?id=${orderId}`);
        const data = await response.json();
        if (data.length > 0) {
          const newOrder = data[0];
          if (newOrder.status !== order?.status) {
            setOrder(newOrder);

            // Show toast for status changes
            if (newOrder.status === "READY") {
              toast.success("🎉 Your order is ready for pickup!");
            } else if (newOrder.status === "PREPARING") {
              toast.info("👨‍🍳 We're preparing your order");
            } else if (newOrder.status === "COMPLETED") {
              toast.success("✅ Order completed. Thank you!");
            }
          }
        }
      } catch (error) {
        console.error("Failed to poll order status:", error);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [orderId, order?.status]);

  const handlePayment = async () => {
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          amountPaid: order?.totalAmount,
          paymentMethod,
        }),
      });

      if (!response.ok) {
        throw new Error("Payment failed");
      }

      toast.success("Payment recorded successfully!");
      setShowPaymentModal(false);

      // Refresh order to show transaction
      const orderResponse = await fetch(`/api/orders?id=${orderId}`);
      const orderData = await orderResponse.json();
      if (orderData.length > 0) {
        setOrder(orderData[0]);
      }
    } catch (error) {
      toast.error("Failed to record payment");
    }
  };

  if (loading && !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-amber-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Order Not Found</h1>
          <p className="text-slate-600 mb-6">We couldn't find this order</p>
          <Link href="/menu">
            <Button className="bg-amber-600 hover:bg-amber-700">
              Back to Menu
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const config = statusConfig[order.status as keyof typeof statusConfig];
  const StatusIcon = config?.icon || Clock;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 pb-8">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-slate-900">Order Status</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Order Status Card */}
        <div className={`rounded-xl shadow-sm p-6 mb-6 ${config?.bg}`}>
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-full ${config?.bg} bg-opacity-40`}>
              <StatusIcon className={`w-8 h-8 ${config?.color}`} />
            </div>
            <div>
              <p className="text-sm text-slate-600">Order ID</p>
              <h2 className="text-2xl font-bold text-slate-900">
                {generateOrderId(order.id)}
              </h2>
            </div>
          </div>
          <p className={`text-lg font-semibold ${config?.color}`}>
            {config?.label}
          </p>
          <p className="text-sm text-slate-500 mt-2">
            Placed at {formatDate(order.createdAt)}
          </p>
        </div>

        {/* QR Code Section */}
        {qrCode && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Order Confirmation
              </h3>
              <button
                onClick={() => setShowQR(!showQR)}
                className="text-amber-600 hover:text-amber-700 transition-colors"
              >
                <QrCode className="w-6 h-6" />
              </button>
            </div>

            {showQR && (
              <div className="flex justify-center py-6 bg-slate-50 rounded-lg">
                <div className="relative w-64 h-64">
                  <Image
                    src={qrCode}
                    alt="Order QR Code"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            )}
            <p className="text-sm text-slate-500 text-center mt-4">
              Show this order confirmation to collect your order
            </p>
          </div>
        )}

        {/* Order Items */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Order Items
          </h3>
          <div className="space-y-3">
            {order.items.map((item: any) => (
              <div
                key={item.id}
                className="flex justify-between items-center pb-3 border-b border-slate-100 last:border-b-0"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {item.quantity}x {item.menuItem.name}
                  </p>
                  {item.variation && (
                    <p className="text-sm text-slate-500">{item.variation.name}</p>
                  )}
                </div>
                <p className="font-semibold text-slate-900">
                  {formatCurrency(Number(item.unitPrice) * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 pt-4 mt-4">
            <div className="flex justify-between text-lg font-bold">
              <span className="text-slate-900">Total</span>
              <span className="text-amber-600">
                {formatCurrency(Number(order.totalAmount))}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Section */}
        {!order.transaction && order.status === "READY" && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              Ready for Payment
            </h3>
            <p className="text-blue-800 mb-4">
              Your order is ready! Staff can now process the payment.
            </p>
            <Button
              onClick={() => setShowPaymentModal(true)}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Record Payment
            </Button>
          </div>
        )}

        {order.transaction && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-green-900 mb-3">
              ✅ Payment Received
            </h3>
            <div className="space-y-2 text-green-800">
              <p>Amount: {formatCurrency(Number(order.transaction.amountPaid))}</p>
              <p>Method: {order.transaction.paymentMethod}</p>
              <p>Time: {formatDate(order.transaction.createdAt)}</p>
            </div>
          </div>
        )}

        {/* Back Button */}
        <Link href="/menu">
          <Button variant="outline" className="w-full">
            Back to Menu
          </Button>
        </Link>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Record Payment</h2>

            <div className="space-y-3 mb-6">
              {(["CASH", "CARD", "QRPH"] as const).map((method) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                    paymentMethod === method
                      ? "border-amber-600 bg-amber-50"
                      : "border-slate-200 bg-white hover:border-amber-300"
                  }`}
                >
                  <p className="font-semibold text-slate-900">{method}</p>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowPaymentModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePayment}
                className="flex-1 bg-amber-600 hover:bg-amber-700"
              >
                Confirm Payment
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
