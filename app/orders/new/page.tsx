import { AppShell } from "@/components/app/app-shell"
import { CreateOrderForm } from "@/components/app/create-order-form"
import { PageHeader } from "@/components/app/page-header"
import { Card, CardContent } from "@/components/ui/card"

export default function NewOrderPage() {
  return (
    <AppShell>
      <PageHeader title="Create Order" description="Generate an immutable order code." backHref="/" />
      <Card>
        <CardContent>
          <CreateOrderForm />
        </CardContent>
      </Card>
    </AppShell>
  )
}
