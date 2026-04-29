"use client"

import { useCallback } from "react"
import { CheckCircle2Icon, RotateCcwIcon } from "lucide-react"
import { updateOrderStatus } from "@/app/actions"
import { AddOrderItemForm } from "@/components/app/add-order-item-form"
import { AppShell } from "@/components/app/app-shell"
import { EmptyState } from "@/components/app/empty-state"
import { OrderItemCard } from "@/components/app/order-item-card"
import { OrderDetailSkeleton, QueryErrorState } from "@/components/app/page-states"
import { PageHeader } from "@/components/app/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useClientQuery } from "@/hooks/use-client-query"
import { getMenusClient, getOrderClient } from "@/lib/client-data"
import { formatDate, platformLabel, statusLabel } from "@/lib/format"

export function OrderDetailPageClient({
  orderId,
}: {
  orderId: string
}) {
  const queryFn = useCallback(async () => {
    const [order, menus, activeMenus] = await Promise.all([
      getOrderClient(orderId),
      getMenusClient(false),
      getMenusClient(true),
    ])

    return { activeMenus, menus, order }
  }, [orderId])
  const { data, error, isLoading, reload } = useClientQuery({
    queryFn,
    subscribeTo: ["orders", "order_items", "menus", "menu_attributes", "attributes", "attribute_options"],
  })

  return (
    <AppShell>
      <PageHeader
        title={isLoading ? "Loading order..." : data?.order?.order_code ?? "Order not found"}
        description={isLoading ? undefined : data?.order?.customer_name}
        backHref="/orders"
        action={isLoading ? <Skeleton className="h-9 w-20" /> : null}
      />

      {isLoading ? <OrderDetailSkeleton /> : null}
      {!isLoading && error ? (
        <QueryErrorState description={error.message} onRetry={reload} title="Failed to load order" />
      ) : null}
      {!isLoading && !error && data && !data.order ? (
        <EmptyState title="Order not found" description="This order may have been removed or is no longer available." />
      ) : null}
      {!isLoading && !error && data?.order ? (
        <>
          <Card size="sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-3">
                <span>Order</span>
                <Badge variant={data.order.status === "completed" ? "active" : "outline"}>
                  {statusLabel(data.order.status)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Date</span>
                <span>{formatDate(data.order.created_at)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Platform</span>
                <span>{platformLabel(data.order.order_type, data.order.platform)}</span>
              </div>
              {data.order.note ? <p>{data.order.note}</p> : null}
              <form action={updateOrderStatus} className="pt-2">
                <input type="hidden" name="id" value={data.order.id} />
                <input
                  type="hidden"
                  name="status"
                  value={data.order.status === "completed" ? "in_progress" : "completed"}
                />
                <Button type="submit" variant="default" className="w-full">
                  {data.order.status === "completed" ? (
                    <RotateCcwIcon data-icon="inline-start" />
                  ) : (
                    <CheckCircle2Icon data-icon="inline-start" />
                  )}
                  {data.order.status === "completed" ? "Reopen Order" : "Complete Order"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-heading text-lg font-medium">Items</h2>
              {data.activeMenus.length ? <AddOrderItemForm orderId={data.order.id} menus={data.activeMenus} /> : null}
            </div>
            {data.order.order_items.length ? (
              data.order.order_items.map((item) => <OrderItemCard key={item.id} item={item} menus={data.menus} />)
            ) : !data.activeMenus.length ? (
              <EmptyState
                title="No active menus"
                description="Create an active menu before adding order items."
              />
            ) : (
              <EmptyState title="No items" description="Add an item to prepare labels for this order." />
            )}
          </section>
        </>
      ) : null}
    </AppShell>
  )
}
