import type { Platform } from "@/lib/types"

export const ONLINE_PLATFORM_OPTIONS = [
  { code: "GOJ", label: "GOJEK / GOFOOD" },
  { code: "GRB", label: "GRAB FOOD" },
  { code: "SHP", label: "Shopee Food" },
] as const satisfies readonly { code: Platform; label: string }[]

export const ORDER_CODE_PREFIX_INFO = [
  { code: "GOJ", label: "GOJEK / GOFOOD" },
  { code: "GRB", label: "GRAB FOOD" },
  { code: "SHP", label: "Shopee Food" },
  { code: "OFF", label: "Offline" },
] as const

export function platformName(platform?: string | null) {
  return (
    ONLINE_PLATFORM_OPTIONS.find((option) => option.code === platform)?.label ??
    platform ??
    "Online"
  )
}
