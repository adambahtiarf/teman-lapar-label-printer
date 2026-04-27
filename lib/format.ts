import { platformName } from "@/lib/platforms"

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value))
}

export function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(value))
}

export function platformLabel(orderType: string, platform?: string | null) {
  if (orderType === "offline") return "Offline"
  return platformName(platform)
}

export function statusLabel(status: string) {
  if (status === "in_progress") return "In Progress"
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
}
