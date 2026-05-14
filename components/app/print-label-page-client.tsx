"use client"

import { useCallback } from "react"
import { EmptyState } from "@/components/app/empty-state"
import { LabelPrintView } from "@/components/app/label-print-view"
import { PrintLabelSkeleton, QueryErrorState } from "@/components/app/page-states"
import { useClientQuery } from "@/hooks/use-client-query"
import { getOrderItemForPrintClient, getPaperSizesClient } from "@/lib/client-data"
import { getActivePaperSize } from "@/lib/settings"

export function PrintLabelPageClient({
  itemId,
}: {
  itemId: string
}) {
  const queryFn = useCallback(async () => {
    const [item, paperSizes] = await Promise.all([getOrderItemForPrintClient(itemId), getPaperSizesClient(true)])
    return {
      item,
      paperSize: getActivePaperSize(paperSizes),
    }
  }, [itemId])
  const { data, error, isLoading, reload } = useClientQuery({
    queryFn,
    subscribeTo: ["order_items", "orders", "paper_sizes"],
  })

  if (isLoading) return <PrintLabelSkeleton />

  if (error) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-120 flex-col bg-background px-4 pt-4">
        <QueryErrorState description={error.message} onRetry={reload} title="Failed to load label" />
      </main>
    )
  }

  if (!data?.item) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-120 flex-col bg-background px-4 pt-4">
        <EmptyState
          title="Label item not found"
          description="This order item may have been removed or is no longer available."
        />
      </main>
    )
  }

  return <LabelPrintView item={data.item} order={data.item.orders} paperSize={data.paperSize} />
}
