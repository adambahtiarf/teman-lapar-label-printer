import { AppShell } from "@/components/app/app-shell"
import { EmptyState } from "@/components/app/empty-state"
import { OrderCard } from "@/components/app/order-card"
import { OrderFilters } from "@/components/app/order-filters"
import { PageHeader } from "@/components/app/page-header"
import { Button } from "@/components/ui/button"
import { getOrders } from "@/lib/data"
import { PlusIcon } from "lucide-react"
import Link from "next/link"

type SearchParams = Promise<Record<string, string | string[] | undefined>>

function clean(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] === "all" ? undefined : value[0]
  return value === "all" ? undefined : value
}

export default async function OrdersPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const filters = {
    date: clean(params.date),
    order_type: clean(params.order_type),
    platform: clean(params.platform),
    status: clean(params.status),
  }
  const orders = await getOrders(filters)

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
      {orders.length ? (
        <section className="flex flex-col gap-3">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </section>
      ) : (
        <EmptyState title="No orders found" description="Try changing the filters or create a new order.">
          <Button asChild>
            <Link href="/orders/new">
              <PlusIcon data-icon="inline-start" />
              Create Order
            </Link>
          </Button>
        </EmptyState>
      )}
    </AppShell>
  )
}
