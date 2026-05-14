import type { OrderNumberDatePattern, OrderNumberFormat, PaperSize, Platform } from "@/lib/types"

export const DEFAULT_PAPER_SIZE = {
  name: "NIIMBOT 40 x 30",
  width_mm: 40,
  height_mm: 30,
} as const

export const ORDER_NUMBER_DATE_PATTERNS: {
  value: OrderNumberDatePattern
  label: string
}[] = [
  { value: "YYMMDD", label: "YYMMDD" },
  { value: "YYYYMMDD", label: "YYYYMMDD" },
  { value: "DDMMYY", label: "DDMMYY" },
]

export const DEFAULT_ORDER_NUMBER_FORMAT = {
  name: "Default",
  offline_prefix: "OFF",
  goj_prefix: "GOJ",
  grab_prefix: "GRB",
  shopee_prefix: "SHP",
  date_pattern: "YYMMDD" as OrderNumberDatePattern,
  sequence_padding: 3,
  separator: "",
  include_random_suffix: true,
} as const

export function resolvePaperSize(paperSize?: PaperSize | null) {
  return {
    widthMm: paperSize?.width_mm ?? DEFAULT_PAPER_SIZE.width_mm,
    heightMm: paperSize?.height_mm ?? DEFAULT_PAPER_SIZE.height_mm,
    label: paperSize?.name ?? DEFAULT_PAPER_SIZE.name,
  }
}

export function getActivePaperSize(paperSizes: PaperSize[]) {
  return (
    paperSizes.find((paperSize) => paperSize.is_default && paperSize.is_active) ??
    paperSizes.find((paperSize) => paperSize.is_active) ??
    null
  )
}

export function getActiveOrderNumberFormat(formats: OrderNumberFormat[]) {
  return (
    formats.find((format) => format.is_default && format.is_active) ??
    formats.find((format) => format.is_active) ??
    null
  )
}

export function getOrderNumberPrefix(format: OrderNumberFormat, orderType: "offline" | "online", platform?: Platform | null) {
  if (orderType === "offline") return format.offline_prefix
  if (platform === "GOJ") return format.goj_prefix
  if (platform === "GRB") return format.grab_prefix
  if (platform === "SHP") return format.shopee_prefix
  return format.goj_prefix
}

export function buildOrderNumberPreview(format?: OrderNumberFormat | null) {
  const current = format ?? {
    id: "preview",
    is_active: true,
    is_default: true,
    ...DEFAULT_ORDER_NUMBER_FORMAT,
  }

  const datePart =
    current.date_pattern === "YYYYMMDD"
      ? "20260429"
      : current.date_pattern === "DDMMYY"
        ? "290426"
        : "260429"

  return `${getOrderNumberPrefix(current, "offline")}${current.separator}${datePart}${String(1).padStart(current.sequence_padding, "0")}${current.include_random_suffix ? "A" : ""}`
}
