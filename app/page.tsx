import Link from "next/link"
import { ClipboardListIcon, PlusIcon, SettingsIcon, UtensilsIcon } from "lucide-react"
import { AppShell } from "@/components/app/app-shell"
import { EmptyState } from "@/components/app/empty-state"
import { PageHeader } from "@/components/app/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getTodaySummary } from "@/lib/data"

export default async function DashboardPage() {
  const summary = await getTodaySummary()
  const hasData = summary.total > 0

  return (
    <AppShell>
      <PageHeader title="Order Labels" description="Create orders, print labels, complete." />

      <section className="grid grid-cols-2 gap-2">
        <Button asChild className="h-12">
          <Link href="/orders/new">
            <PlusIcon data-icon="inline-start" />
            Create Order
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-12">
          <Link href="/menus">
            <UtensilsIcon data-icon="inline-start" />
            Master Menu
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-12">
          <Link href="/orders">
            <ClipboardListIcon data-icon="inline-start" />
            Order List
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-12">
          <Link href="/settings">
            <SettingsIcon data-icon="inline-start" />
            Settings
          </Link>
        </Button>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-medium">Today</h2>
        {hasData ? (
          <div className="grid grid-cols-3 gap-2">
            <SummaryCard label="Total" value={summary.total} />
            <SummaryCard label="Active" value={summary.active} />
            <SummaryCard label="Done" value={summary.completed} />
          </div>
        ) : (
          <EmptyState
            title="No orders today"
            description="Create the first order when a label is ready to print."
          >
            <Button asChild>
              <Link href="/orders/new">
                <PlusIcon data-icon="inline-start" />
                Create Order
              </Link>
            </Button>
          </EmptyState>
        )}
      </section>
    </AppShell>
  )
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  )
}
