export type OrderType = "offline" | "online"
export type Platform = "GOJ" | "GRB" | "SHP"
export type OrderStatus = "draft" | "in_progress" | "completed"

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
