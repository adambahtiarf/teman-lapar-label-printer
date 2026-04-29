import { OrdersPageClient } from "@/components/app/orders-page-client"

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

  return <OrdersPageClient key={JSON.stringify(filters)} filters={filters} />
}
