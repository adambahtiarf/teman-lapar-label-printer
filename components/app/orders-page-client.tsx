"use client"

import { useCallback } from "react"
import Link from "next/link"
import { PlusIcon } from "lucide-react"
import { AppShell } from "@/components/app/app-shell"
import { EmptyState } from "@/components/app/empty-state"
import { OrderCard } from "@/components/app/order-card"
import { OrderFilters } from "@/components/app/order-filters"
import { OrderListSkeleton, QueryErrorState } from "@/components/app/page-states"
import { PageHeader } from "@/components/app/page-header"
import { Button } from "@/components/ui/button"
import { useClientQuery } from "@/hooks/use-client-query"
import { getOrdersClient } from "@/lib/client-data"

type OrderFiltersValue = {
  date?: string
  order_type?: string
  platform?: string
  status?: string
}

export function OrdersPageClient({
  filters,
}: {
  filters: OrderFiltersValue
}) {
  const queryFn = useCallback(() => getOrdersClient(filters), [filters])
  const { data: orders, error, isLoading, reload } = useClientQuery({
    queryFn,
    subscribeTo: ["orders"],
  })

  return (
    <AppShell>
      <PageHeader
        title="Orders"
        description="Find orders and open detail pages."
        action={
          <Button asChild size="sm">
            <Link href="/orders/new">
              <PlusIcon data-icon="inline-start" />
              New
            </Link>
          </Button>
        }
      />
      <OrderFilters filters={filters} />
      {isLoading ? <OrderListSkeleton /> : null}
      {!isLoading && error ? (
        <QueryErrorState description={error.message} onRetry={reload} title="Failed to load orders" />
      ) : null}
      {!isLoading && !error && orders?.length ? (
        <section className="flex flex-col gap-3">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </section>
      ) : null}
      {!isLoading && !error && !orders?.length ? (
        <EmptyState title="No orders found" description="Try changing the filters or create a new order.">
          <Button asChild>
            <Link href="/orders/new">
              <PlusIcon data-icon="inline-start" />
              Create Order
            </Link>
          </Button>
        </EmptyState>
      ) : null}
    </AppShell>
  )
}
