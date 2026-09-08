import { ItemDetail } from "@/components/customer/ItemDetail";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface ItemDetailPageProps {
  params: {
    itemId: string;
  };
  searchParams: {
    tableId?: string;
  };
}

export default async function ItemDetailPage({
  params,
  searchParams,
}: ItemDetailPageProps) {
  const item = await db.menuItem.findUnique({
    where: {
      id: parseInt(params.itemId),
      isArchived: false,
    },
    include: {
      category: true,
      variations: true,
    },
  });

  if (!item) {
    notFound();
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50" />}>
      <ItemDetail item={item} tableId={searchParams.tableId} />
    </Suspense>
  );
}
