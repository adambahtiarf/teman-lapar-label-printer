import { unstable_noStore as noStore } from "next/cache"
import { notFound } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import type { Attribute, Menu, Order, OrderItem, OrderWithItems } from "@/lib/types"

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function orderOptions(options: Attribute["attribute_options"]) {
  return [...(options ?? [])].sort((a, b) => a.sort_order - b.sort_order)
}

function orderAttributes(attributes: Attribute[]) {
  return [...attributes].sort((a, b) => a.name.localeCompare(b.name))
}

export async function getAttributes(activeOnly = false) {
  noStore()
  const supabase = await createClient()
  let query = supabase
    .from("attributes")
    .select("id,name,slug,is_active,attribute_options(id,attribute_id,label,value,sort_order,is_active)")
    .order("name", { ascending: true })

  if (activeOnly) query = query.eq("is_active", true)

  const { data, error } = await query
  if (error) throw new Error(error.message)

  return orderAttributes(
    ((data ?? []) as Attribute[]).map((attribute) => ({
      ...attribute,
      attribute_options: orderOptions(
        activeOnly
          ? attribute.attribute_options.filter((option) => option.is_active)
          : attribute.attribute_options
      ),
    }))
  )
}

export async function getMenus(activeOnly = false) {
  noStore()
  const supabase = await createClient()
  let query = supabase
    .from("menus")
    .select(
      "id,name,short_code,is_active,menu_attributes(id,is_active,attribute_id,attributes(id,name,slug,is_active,attribute_options(id,attribute_id,label,value,sort_order,is_active)))"
    )
    .order("name", { ascending: true })

  if (activeOnly) query = query.eq("is_active", true)

  const { data, error } = await query
  if (error) throw new Error(error.message)

  return ((data ?? []) as unknown as Menu[]).map((menu) => ({
    ...menu,
    menu_attributes: (menu.menu_attributes ?? [])
      .filter((item) => !activeOnly || (item.is_active && item.attributes?.is_active))
      .map((item) => ({
        ...item,
        attributes: item.attributes
          ? {
              ...item.attributes,
              attribute_options: orderOptions(
                activeOnly
                  ? item.attributes.attribute_options.filter((option) => option.is_active)
                  : item.attributes.attribute_options
              ),
            }
          : null,
      }))
      .sort((a, b) => (a.attributes?.name ?? "").localeCompare(b.attributes?.name ?? "")),
  }))
}

export async function getOrders(filters: {
  date?: string
  order_type?: string
  platform?: string
  status?: string
}) {
  noStore()
  const supabase = await createClient()
  let query = supabase
    .from("orders")
    .select("id,order_code,daily_sequence,order_date,order_type,platform,customer_name,note,status,created_at")
    .order("created_at", { ascending: false })

  if (filters.date) query = query.eq("order_date", filters.date)
  if (filters.order_type) query = query.eq("order_type", filters.order_type)
  if (filters.platform) query = query.eq("platform", filters.platform)
  if (filters.status) query = query.eq("status", filters.status)

  const { data, error } = await query
  if (error) throw new Error(error.message)

  return (data ?? []) as Order[]
}

export async function getOrder(id: string) {
  noStore()
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id,order_code,daily_sequence,order_date,order_type,platform,customer_name,note,status,created_at,order_items(id,order_id,menu_id,menu_name,qty,printed_count,selected_attributes,selected_attribute_labels,notes,created_at)"
    )
    .eq("id", id)
    .single()

  if (error) {
    if (error.code === "PGRST116") notFound()
    throw new Error(error.message)
  }

  return {
    ...(data as unknown as OrderWithItems),
    order_items: ([...(((data as unknown as OrderWithItems).order_items ?? []) as OrderItem[])]).sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    ),
  }
}

export async function getOrderItemForPrint(itemId: string) {
  noStore()
  console.log("Fetching order item for print:", itemId)
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("order_items")
    .select(
      "id,order_id,menu_id,menu_name,qty,printed_count,selected_attributes,selected_attribute_labels,notes,created_at,orders(id,order_code,daily_sequence,order_date,order_type,platform,customer_name,note,status,created_at)"
    )
    .eq("id", itemId)
    .single()

  if (error) {
    if (error.code === "PGRST116") notFound()
    throw new Error(error.message)
  }

  return data as unknown as OrderItem & { orders: Order }
}

export async function getTodaySummary() {
  noStore()
  const supabase = await createClient()
  const today = todayKey()

  const [{ count: total, error: totalError }, { count: active, error: activeError }, { count: completed, error: completedError }] =
    await Promise.all([
      supabase.from("orders").select("id", { count: "exact", head: true }).eq("order_date", today),
      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("order_date", today)
        .in("status", ["draft", "in_progress"]),
      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("order_date", today)
        .eq("status", "completed"),
    ])

  const error = totalError ?? activeError ?? completedError
  if (error) throw new Error(error.message)

  return {
    total: total ?? 0,
    active: active ?? 0,
    completed: completed ?? 0,
  }
}
