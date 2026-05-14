"use client"

import * as React from "react"
import { useLinkStatus } from "next/link"
import { Loader2Icon } from "lucide-react"

export function LoadingLinkContent({
  children,
  pendingLabel = "Loading...",
}: {
  children: React.ReactNode
  pendingLabel?: string
}) {
  const { pending } = useLinkStatus()

  if (!pending) return children

  return (
    <>
      <Loader2Icon data-icon="inline-start" className="animate-spin" />
      {pendingLabel}
    </>
  )
}

export function LoadingIconLinkContent({
  children,
  pendingLabel = "Loading...",
}: {
  children: React.ReactNode
  pendingLabel?: string
}) {
  const { pending } = useLinkStatus()

  if (!pending) return children

  return (
    <>
      <Loader2Icon className="animate-spin" />
      <span className="sr-only">{pendingLabel}</span>
    </>
  )
}
