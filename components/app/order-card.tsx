import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate, platformLabel, statusLabel } from "@/lib/format"
import type { Order } from "@/lib/types"

export function OrderCard({ order }: { order: Order }) {
  return (
    <Link href={`/orders/${order.id}`}>
      <Card size="sm" className="transition-colors hover:bg-muted/40">
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-3">
            <span className="truncate">{order.order_code}</span>
            <Badge variant={order.status === "completed" ? "active" : "outline"}>
              {statusLabel(order.status)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <div className="font-medium">{order.customer_name}</div>
          <div className="flex items-center justify-between gap-3 text-muted-foreground">
            <span>{platformLabel(order.order_type, order.platform)}</span>
            <span>{formatDate(order.created_at)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
