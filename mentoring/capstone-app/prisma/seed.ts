import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Clear existing data (order matters for FK constraints)
  await prisma.transaction.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menuItemIngredient.deleteMany();
  await prisma.menuItemVariation.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.menuCategory.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.inventoryCategory.deleteMany();
  await prisma.restaurantTable.deleteMany();
  await prisma.user.deleteMany();

  // ── USERS ──────────────────────────────────────────
  const hashedPassword = await bcrypt.hash("password123", 10);

  const owner = await prisma.user.create({
    data: {
      name: "Ericah Rivera Calayag",
      email: "owner@cafe.com",
      password: hashedPassword,
      role: "OWNER",
    },
  });

  const admin = await prisma.user.create({
    data: {
      name: "Samantha Santos",
      email: "admin@cafe.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  await prisma.user.create({
    data: {
      name: "Carlos Reyes",
      email: "supervisor@cafe.com",
      password: hashedPassword,
      role: "SUPERVISOR",
    },
  });

  console.log("✅ Users seeded");

  // ── MENU CATEGORIES ────────────────────────────────
  const pasta = await prisma.menuCategory.create({ data: { name: "Pasta", slug: "pasta" } });
  const riceMeals = await prisma.menuCategory.create({ data: { name: "Rice Meals", slug: "rice-meals" } });
  const snacks = await prisma.menuCategory.create({ data: { name: "Pica-Pica / Snacks", slug: "pica-pica-snacks" } });
  const cakes = await prisma.menuCategory.create({ data: { name: "Cakes", slug: "cakes" } });
  const icedDrinks = await prisma.menuCategory.create({ data: { name: "Coffee / Iced Drinks", slug: "coffee-iced-drinks" } });
  const sweetDrinks = await prisma.menuCategory.create({ data: { name: "Sweet Drinks", slug: "sweet-drinks" } });

  console.log("✅ Menu categories seeded");

  // ── INVENTORY CATEGORIES ───────────────────────────
  const dairyInvCat = await prisma.inventoryCategory.create({ data: { name: "Dairy" } });
  const syrupsInvCat = await prisma.inventoryCategory.create({ data: { name: "Syrups" } });
  const powdersInvCat = await prisma.inventoryCategory.create({ data: { name: "Powders" } });
  const bakingInvCat = await prisma.inventoryCategory.create({ data: { name: "Baking" } });
  await prisma.inventoryCategory.create({ data: { name: "Pasta" } });
  await prisma.inventoryCategory.create({ data: { name: "Sweeteners" } });
  await prisma.inventoryCategory.create({ data: { name: "Meat" } });

  // ── INVENTORY ITEMS ────────────────────────────────
  const milk = await prisma.inventoryItem.create({
    data: {
      name: "Fresh Milk",
      categoryId: dairyInvCat.id,
      stockQuantity: 10,
      unit: "L",
      supplier: "Magnolia",
      expiryDate: new Date("2026-09-30"),
      status: "GOOD",
      updatedById: admin.id,
    },
  });

  const espressoSyrup = await prisma.inventoryItem.create({
    data: {
      name: "Espresso Syrup",
      categoryId: syrupsInvCat.id,
      stockQuantity: 2.5,
      unit: "L",
      supplier: "Davinci",
      expiryDate: new Date("2026-12-31"),
      status: "LOW",
      updatedById: admin.id,
    },
  });

  const chocoPowder = await prisma.inventoryItem.create({
    data: {
      name: "Chocolate Powder",
      categoryId: powdersInvCat.id,
      stockQuantity: 5,
      unit: "kg",
      supplier: "Hershey's",
      expiryDate: new Date("2027-03-15"),
      status: "GOOD",
      updatedById: admin.id,
    },
  });

  await prisma.inventoryItem.create({
    data: {
      name: "All-Purpose Flour",
      categoryId: bakingInvCat.id,
      stockQuantity: 8,
      unit: "kg",
      supplier: "Gold Medal",
      expiryDate: new Date("2026-11-20"),
      status: "GOOD",
      updatedById: admin.id,
    },
  });

  console.log("✅ Inventory seeded");

  // ── MENU ITEMS ─────────────────────────────────────
  const spanishLatte = await prisma.menuItem.create({
    data: {
      name: "Spanish Latte",
      categoryId: icedDrinks.id,
      price: 185,
      imageUrl: "https://placehold.co/400x300/teal/white?text=Spanish+Latte",
    },
  });

  const javaChipFrappe = await prisma.menuItem.create({
    data: {
      name: "Chocolate Java Chip Frappe",
      categoryId: sweetDrinks.id,
      price: 195,
      imageUrl: "https://placehold.co/400x300/brown/white?text=Java+Chip",
    },
  });

  const chickenAlfredo = await prisma.menuItem.create({
    data: {
      name: "Chicken Alfredo",
      categoryId: pasta.id,
      price: 210,
      imageUrl: "https://placehold.co/400x300/cream/white?text=Chicken+Alfredo",
    },
  });

  const filipinoBreakfast = await prisma.menuItem.create({
    data: {
      name: "Filipino Breakfast",
      categoryId: riceMeals.id,
      price: 165,
      imageUrl: "https://placehold.co/400x300/orange/white?text=Fil+Breakfast",
    },
  });

  await prisma.menuItem.create({
    data: {
      name: "Chocolate Cake Slice",
      categoryId: cakes.id,
      price: 150,
      imageUrl: "https://placehold.co/400x300/sienna/white?text=Choco+Cake",
    },
  });

  await prisma.menuItem.create({
    data: {
      name: "Nachos",
      categoryId: snacks.id,
      price: 120,
      imageUrl: "https://placehold.co/400x300/gold/white?text=Nachos",
    },
  });

  // ── VARIATIONS ─────────────────────────────────────
  await prisma.menuItemVariation.createMany({
    data: [
      { menuItemId: spanishLatte.id, name: "Hot", priceMod: 0 },
      { menuItemId: spanishLatte.id, name: "Iced", priceMod: 10 },
    ],
  });

  await prisma.menuItemVariation.createMany({
    data: [
      { menuItemId: javaChipFrappe.id, name: "Small", priceMod: -20 },
      { menuItemId: javaChipFrappe.id, name: "Regular", priceMod: 0 },
      { menuItemId: javaChipFrappe.id, name: "Large", priceMod: 30 },
    ],
  });

  // ── MENU ITEM INGREDIENTS ──────────────────────────
  await prisma.menuItemIngredient.createMany({
    data: [
      { menuItemId: spanishLatte.id, ingredientId: milk.id, quantityNeeded: 0.2, unit: "L" },
      { menuItemId: spanishLatte.id, ingredientId: espressoSyrup.id, quantityNeeded: 0.03, unit: "L" },
      { menuItemId: javaChipFrappe.id, ingredientId: milk.id, quantityNeeded: 0.15, unit: "L" },
      { menuItemId: javaChipFrappe.id, ingredientId: chocoPowder.id, quantityNeeded: 0.03, unit: "kg" },
    ],
  });

  console.log("✅ Menu items seeded");

  // ── RESTAURANT TABLES ──────────────────────────────
  const tableNames = ["Table 1", "Table 2", "Table 3", "Table 4", "Table 5"];
  for (const name of tableNames) {
    await prisma.restaurantTable.create({
      data: {
        name,
        qrCode: name.toLowerCase().replace(" ", "-") + "-" + Math.random().toString(36).substring(2, 8),
      },
    });
  }

  console.log("✅ Tables seeded");

  // ── SAMPLE ORDERS ──────────────────────────────────
  const table1 = await prisma.restaurantTable.findFirst();
  if (table1) {
    const sampleOrder = await prisma.order.create({
      data: {
        tableId: table1.id,
        orderType: "DINE_IN",
        status: "COMPLETED",
        totalAmount: 395,
        items: {
          create: [
            { menuItemId: spanishLatte.id, quantity: 1, unitPrice: 185 },
            { menuItemId: chickenAlfredo.id, quantity: 1, unitPrice: 210 },
          ],
        },
      },
    });

    await prisma.transaction.create({
      data: {
        orderId: sampleOrder.id,
        staffId: owner.id,
        amountPaid: 400,
        paymentMethod: "CASH",
        status: "PAID",
      },
    });
  }

  // ── EXPENSES ───────────────────────────────────────
  await prisma.expense.createMany({
    data: [
      { description: "Milk restock", amount: 850, recordedById: admin.id },
      { description: "Syrup restock - Davinci", amount: 1200, recordedById: admin.id },
      { description: "Electricity bill", amount: 4500, recordedById: owner.id },
    ],
  });

  console.log("✅ Sample orders, transactions, expenses seeded");
  console.log("\n🎉 Seed complete!");
  console.log("\n🔑 Demo credentials:");
  console.log("   Owner:      owner@cafe.com / password123");
  console.log("   Admin:      admin@cafe.com / password123");
  console.log("   Supervisor: supervisor@cafe.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
