"use client"

import { useCallback } from "react"
import Link from "next/link"
import { ClipboardListIcon, PlusIcon, SettingsIcon, UtensilsIcon } from "lucide-react"
import { AppShell } from "@/components/app/app-shell"
import { LoadingLinkContent } from "@/components/app/loading-link-content"
import { DashboardSummarySkeleton, QueryErrorState } from "@/components/app/page-states"
import { EmptyState } from "@/components/app/empty-state"
import { PageHeader } from "@/components/app/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useClientQuery } from "@/hooks/use-client-query"
import { getTodaySummaryClient } from "@/lib/client-data"

export function DashboardPageClient() {
  const queryFn = useCallback(() => getTodaySummaryClient(), [])
  const { data: summary, error, isLoading, reload } = useClientQuery({
    queryFn,
    subscribeTo: ["orders"],
  })

  const hasData = (summary?.total ?? 0) > 0

  return (
    <AppShell>
      <PageHeader title="Order Labels" description="Create orders, print labels, complete." />

      <section className="grid grid-cols-2 gap-2">
        <Button asChild className="h-12">
          <Link href="/orders/new">
            <LoadingLinkContent pendingLabel="Opening...">
              <PlusIcon data-icon="inline-start" />
              Create Order
            </LoadingLinkContent>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-12">
          <Link href="/menus">
            <LoadingLinkContent pendingLabel="Opening...">
              <UtensilsIcon data-icon="inline-start" />
              Master Menu
            </LoadingLinkContent>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-12">
          <Link href="/orders">
            <LoadingLinkContent pendingLabel="Opening...">
              <ClipboardListIcon data-icon="inline-start" />
              Order List
            </LoadingLinkContent>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-12">
          <Link href="/settings">
            <LoadingLinkContent pendingLabel="Opening...">
              <SettingsIcon data-icon="inline-start" />
              Settings
            </LoadingLinkContent>
          </Link>
        </Button>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-medium">Today</h2>
        {isLoading ? <DashboardSummarySkeleton /> : null}
        {!isLoading && error ? (
          <QueryErrorState description={error.message} onRetry={reload} title="Failed to load today's summary" />
        ) : null}
        {!isLoading && !error && summary && hasData ? (
          <div className="grid grid-cols-3 gap-2">
            <SummaryCard label="Total" value={summary.total} />
            <SummaryCard label="Active" value={summary.active} />
            <SummaryCard label="Done" value={summary.completed} />
          </div>
        ) : null}
        {!isLoading && !error && summary && !hasData ? (
          <EmptyState
            title="No orders today"
            description="Create the first order when a label is ready to print."
          >
            <Button asChild>
              <Link href="/orders/new">
                <LoadingLinkContent pendingLabel="Opening...">
                  <PlusIcon data-icon="inline-start" />
                  Create Order
                </LoadingLinkContent>
              </Link>
            </Button>
          </EmptyState>
        ) : null}
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
