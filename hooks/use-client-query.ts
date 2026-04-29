"use client"

import { useCallback, useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"

type QueryState<T> = {
  data: T | undefined
  error: Error | null
  isLoading: boolean
}

function toError(error: unknown) {
  if (error instanceof Error) return error
  return new Error("Something went wrong while loading data.")
}

export function useClientQuery<T>({
  enabled = true,
  queryFn,
  subscribeTo = [],
}: {
  enabled?: boolean
  queryFn: () => Promise<T>
  subscribeTo?: string[]
}) {
  const subscribeKey = [...subscribeTo].sort().join(",")

  const [state, setState] = useState<QueryState<T>>({
    data: undefined,
    error: null,
    isLoading: enabled,
  })

  const runQuery = useCallback(
    async (showLoader: boolean) => {
    if (!enabled) return

    if (showLoader) {
      setState((current) => ({
        data: current.data,
        error: null,
        isLoading: true,
      }))
    }

    try {
      const data = await queryFn()
      setState({ data, error: null, isLoading: false })
    } catch (error: unknown) {
      setState({
        data: undefined,
        error: toError(error),
        isLoading: false,
      })
    }
    },
    [enabled, queryFn]
  )

  useEffect(() => {
    if (!enabled) return

    const supabase = createClient()
    const channel = subscribeKey.length
      ? supabase.channel(`client-query:${subscribeKey}`)
      : null

    let cancelled = false

    async function loadOnMount() {
      try {
        const data = await queryFn()
        if (cancelled) return
        setState({ data, error: null, isLoading: false })
      } catch (error: unknown) {
        if (cancelled) return
        setState({
          data: undefined,
          error: toError(error),
          isLoading: false,
        })
      }
    }

    void loadOnMount()

    subscribeKey
      .split(",")
      .filter(Boolean)
      .forEach((table) => {
      channel?.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => {
          void runQuery(false)
        }
      )
      })

    channel?.subscribe()

    return () => {
      cancelled = true
      if (channel) {
        void supabase.removeChannel(channel)
      }
    }
  }, [enabled, queryFn, runQuery, subscribeKey])

  return {
    ...state,
    reload: () => {
      void runQuery(true)
    },
  }
}
