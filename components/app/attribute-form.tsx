"use client"

import { useState } from "react"
import { createAttribute, updateAttribute } from "@/app/actions"
import { CheckIcon, PencilIcon, PlusIcon } from "lucide-react"
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
import type { Attribute } from "@/lib/types"

export function AttributeForm({ attribute }: { attribute?: Attribute }) {
  const [open, setOpen] = useState(false)
  const action = attribute ? updateAttribute : createAttribute

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={attribute ? "outline" : "default"} size="sm">
          {attribute ? <PencilIcon data-icon="inline-start" /> : <PlusIcon data-icon="inline-start" />}
          {attribute ? "Edit" : "Add Attribute"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{attribute ? "Edit attribute" : "Add attribute"}</DialogTitle>
          <DialogDescription>Reusable options like sugar, ice, size, or spice.</DialogDescription>
        </DialogHeader>
        <form
          action={async (formData) => {
            await action(formData)
            setOpen(false)
          }}
          className="flex flex-col gap-5"
        >
          {attribute ? <input type="hidden" name="id" value={attribute.id} /> : null}
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor={`attribute-name-${attribute?.id ?? "new"}`}>Name</FieldLabel>
              <Input
                id={`attribute-name-${attribute?.id ?? "new"}`}
                name="name"
                defaultValue={attribute?.name}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`attribute-slug-${attribute?.id ?? "new"}`}>Slug</FieldLabel>
              <Input
                id={`attribute-slug-${attribute?.id ?? "new"}`}
                name="slug"
                defaultValue={attribute?.slug}
                placeholder="auto from name"
              />
            </Field>
          </FieldGroup>
          <Button type="submit">
            <CheckIcon data-icon="inline-start" />
            {attribute ? "Save Attribute" : "Create Attribute"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
