import { OrderDetailPageClient } from "@/components/app/order-detail-page-client"

type Params = Promise<{ id: string }>

export default async function OrderDetailPage({ params }: { params: Params }) {
  const { id } = await params

  return <OrderDetailPageClient key={id} orderId={id} />
}
