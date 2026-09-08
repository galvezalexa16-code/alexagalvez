import { db } from "@/lib/db";

const LOW_STOCK_THRESHOLD = 20;

// Inventory Analytics

export async function getLowStockItems() {
  return db.inventoryItem.findMany({
    where: { status: "LOW" },
    include: { category: true },
    orderBy: { stockQuantity: "asc" },
  });
}

export async function getRestockRecommendations() {
  const lowStockItems = await getLowStockItems();
  const orders = await db.order.findMany({
    where: { status: "COMPLETED" },
    include: { items: { include: { menuItem: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  // Calculate item frequencies in completed orders
  const itemFrequency: Record<number, number> = {};
  orders.forEach((order) => {
    order.items.forEach((item) => {
      itemFrequency[item.menuItemId] = (itemFrequency[item.menuItemId] || 0) + 1;
    });
  });

  // Recommend restocking for low stock + high frequency items
  return lowStockItems.filter((item) => {
    // Find menu items using this ingredient
    const menuItems = await db.menuItemIngredient.findMany({
      where: { ingredientId: item.id },
      include: { menuItem: true },
    });

    const menuItemIds = menuItems.map((m) => m.menuItemId);
    const frequency = menuItemIds.reduce((sum, id) => sum + (itemFrequency[id] || 0), 0);

    return frequency > 0;
  });
}

export async function getFastMovingItems() {
  const orders = await db.order.findMany({
    where: { status: "COMPLETED" },
    include: { items: { include: { menuItem: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  // Count item frequencies
  const itemCount: Record<string, { count: number; name: string }> = {};
  orders.forEach((order) => {
    order.items.forEach((item) => {
      const key = item.menuItem.id.toString();
      itemCount[key] = {
        count: (itemCount[key]?.count || 0) + item.quantity,
        name: item.menuItem.name,
      };
    });
  });

  return Object.entries(itemCount)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 5)
    .map(([, item]) => item);
}

export async function predictStockDepletion() {
  const items = await db.inventoryItem.findMany({
    where: { status: "LOW" },
  });

  const predictions = items.map((item) => {
    // Simple prediction: assume daily consumption based on recent orders
    // In production, this would use more sophisticated forecasting
    const daysUntilEmpty = Math.ceil(Number(item.stockQuantity) / 2); // Assume 2 units/day avg
    return {
      name: item.name,
      daysUntilEmpty: Math.max(1, daysUntilEmpty),
      quantity: Number(item.stockQuantity),
    };
  });

  return predictions;
}

// Revenue Analytics

export async function calculateRevenueTrend(period: "day" | "week" | "month" | "year") {
  const now = new Date();
  let startDate = new Date();

  switch (period) {
    case "day":
      startDate.setHours(0, 0, 0, 0);
      break;
    case "week":
      startDate.setDate(now.getDate() - 7);
      break;
    case "month":
      startDate.setMonth(now.getMonth() - 1);
      break;
    case "year":
      startDate.setFullYear(now.getFullYear() - 1);
      break;
  }

  const orders = await db.order.findMany({
    where: {
      createdAt: { gte: startDate },
      transaction: { isNot: null },
    },
    include: { transaction: true },
  });

  // Group by date
  const data: Record<string, number> = {};
  orders.forEach((order) => {
    const date = new Date(order.createdAt).toLocaleDateString();
    data[date] = (data[date] || 0) + Number(order.totalAmount);
  });

  return Object.entries(data).map(([date, revenue]) => ({
    date,
    revenue: Math.round(revenue),
  }));
}

export async function calculateProfitTrend(period: "day" | "week" | "month" | "year") {
  const now = new Date();
  let startDate = new Date();

  switch (period) {
    case "day":
      startDate.setHours(0, 0, 0, 0);
      break;
    case "week":
      startDate.setDate(now.getDate() - 7);
      break;
    case "month":
      startDate.setMonth(now.getMonth() - 1);
      break;
    case "year":
      startDate.setFullYear(now.getFullYear() - 1);
      break;
  }

  const [orders, expenses] = await Promise.all([
    db.order.findMany({
      where: {
        createdAt: { gte: startDate },
        transaction: { isNot: null },
      },
      include: { transaction: true },
    }),
    db.expense.findMany({
      where: { createdAt: { gte: startDate } },
    }),
  ]);

  // Group revenue by date
  const revenueByDate: Record<string, number> = {};
  orders.forEach((order) => {
    const date = new Date(order.createdAt).toLocaleDateString();
    revenueByDate[date] = (revenueByDate[date] || 0) + Number(order.totalAmount);
  });

  // Group expenses by date
  const expensesByDate: Record<string, number> = {};
  expenses.forEach((expense) => {
    const date = new Date(expense.createdAt).toLocaleDateString();
    expensesByDate[date] = (expensesByDate[date] || 0) + Number(expense.amount);
  });

  // Merge and calculate profit
  const allDates = new Set([...Object.keys(revenueByDate), ...Object.keys(expensesByDate)]);
  return Array.from(allDates)
    .sort()
    .map((date) => ({
      date,
      revenue: revenueByDate[date] || 0,
      expenses: expensesByDate[date] || 0,
      profit: (revenueByDate[date] || 0) - (expensesByDate[date] || 0),
    }));
}

export async function getTopSellingItems() {
  const orders = await db.order.findMany({
    where: { status: "COMPLETED" },
    include: {
      items: {
        include: { menuItem: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const itemStats: Record<string, { name: string; count: number; revenue: number }> = {};

  orders.forEach((order) => {
    order.items.forEach((item) => {
      const key = item.menuItem.id.toString();
      if (!itemStats[key]) {
        itemStats[key] = {
          name: item.menuItem.name,
          count: 0,
          revenue: 0,
        };
      }
      itemStats[key].count += item.quantity;
      itemStats[key].revenue += Number(item.unitPrice) * item.quantity;
    });
  });

  return Object.values(itemStats)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);
}

export async function getSummaryStats(period: "day" | "week" | "month" | "year") {
  const now = new Date();
  let startDate = new Date();

  switch (period) {
    case "day":
      startDate.setHours(0, 0, 0, 0);
      break;
    case "week":
      startDate.setDate(now.getDate() - 7);
      break;
    case "month":
      startDate.setMonth(now.getMonth() - 1);
      break;
    case "year":
      startDate.setFullYear(now.getFullYear() - 1);
      break;
  }

  const [orders, expenses] = await Promise.all([
    db.order.findMany({
      where: {
        createdAt: { gte: startDate },
        transaction: { isNot: null },
      },
      include: { transaction: true },
    }),
    db.expense.findMany({
      where: { createdAt: { gte: startDate } },
    }),
  ]);

  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const totalProfit = totalRevenue - totalExpenses;
  const totalOrders = orders.length;

  return {
    totalRevenue: Math.round(totalRevenue),
    totalExpenses: Math.round(totalExpenses),
    totalProfit: Math.round(totalProfit),
    totalOrders,
    averageOrderValue:
      totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
  };
}
