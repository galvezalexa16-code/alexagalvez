import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await Promise.all([
    prisma.transaction.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.menuItemIngredient.deleteMany(),
    prisma.menuItemVariation.deleteMany(),
    prisma.menuItem.deleteMany(),
    prisma.menuCategory.deleteMany(),
    prisma.inventoryItem.deleteMany(),
    prisma.inventoryCategory.deleteMany(),
    prisma.restaurantTable.deleteMany(),
    prisma.expense.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  console.log("🗑️  Cleared existing data");

  // ── USERS ──────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash("password123", 10);

  const owner = await prisma.user.create({
    data: {
      name: "Maria Ericahticos",
      email: "owner@ericahticos.com",
      password: hashedPassword,
      role: "OWNER",
      status: "ACTIVE",
    },
  });

  const admin = await prisma.user.create({
    data: {
      name: "Juan Admin",
      email: "admin@ericahticos.com",
      password: hashedPassword,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  const supervisor = await prisma.user.create({
    data: {
      name: "Rosa Supervisor",
      email: "supervisor@ericahticos.com",
      password: hashedPassword,
      role: "SUPERVISOR",
      status: "ACTIVE",
    },
  });

  console.log("✅ Created users");

  // ── RESTAURANT TABLES ──────────────────────────────────
  const tables = await Promise.all([
    prisma.restaurantTable.create({
      data: { name: "Table 1", qrCode: "table_001" },
    }),
    prisma.restaurantTable.create({
      data: { name: "Table 2", qrCode: "table_002" },
    }),
    prisma.restaurantTable.create({
      data: { name: "Table 3", qrCode: "table_003" },
    }),
    prisma.restaurantTable.create({
      data: { name: "Table 4", qrCode: "table_004" },
    }),
    prisma.restaurantTable.create({
      data: { name: "Table 5", qrCode: "table_005" },
    }),
    prisma.restaurantTable.create({
      data: { name: "Counter", qrCode: "counter_walk_in" },
    }),
  ]);

  console.log("✅ Created restaurant tables");

  // ── MENU CATEGORIES ────────────────────────────────────
  const categories = await Promise.all([
    prisma.menuCategory.create({
      data: { name: "Rice Meals", slug: "rice-meals" },
    }),
    prisma.menuCategory.create({
      data: { name: "Pasta", slug: "pasta" },
    }),
    prisma.menuCategory.create({
      data: { name: "Snacks", slug: "snacks" },
    }),
    prisma.menuCategory.create({
      data: { name: "Cakes", slug: "cakes" },
    }),
    prisma.menuCategory.create({
      data: { name: "Coffee Drinks", slug: "coffee-drinks" },
    }),
    prisma.menuCategory.create({
      data: { name: "Iced Drinks", slug: "iced-drinks" },
    }),
  ]);

  console.log("✅ Created menu categories");

  // ── MENU ITEMS ─────────────────────────────────────────
  const menuItems = await Promise.all([
    // Rice Meals
    prisma.menuItem.create({
      data: {
        name: "Chicken Fried Rice",
        categoryId: categories[0].id,
        price: "150",
        imageUrl: "https://images.unsplash.com/photo-1603894723492-400da876dd81?w=400&h=300&fit=crop",
        variations: {
          create: [
            { name: "Regular", priceMod: "0" },
            { name: "Large", priceMod: "50" },
          ],
        },
      },
      include: { variations: true },
    }),
    prisma.menuItem.create({
      data: {
        name: "Garlic Fried Rice",
        categoryId: categories[0].id,
        price: "130",
        imageUrl: "https://images.unsplash.com/photo-1552684378-8bda9c6ba59f?w=400&h=300&fit=crop",
        variations: {
          create: [
            { name: "Regular", priceMod: "0" },
            { name: "Large", priceMod: "50" },
          ],
        },
      },
      include: { variations: true },
    }),
    // Pasta
    prisma.menuItem.create({
      data: {
        name: "Chicken Alfredo",
        categoryId: categories[1].id,
        price: "200",
        imageUrl: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop",
        variations: {
          create: [
            { name: "Penne", priceMod: "0" },
            { name: "Fettuccine", priceMod: "20" },
          ],
        },
      },
      include: { variations: true },
    }),
    prisma.menuItem.create({
      data: {
        name: "Carbonara",
        categoryId: categories[1].id,
        price: "180",
        imageUrl: "https://images.unsplash.com/photo-1612874742237-6526221fcf0f?w=400&h=300&fit=crop",
        variations: {
          create: [
            { name: "Penne", priceMod: "0" },
            { name: "Spaghetti", priceMod: "0" },
          ],
        },
      },
      include: { variations: true },
    }),
    // Snacks
    prisma.menuItem.create({
      data: {
        name: "Lumpia (6 pcs)",
        categoryId: categories[2].id,
        price: "80",
        imageUrl: "https://images.unsplash.com/photo-1608270861620-7bec82f0a855?w=400&h=300&fit=crop",
      },
    }),
    prisma.menuItem.create({
      data: {
        name: "Chicken Nuggets",
        categoryId: categories[2].id,
        price: "100",
        imageUrl: "https://images.unsplash.com/photo-1559329007-40790c9fdf4d?w=400&h=300&fit=crop",
      },
    }),
    // Cakes
    prisma.menuItem.create({
      data: {
        name: "Chocolate Cake Slice",
        categoryId: categories[3].id,
        price: "75",
        imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop",
      },
    }),
    prisma.menuItem.create({
      data: {
        name: "Ube Cake Slice",
        categoryId: categories[3].id,
        price: "80",
        imageUrl: "https://images.unsplash.com/photo-1595080876857-8a42ebc5dde5?w=400&h=300&fit=crop",
      },
    }),
    // Coffee Drinks
    prisma.menuItem.create({
      data: {
        name: "Americano",
        categoryId: categories[4].id,
        price: "65",
        imageUrl: "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=400&h=300&fit=crop",
        variations: {
          create: [
            { name: "Small", priceMod: "0" },
            { name: "Medium", priceMod: "15" },
            { name: "Large", priceMod: "25" },
          ],
        },
      },
      include: { variations: true },
    }),
    prisma.menuItem.create({
      data: {
        name: "Spanish Latte",
        categoryId: categories[4].id,
        price: "85",
        imageUrl: "https://images.unsplash.com/photo-1511537190424-f06a0cf6f1de?w=400&h=300&fit=crop",
        variations: {
          create: [
            { name: "Small", priceMod: "0" },
            { name: "Medium", priceMod: "15" },
            { name: "Large", priceMod: "25" },
          ],
        },
      },
      include: { variations: true },
    }),
    // Iced Drinks
    prisma.menuItem.create({
      data: {
        name: "Iced Coffee",
        categoryId: categories[5].id,
        price: "75",
        imageUrl: "https://images.unsplash.com/photo-1517701550927-30cf4ba20d4d?w=400&h=300&fit=crop",
        variations: {
          create: [
            { name: "Regular", priceMod: "0" },
            { name: "Large", priceMod: "20" },
          ],
        },
      },
      include: { variations: true },
    }),
    prisma.menuItem.create({
      data: {
        name: "Iced Chocolate",
        categoryId: categories[5].id,
        price: "85",
        imageUrl: "https://images.unsplash.com/photo-1577003832033-a490ddeec782?w=400&h=300&fit=crop",
        variations: {
          create: [
            { name: "Regular", priceMod: "0" },
            { name: "Large", priceMod: "20" },
          ],
        },
      },
      include: { variations: true },
    }),
  ]);

  console.log("✅ Created menu items");

  // ── INVENTORY CATEGORIES ───────────────────────────────
  const invCategories = await Promise.all([
    prisma.inventoryCategory.create({ data: { name: "Dairy" } }),
    prisma.inventoryCategory.create({ data: { name: "Syrups" } }),
    prisma.inventoryCategory.create({ data: { name: "Powders" } }),
    prisma.inventoryCategory.create({ data: { name: "Baking" } }),
    prisma.inventoryCategory.create({ data: { name: "Pasta" } }),
    prisma.inventoryCategory.create({ data: { name: "Meat" } }),
  ]);

  console.log("✅ Created inventory categories");

  // ── INVENTORY ITEMS ────────────────────────────────────
  const inventoryItems = await Promise.all([
    // Dairy
    prisma.inventoryItem.create({
      data: {
        name: "Fresh Milk",
        categoryId: invCategories[0].id,
        stockQuantity: "45",
        unit: "L",
        supplier: "Local Dairy Farm",
        status: "GOOD",
        updatedById: owner.id,
      },
    }),
    prisma.inventoryItem.create({
      data: {
        name: "Condensed Milk",
        categoryId: invCategories[0].id,
        stockQuantity: "8",
        unit: "cans",
        supplier: "SMI",
        status: "LOW",
        updatedById: supervisor.id,
      },
    }),
    // Syrups
    prisma.inventoryItem.create({
      data: {
        name: "Espresso Syrup",
        categoryId: invCategories[1].id,
        stockQuantity: "15",
        unit: "bottles",
        supplier: "Davinci",
        status: "LOW",
        updatedById: supervisor.id,
      },
    }),
    prisma.inventoryItem.create({
      data: {
        name: "Chocolate Syrup",
        categoryId: invCategories[1].id,
        stockQuantity: "25",
        unit: "bottles",
        supplier: "Davinci",
        status: "GOOD",
        updatedById: supervisor.id,
      },
    }),
    // Powders
    prisma.inventoryItem.create({
      data: {
        name: "Chocolate Powder",
        categoryId: invCategories[2].id,
        stockQuantity: "3",
        unit: "kg",
        supplier: "Cacao Premium",
        status: "LOW",
        updatedById: supervisor.id,
      },
    }),
    prisma.inventoryItem.create({
      data: {
        name: "Coffee Powder",
        categoryId: invCategories[2].id,
        stockQuantity: "12",
        unit: "kg",
        supplier: "Barista's Choice",
        status: "GOOD",
        updatedById: supervisor.id,
      },
    }),
    // Baking
    prisma.inventoryItem.create({
      data: {
        name: "All-Purpose Flour",
        categoryId: invCategories[3].id,
        stockQuantity: "50",
        unit: "kg",
        supplier: "Golden Crown",
        status: "GOOD",
        updatedById: supervisor.id,
      },
    }),
    prisma.inventoryItem.create({
      data: {
        name: "Sugar",
        categoryId: invCategories[3].id,
        stockQuantity: "0",
        unit: "kg",
        supplier: "Sugar Corp",
        status: "OUT_OF_STOCK",
        updatedById: supervisor.id,
      },
    }),
    // Pasta
    prisma.inventoryItem.create({
      data: {
        name: "Penne Pasta",
        categoryId: invCategories[4].id,
        stockQuantity: "30",
        unit: "packs",
        supplier: "Barilla",
        status: "GOOD",
        updatedById: supervisor.id,
      },
    }),
    prisma.inventoryItem.create({
      data: {
        name: "Fettuccine Pasta",
        categoryId: invCategories[4].id,
        stockQuantity: "18",
        unit: "packs",
        supplier: "Barilla",
        status: "GOOD",
        updatedById: supervisor.id,
      },
    }),
    // Meat
    prisma.inventoryItem.create({
      data: {
        name: "Chicken Breast",
        categoryId: invCategories[5].id,
        stockQuantity: "10",
        unit: "kg",
        supplier: "Fresh Meat Co",
        status: "LOW",
        updatedById: supervisor.id,
        expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.inventoryItem.create({
      data: {
        name: "Ground Pork",
        categoryId: invCategories[5].id,
        stockQuantity: "8",
        unit: "kg",
        supplier: "Fresh Meat Co",
        status: "LOW",
        updatedById: supervisor.id,
        expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  console.log("✅ Created inventory items");

  // ── ORDERS (with items and transactions) ─────────────
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const order1 = await prisma.order.create({
    data: {
      tableId: tables[0].id,
      orderType: "DINE_IN",
      status: "COMPLETED",
      totalAmount: "335",
      createdAt: new Date(oneWeekAgo.getTime() + 2 * 60 * 60 * 1000),
      items: {
        create: [
          {
            menuItemId: menuItems[0].id,
            variationId: menuItems[0].variations?.[0]?.id,
            quantity: 2,
            unitPrice: "150",
          },
          {
            menuItemId: menuItems[8].id,
            variationId: menuItems[8].variations?.[0]?.id,
            quantity: 1,
            unitPrice: "65",
          },
        ],
      },
      transaction: {
        create: {
          staffId: supervisor.id,
          amountPaid: "335",
          paymentMethod: "CASH",
          status: "PAID",
        },
      },
    },
  });

  const order2 = await prisma.order.create({
    data: {
      tableId: tables[1].id,
      orderType: "DINE_IN",
      status: "COMPLETED",
      totalAmount: "480",
      createdAt: new Date(oneWeekAgo.getTime() + 4 * 60 * 60 * 1000),
      items: {
        create: [
          {
            menuItemId: menuItems[2].id,
            variationId: menuItems[2].variations?.[0]?.id,
            quantity: 1,
            unitPrice: "200",
          },
          {
            menuItemId: menuItems[9].id,
            variationId: menuItems[9].variations?.[0]?.id,
            quantity: 3,
            unitPrice: "85",
          },
          {
            menuItemId: menuItems[6].id,
            quantity: 1,
            unitPrice: "75",
          },
        ],
      },
      transaction: {
        create: {
          staffId: supervisor.id,
          amountPaid: "480",
          paymentMethod: "CARD",
          status: "PAID",
        },
      },
    },
  });

  const order3 = await prisma.order.create({
    data: {
      orderType: "TAKE_OUT",
      status: "COMPLETED",
      totalAmount: "255",
      createdAt: new Date(oneWeekAgo.getTime() + 6 * 60 * 60 * 1000),
      items: {
        create: [
          {
            menuItemId: menuItems[4].id,
            quantity: 2,
            unitPrice: "80",
          },
          {
            menuItemId: menuItems[10].id,
            variationId: menuItems[10].variations?.[0]?.id,
            quantity: 1,
            unitPrice: "75",
          },
        ],
      },
      transaction: {
        create: {
          staffId: admin.id,
          amountPaid: "255",
          paymentMethod: "CASH",
          status: "PAID",
        },
      },
    },
  });

  // More orders for better analytics
  const order4 = await prisma.order.create({
    data: {
      tableId: tables[2].id,
      orderType: "DINE_IN",
      status: "COMPLETED",
      totalAmount: "290",
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      items: {
        create: [
          {
            menuItemId: menuItems[1].id,
            variationId: menuItems[1].variations?.[1]?.id,
            quantity: 1,
            unitPrice: "180",
          },
          {
            menuItemId: menuItems[9].id,
            variationId: menuItems[9].variations?.[0]?.id,
            quantity: 2,
            unitPrice: "85",
          },
        ],
      },
      transaction: {
        create: {
          staffId: supervisor.id,
          amountPaid: "290",
          paymentMethod: "QRPH",
          status: "PAID",
        },
      },
    },
  });

  const order5 = await prisma.order.create({
    data: {
      tableId: tables[0].id,
      orderType: "DINE_IN",
      status: "PENDING",
      totalAmount: "425",
      items: {
        create: [
          {
            menuItemId: menuItems[0].id,
            variationId: menuItems[0].variations?.[0]?.id,
            quantity: 1,
            unitPrice: "150",
          },
          {
            menuItemId: menuItems[2].id,
            variationId: menuItems[2].variations?.[1]?.id,
            quantity: 1,
            unitPrice: "220",
          },
          {
            menuItemId: menuItems[11].id,
            variationId: menuItems[11].variations?.[1]?.id,
            quantity: 1,
            unitPrice: "105",
          },
        ],
      },
    },
  });

  console.log("✅ Created orders with transactions");

  // ── EXPENSES ───────────────────────────────────────────
  await Promise.all([
    prisma.expense.create({
      data: {
        description: "Supplier Payment - Fresh Meat Co",
        amount: "5000",
        recordedById: supervisor.id,
        createdAt: new Date(oneWeekAgo.getTime() + 1 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.expense.create({
      data: {
        description: "Utilities - Water & Electricity",
        amount: "3500",
        recordedById: admin.id,
        createdAt: new Date(oneWeekAgo.getTime() + 3 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.expense.create({
      data: {
        description: "Staff Salary",
        amount: "8000",
        recordedById: owner.id,
        createdAt: new Date(oneWeekAgo.getTime() + 5 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  console.log("✅ Created expenses");
  console.log("✨ Seeding complete!");
  console.log("\n📝 Demo Credentials:");
  console.log("   Owner:      owner@ericahticos.com / password123");
  console.log("   Admin:      admin@ericahticos.com / password123");
  console.log("   Supervisor: supervisor@ericahticos.com / password123");
  console.log("\n🍽️  Counter QR Code: http://localhost:3000/qr/6");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
