"use client"

import { useMemo, useState } from "react"
import { createOrderItem } from "@/app/actions"
import { PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { Attribute, Menu } from "@/lib/types"

function isAttribute(attribute: Attribute | null): attribute is Attribute {
  return Boolean(attribute)
}

export function AddOrderItemForm({ orderId, menus }: { orderId: string; menus: Menu[] }) {
  const [open, setOpen] = useState(false)
  const [menuId, setMenuId] = useState(menus[0]?.id ?? "")
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>({})
  const [selectedLabels, setSelectedLabels] = useState<Record<string, string>>({})

  const selectedMenu = useMemo(
    () => menus.find((menu) => menu.id === menuId) ?? menus[0],
    [menuId, menus]
  )

  const attributes = selectedMenu?.menu_attributes
    .filter((item) => item.is_active && item.attributes?.is_active)
    .map((item) => item.attributes)
    .filter(isAttribute) ?? []

  const labels = attributes
    .map((attribute) => selectedLabels[attribute.slug])
    .filter((label): label is string => Boolean(label))

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Add Item</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add item</DialogTitle>
          <DialogDescription>Select a menu and its options for this order.</DialogDescription>
        </DialogHeader>
        <form
          action={async (formData) => {
            await createOrderItem(formData)
            setOpen(false)
          }}
          className="flex flex-col gap-5"
        >
          <input type="hidden" name="order_id" value={orderId} />
          <input type="hidden" name="menu_id" value={selectedMenu?.id ?? ""} />
          <input type="hidden" name="menu_name" value={selectedMenu?.name ?? ""} />
          <input type="hidden" name="selected_attributes" value={JSON.stringify(selectedValues)} />
          <input type="hidden" name="selected_attribute_labels" value={JSON.stringify(labels)} />
          <FieldGroup>
            <Field>
              <FieldLabel>Menu</FieldLabel>
              <Combobox
                items={menus}
                value={selectedMenu ?? null}
                itemToStringLabel={(menu) => menu.name}
                itemToStringValue={(menu) => menu.id}
                onValueChange={(menu) => {
                  if (!menu) return
                  setMenuId(menu.id)
                  setSelectedValues({})
                  setSelectedLabels({})
                }}
              >
                <ComboboxInput placeholder="Select menu" className="w-full" />
                <ComboboxContent>
                  <ComboboxEmpty>No menu found.</ComboboxEmpty>
                  <ComboboxList>
                    {(menu) => (
                      <ComboboxItem key={menu.id} value={menu}>
                        {menu.name}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </Field>
            {attributes.map((attribute) => (
              <Field key={attribute.id}>
                <FieldLabel>{attribute.name}</FieldLabel>
                <Select
                  value={selectedValues[attribute.slug] ?? ""}
                  onValueChange={(value) => {
                    const option = attribute.attribute_options.find((item) => item.value === value)
                    setSelectedValues((current) => ({ ...current, [attribute.slug]: value }))
                    setSelectedLabels((current) => ({ ...current, [attribute.slug]: option?.label ?? value }))
                  }}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={`Select ${attribute.name}`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {attribute.attribute_options.map((option) => (
                        <SelectItem key={option.id} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            ))}
            <Field>
              <FieldLabel htmlFor="qty">Qty</FieldLabel>
              <Input id="qty" name="qty" type="number" min="1" defaultValue="1" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="notes">Notes</FieldLabel>
              <Textarea id="notes" name="notes" />
            </Field>
          </FieldGroup>
      <Button type="submit" disabled={!selectedMenu}>
        <PlusIcon data-icon="inline-start" />
        Add Item
      </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
