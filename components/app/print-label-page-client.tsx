"use client"

import { useCallback } from "react"
import { EmptyState } from "@/components/app/empty-state"
import { LabelPrintView } from "@/components/app/label-print-view"
import { PrintLabelSkeleton, QueryErrorState } from "@/components/app/page-states"
import { useClientQuery } from "@/hooks/use-client-query"
import { getOrderItemForPrintClient } from "@/lib/client-data"

export function PrintLabelPageClient({
  itemId,
}: {
  itemId: string
}) {
  const queryFn = useCallback(() => getOrderItemForPrintClient(itemId), [itemId])
  const { data, error, isLoading, reload } = useClientQuery({
    queryFn,
    subscribeTo: ["order_items", "orders"],
  })

  if (isLoading) return <PrintLabelSkeleton />

  if (error) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-120 flex-col bg-background px-4 pt-4">
        <QueryErrorState description={error.message} onRetry={reload} title="Failed to load label" />
      </main>
    )
  }

  if (!data) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-120 flex-col bg-background px-4 pt-4">
        <EmptyState
          title="Label item not found"
          description="This order item may have been removed or is no longer available."
        />
      </main>
    )
  }

  return <LabelPrintView item={data} order={data.orders} />
}
