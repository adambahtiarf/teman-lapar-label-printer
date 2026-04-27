import { LabelPrintView } from "@/components/app/label-print-view"
import { getOrderItemForPrint } from "@/lib/data"

type Params = Promise<{ itemId: string }>

export default async function PrintLabelPage({ params }: { params: Params }) {
  const { itemId } = await params
  const item = await getOrderItemForPrint(itemId)

  return <LabelPrintView item={item} order={item.orders} />
}
