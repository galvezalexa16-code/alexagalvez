import { db } from "@/lib/db";
import { redirect } from "next/navigation";

interface QRPageProps {
  params: {
    tableId: string;
  };
}

export default async function QRPage({ params }: QRPageProps) {
  const tableId = parseInt(params.tableId);

  // Verify table exists
  const table = await db.restaurantTable.findUnique({
    where: { id: tableId },
  });

  if (!table) {
    redirect("/menu");
  }

  // Redirect to menu with table context
  redirect(`/menu?tableId=${tableId}`);
}
