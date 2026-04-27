"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { slugify } from "@/lib/format"

function stringValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim()
}

function nullableString(formData: FormData, key: string) {
  const value = stringValue(formData, key)
  return value.length ? value : null
}

function parseJson<T>(value: FormDataEntryValue | null, fallback: T): T {
  if (typeof value !== "string" || !value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function throwSupabaseError(error: { message: string; code?: string } | null) {
  if (!error) return

  if (error.message.toLowerCase().includes("row-level security")) {
    throw new Error(
      "Supabase RLS blocked this write. Use an authenticated Supabase session, or run supabase/migrations/202604270002_enable_anon_demo_access.sql for local no-login testing."
    )
  }

  throw new Error(error.message)
}

export async function createAttribute(formData: FormData) {
  const supabase = await createClient()
  const name = stringValue(formData, "name")
  const slug = slugify(stringValue(formData, "slug") || name)

  const { error } = await supabase.from("attributes").insert({ name, slug })
  throwSupabaseError(error)

  revalidatePath("/settings")
}

export async function updateAttribute(formData: FormData) {
  const supabase = await createClient()
  const id = stringValue(formData, "id")
  const name = stringValue(formData, "name")
  const slug = slugify(stringValue(formData, "slug") || name)

  const { error } = await supabase.from("attributes").update({ name, slug }).eq("id", id)
  throwSupabaseError(error)

  revalidatePath("/settings")
  revalidatePath("/menus")
}

export async function toggleAttribute(formData: FormData) {
  const supabase = await createClient()
  const id = stringValue(formData, "id")
  const is_active = stringValue(formData, "is_active") === "true"

  const { error } = await supabase.from("attributes").update({ is_active }).eq("id", id)
  throwSupabaseError(error)

  revalidatePath("/settings")
  revalidatePath("/menus")
}

export async function createAttributeOption(formData: FormData) {
  const supabase = await createClient()
  const attribute_id = stringValue(formData, "attribute_id")
  const label = stringValue(formData, "label")
  const value = slugify(stringValue(formData, "value") || label)
  const sort_order = Number(stringValue(formData, "sort_order") || 0)

  const { error } = await supabase
    .from("attribute_options")
    .insert({ attribute_id, label, value, sort_order })
  throwSupabaseError(error)

  revalidatePath("/settings")
}

export async function updateAttributeOption(formData: FormData) {
  const supabase = await createClient()
  const id = stringValue(formData, "id")
  const label = stringValue(formData, "label")
  const value = slugify(stringValue(formData, "value") || label)
  const sort_order = Number(stringValue(formData, "sort_order") || 0)

  const { error } = await supabase
    .from("attribute_options")
    .update({ label, value, sort_order })
    .eq("id", id)
  throwSupabaseError(error)

  revalidatePath("/settings")
}

export async function toggleAttributeOption(formData: FormData) {
  const supabase = await createClient()
  const id = stringValue(formData, "id")
  const is_active = stringValue(formData, "is_active") === "true"

  const { error } = await supabase.from("attribute_options").update({ is_active }).eq("id", id)
  throwSupabaseError(error)

  revalidatePath("/settings")
}

export async function createMenu(formData: FormData) {
  const supabase = await createClient()
  const enabledAttributeIds = formData.getAll("enabled_attribute_ids").map(String)

  const { data: menu, error } = await supabase
    .from("menus")
    .insert({
      name: stringValue(formData, "name"),
      short_code: nullableString(formData, "short_code"),
    })
    .select("id")
    .single()
  throwSupabaseError(error)
  if (!menu) throw new Error("Menu was not created.")

  if (enabledAttributeIds.length) {
    const { error: attributeError } = await supabase.from("menu_attributes").insert(
      enabledAttributeIds.map((attribute_id) => ({
        menu_id: menu.id,
        attribute_id,
        is_active: true,
      }))
    )
    throwSupabaseError(attributeError)
  }

  revalidatePath("/menus")
}

export async function updateMenu(formData: FormData) {
  const supabase = await createClient()
  const id = stringValue(formData, "id")
  const allAttributeIds = formData.getAll("attribute_ids").map(String)
  const enabled = new Set(formData.getAll("enabled_attribute_ids").map(String))

  const { error } = await supabase
    .from("menus")
    .update({
      name: stringValue(formData, "name"),
      short_code: nullableString(formData, "short_code"),
    })
    .eq("id", id)
  throwSupabaseError(error)

  if (allAttributeIds.length) {
    const { error: attributeError } = await supabase.from("menu_attributes").upsert(
      allAttributeIds.map((attribute_id) => ({
        menu_id: id,
        attribute_id,
        is_active: enabled.has(attribute_id),
      })),
      { onConflict: "menu_id,attribute_id" }
    )
    throwSupabaseError(attributeError)
  }

  revalidatePath("/menus")
  revalidatePath("/orders/new")
}

export async function toggleMenu(formData: FormData) {
  const supabase = await createClient()
  const id = stringValue(formData, "id")
  const is_active = stringValue(formData, "is_active") === "true"

  const { error } = await supabase.from("menus").update({ is_active }).eq("id", id)
  throwSupabaseError(error)

  revalidatePath("/menus")
}

export async function createOrder(formData: FormData) {
  const supabase = await createClient()
  const orderType = stringValue(formData, "order_type")
  const platform = orderType === "online" ? stringValue(formData, "platform") : null

  const { data, error } = await supabase.rpc("create_order_with_code", {
    p_order_type: orderType,
    p_platform: platform,
    p_customer_name: stringValue(formData, "customer_name"),
    p_note: nullableString(formData, "note"),
  })
  throwSupabaseError(error)

  revalidatePath("/")
  revalidatePath("/orders")
  redirect(`/orders/${data}`)
}

export async function updateOrderStatus(formData: FormData) {
  const supabase = await createClient()
  const id = stringValue(formData, "id")
  const status = stringValue(formData, "status")

  const { error } = await supabase.from("orders").update({ status }).eq("id", id)
  throwSupabaseError(error)

  revalidatePath("/")
  revalidatePath("/orders")
  revalidatePath(`/orders/${id}`)
}

export async function createOrderItem(formData: FormData) {
  const supabase = await createClient()
  const order_id = stringValue(formData, "order_id")
  const qty = Math.max(1, Number(stringValue(formData, "qty") || 1))

  const { error } = await supabase.from("order_items").insert({
    order_id,
    menu_id: stringValue(formData, "menu_id"),
    menu_name: stringValue(formData, "menu_name"),
    qty,
    selected_attributes: parseJson<Record<string, string>>(formData.get("selected_attributes"), {}),
    selected_attribute_labels: parseJson<string[]>(formData.get("selected_attribute_labels"), []),
    notes: nullableString(formData, "notes"),
  })
  throwSupabaseError(error)

  const { error: orderError } = await supabase
    .from("orders")
    .update({ status: "in_progress" })
    .eq("id", order_id)
    .eq("status", "draft")
  throwSupabaseError(orderError)

  revalidatePath("/")
  revalidatePath("/orders")
  revalidatePath(`/orders/${order_id}`)
}

export async function updateOrderItem(formData: FormData) {
  const supabase = await createClient()
  const id = stringValue(formData, "id")
  const orderId = stringValue(formData, "order_id")
  const qty = Math.max(1, Number(stringValue(formData, "qty") || 1))

  const { error } = await supabase
    .from("order_items")
    .update({
      qty,
      selected_attributes: parseJson<Record<string, string>>(formData.get("selected_attributes"), {}),
      selected_attribute_labels: parseJson<string[]>(formData.get("selected_attribute_labels"), []),
      notes: nullableString(formData, "notes"),
    })
    .eq("id", id)
  throwSupabaseError(error)

  revalidatePath(`/orders/${orderId}`)
}

export async function deleteOrderItem(formData: FormData) {
  const supabase = await createClient()
  const id = stringValue(formData, "id")
  const orderId = stringValue(formData, "order_id")

  const { error } = await supabase.from("order_items").delete().eq("id", id)
  throwSupabaseError(error)

  revalidatePath(`/orders/${orderId}`)
}

export async function incrementPrintedCount(itemId: string, orderId: string) {
  const supabase = await createClient()

  const { data: item, error: itemError } = await supabase
    .from("order_items")
    .select("printed_count")
    .eq("id", itemId)
    .single()
  throwSupabaseError(itemError)
  if (!item) throw new Error("Order item was not found.")

  const { error } = await supabase
    .from("order_items")
    .update({ printed_count: Number(item.printed_count ?? 0) + 1 })
    .eq("id", itemId)
  throwSupabaseError(error)

  revalidatePath(`/orders/${orderId}`)
  revalidatePath(`/print/label/${itemId}`)
}
