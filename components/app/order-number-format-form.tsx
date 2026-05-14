"use client"

import { useState } from "react"
import { CheckIcon, PencilIcon, PlusIcon } from "lucide-react"
import { createOrderNumberFormat, updateOrderNumberFormat } from "@/app/actions"
import { Button } from "@/components/ui/button"
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
import { DEFAULT_ORDER_NUMBER_FORMAT, ORDER_NUMBER_DATE_PATTERNS, buildOrderNumberPreview } from "@/lib/settings"
import type { OrderNumberFormat } from "@/lib/types"

export function OrderNumberFormatForm({ format }: { format?: OrderNumberFormat }) {
  const [open, setOpen] = useState(false)
  const action = format ? updateOrderNumberFormat : createOrderNumberFormat
  const preview = buildOrderNumberPreview(format)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={format ? "outline" : "default"} size="sm">
          {format ? <PencilIcon data-icon="inline-start" /> : <PlusIcon data-icon="inline-start" />}
          {format ? "Edit" : "Add Order Format"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{format ? "Edit order format" : "Add order format"}</DialogTitle>
          <DialogDescription>Control prefixes, date block, sequence length, and suffix behavior.</DialogDescription>
        </DialogHeader>
        <form
          action={async (formData) => {
            await action(formData)
            setOpen(false)
          }}
          className="flex flex-col gap-5"
        >
          {format ? <input type="hidden" name="id" value={format.id} /> : null}
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor={`order-format-name-${format?.id ?? "new"}`}>Name</FieldLabel>
              <Input
                id={`order-format-name-${format?.id ?? "new"}`}
                name="name"
                defaultValue={format?.name}
                placeholder="Default"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`order-format-offline-${format?.id ?? "new"}`}>Offline Prefix</FieldLabel>
              <Input
                id={`order-format-offline-${format?.id ?? "new"}`}
                name="offline_prefix"
                defaultValue={format?.offline_prefix ?? DEFAULT_ORDER_NUMBER_FORMAT.offline_prefix}
                maxLength={8}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`order-format-goj-${format?.id ?? "new"}`}>GOJEK Prefix</FieldLabel>
              <Input
                id={`order-format-goj-${format?.id ?? "new"}`}
                name="goj_prefix"
                defaultValue={format?.goj_prefix ?? DEFAULT_ORDER_NUMBER_FORMAT.goj_prefix}
                maxLength={8}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`order-format-grab-${format?.id ?? "new"}`}>Grab Prefix</FieldLabel>
              <Input
                id={`order-format-grab-${format?.id ?? "new"}`}
                name="grab_prefix"
                defaultValue={format?.grab_prefix ?? DEFAULT_ORDER_NUMBER_FORMAT.grab_prefix}
                maxLength={8}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`order-format-shopee-${format?.id ?? "new"}`}>Shopee Prefix</FieldLabel>
              <Input
                id={`order-format-shopee-${format?.id ?? "new"}`}
                name="shopee_prefix"
                defaultValue={format?.shopee_prefix ?? DEFAULT_ORDER_NUMBER_FORMAT.shopee_prefix}
                maxLength={8}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`order-format-date-${format?.id ?? "new"}`}>Date Pattern</FieldLabel>
              <select
                id={`order-format-date-${format?.id ?? "new"}`}
                name="date_pattern"
                defaultValue={format?.date_pattern ?? DEFAULT_ORDER_NUMBER_FORMAT.date_pattern}
                className="h-9 w-full rounded-4xl border border-input bg-input/30 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                {ORDER_NUMBER_DATE_PATTERNS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field>
              <FieldLabel htmlFor={`order-format-sequence-${format?.id ?? "new"}`}>Sequence Digits</FieldLabel>
              <Input
                id={`order-format-sequence-${format?.id ?? "new"}`}
                name="sequence_padding"
                type="number"
                min="1"
                max="6"
                defaultValue={format?.sequence_padding ?? DEFAULT_ORDER_NUMBER_FORMAT.sequence_padding}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`order-format-separator-${format?.id ?? "new"}`}>Separator</FieldLabel>
              <Input
                id={`order-format-separator-${format?.id ?? "new"}`}
                name="separator"
                defaultValue={format?.separator ?? DEFAULT_ORDER_NUMBER_FORMAT.separator}
                placeholder="-"
                maxLength={2}
              />
            </Field>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                name="include_random_suffix"
                value="true"
                defaultChecked={format?.include_random_suffix ?? DEFAULT_ORDER_NUMBER_FORMAT.include_random_suffix}
              />
              Add random letter suffix
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" name="is_default" value="true" defaultChecked={format?.is_default} />
              Set as default order format
            </label>
          </FieldGroup>
          <p className="rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">Preview: {preview}</p>
          <Button type="submit">
            <CheckIcon data-icon="inline-start" />
            {format ? "Save Order Format" : "Create Order Format"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
