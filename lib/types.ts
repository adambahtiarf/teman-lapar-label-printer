export type OrderType = "offline" | "online"
export type Platform = "GOJ" | "GRB" | "SHP"
export type OrderStatus = "draft" | "in_progress" | "completed"
export type OrderNumberDatePattern = "YYMMDD" | "YYYYMMDD" | "DDMMYY"

export type AttributeOption = {
  id: string
  attribute_id: string
  label: string
  value: string
  sort_order: number
  is_active: boolean
}

export type Attribute = {
  id: string
  name: string
  slug: string
  is_active: boolean
  attribute_options: AttributeOption[]
}

export type PaperSize = {
  id: string
  name: string
  width_mm: number
  height_mm: number
  is_active: boolean
  is_default: boolean
}

export type OrderNumberFormat = {
  id: string
  name: string
  offline_prefix: string
  goj_prefix: string
  grab_prefix: string
  shopee_prefix: string
  date_pattern: OrderNumberDatePattern
  sequence_padding: number
  separator: string
  include_random_suffix: boolean
  is_active: boolean
  is_default: boolean
}

export type MenuAttribute = {
  id: string
  is_active: boolean
  attribute_id: string
  attributes: Attribute | null
}

export type Menu = {
  id: string
  name: string
  short_code: string | null
  is_active: boolean
  menu_attributes: MenuAttribute[]
}

export type Order = {
  id: string
  order_code: string
  daily_sequence: number
  order_date: string
  order_type: OrderType
  platform: Platform | null
  customer_name: string
  note: string | null
  status: OrderStatus
  created_at: string
}

export type OrderItem = {
  id: string
  order_id: string
  menu_id: string | null
  menu_name: string
  qty: number
  printed_count: number
  selected_attributes: Record<string, string>
  selected_attribute_labels: string[]
  notes: string | null
  created_at: string
}

export type OrderWithItems = Order & {
  order_items: OrderItem[]
}
