import { PrintLabelPageClient } from "@/components/app/print-label-page-client"

type Params = Promise<{ itemId: string }>

export default async function PrintLabelPage({ params }: { params: Params }) {
  const { itemId } = await params

  return <PrintLabelPageClient key={itemId} itemId={itemId} />
}
