import { updateOrderStatus } from "@/app/actions";
import { CheckCircle2Icon, RotateCcwIcon } from "lucide-react";
import { AddOrderItemForm } from "@/components/app/add-order-item-form";
import { AppShell } from "@/components/app/app-shell";
import { EmptyState } from "@/components/app/empty-state";
import { OrderItemCard } from "@/components/app/order-item-card";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, platformLabel, statusLabel } from "@/lib/format";
import { getMenus, getOrder } from "@/lib/data";

type Params = Promise<{ id: string }>;

export default async function OrderDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const [order, menus, activeMenus] = await Promise.all([
    getOrder(id),
    getMenus(false),
    getMenus(true),
  ]);

  return (
    <AppShell>
      <PageHeader
        title={order.order_code}
        description={order.customer_name}
        backHref="/orders"
      />

      <Card size="sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-3">
            <span>Order</span>
            <Badge
              variant={order.status === "completed" ? "active" : "outline"}
            >
              {statusLabel(order.status)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Date</span>
            <span>{formatDate(order.created_at)}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Platform</span>
            <span>{platformLabel(order.order_type, order.platform)}</span>
          </div>
          {order.note ? <p>{order.note}</p> : null}
          <form action={updateOrderStatus} className="pt-2">
            <input type="hidden" name="id" value={order.id} />
            <input
              type="hidden"
              name="status"
              value={order.status === "completed" ? "in_progress" : "completed"}
            />
            <Button type="submit" variant="default" className="w-full">
              {order.status === "completed" ? (
                <RotateCcwIcon data-icon="inline-start" />
              ) : (
                <CheckCircle2Icon data-icon="inline-start" />
              )}
              {order.status === "completed" ? "Reopen Order" : "Complete Order"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-heading text-lg font-medium">Items</h2>
          {activeMenus.length ? (
            <AddOrderItemForm orderId={order.id} menus={activeMenus} />
          ) : null}
        </div>
        {order.order_items.length ? (
          order.order_items.map((item) => (
            <OrderItemCard key={item.id} item={item} menus={menus} />
          ))
        ) : !activeMenus.length ? (
          <EmptyState
            title="No active menus"
            description="Create an active menu before adding order items."
          />
        ) : (
          <EmptyState
            title="No items"
            description="Add an item to prepare labels for this order."
          />
        )}
      </section>
    </AppShell>
  );
}
