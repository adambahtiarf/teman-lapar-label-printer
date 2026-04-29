"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function QueryErrorState({
  description,
  onRetry,
  title = "Failed to load data",
}: {
  description: string
  onRetry: () => void
  title?: string
}) {
  return (
    <Card size="sm">
      <CardHeader className="flex flex-col gap-1">
        <h2 className="font-medium">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        <Button type="button" variant="outline" onClick={onRetry}>
          Try Again
        </Button>
      </CardContent>
    </Card>
  )
}

export function DashboardSummarySkeleton() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} size="sm">
          <CardHeader>
            <Skeleton className="h-4 w-14" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-9 w-12" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function OrderListSkeleton() {
  return (
    <section className="flex flex-col gap-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} size="sm">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-6 w-20" />
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Skeleton className="h-4 w-32" />
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  )
}

export function MenuListSkeleton() {
  return (
    <section className="flex flex-col gap-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} size="sm">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-6 w-20" />
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Skeleton className="h-4 w-20" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-16" />
            </div>
          </CardContent>
          <CardContent className="grid grid-cols-2 gap-2 pt-0">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </CardContent>
        </Card>
      ))}
    </section>
  )
}

export function SettingsListSkeleton() {
  return (
    <section className="flex flex-col gap-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} size="sm">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-6 w-16" />
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-px w-full" />
            <Skeleton className="h-9 w-32" />
          </CardContent>
          <CardContent className="grid grid-cols-2 gap-2 pt-0">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </CardContent>
        </Card>
      ))}
    </section>
  )
}

export function OrderDetailSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Card size="sm">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
      <section className="flex flex-col gap-3">
        {Array.from({ length: 2 }).map((_, index) => (
          <Card key={index} size="sm">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-6 w-14" />
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-16" />
            </CardContent>
            <CardContent className="grid grid-cols-3 gap-2 pt-0">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  )
}

export function PrintLabelSkeleton() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-120 flex-col gap-5 bg-background px-4 pt-4">
      <section className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
        <div className="rounded bg-[linear-gradient(180deg,#fafaf9_0%,#f5f5f4_100%)] p-6">
          <Skeleton className="mx-auto h-[30mm] w-[40mm] rounded-md" />
        </div>
      </section>
      <Card size="sm">
        <CardContent className="flex flex-col gap-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    </main>
  )
}
