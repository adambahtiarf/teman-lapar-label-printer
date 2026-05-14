"use client"

import { useState } from "react"
import { CheckIcon, PencilIcon, PlusIcon } from "lucide-react"
import { createPaperSize, updatePaperSize } from "@/app/actions"
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
import type { PaperSize } from "@/lib/types"

export function PaperSizeForm({ paperSize }: { paperSize?: PaperSize }) {
  const [open, setOpen] = useState(false)
  const action = paperSize ? updatePaperSize : createPaperSize

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={paperSize ? "outline" : "default"} size="sm">
          {paperSize ? <PencilIcon data-icon="inline-start" /> : <PlusIcon data-icon="inline-start" />}
          {paperSize ? "Edit" : "Add Paper Size"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{paperSize ? "Edit paper size" : "Add paper size"}</DialogTitle>
          <DialogDescription>Choose the label dimensions used by preview and direct printing.</DialogDescription>
        </DialogHeader>
        <form
          action={async (formData) => {
            await action(formData)
            setOpen(false)
          }}
          className="flex flex-col gap-5"
        >
          {paperSize ? <input type="hidden" name="id" value={paperSize.id} /> : null}
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor={`paper-size-name-${paperSize?.id ?? "new"}`}>Name</FieldLabel>
              <Input
                id={`paper-size-name-${paperSize?.id ?? "new"}`}
                name="name"
                defaultValue={paperSize?.name}
                placeholder="NIIMBOT 40 x 30"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`paper-size-width-${paperSize?.id ?? "new"}`}>Width (mm)</FieldLabel>
              <Input
                id={`paper-size-width-${paperSize?.id ?? "new"}`}
                name="width_mm"
                type="number"
                min="1"
                step="0.1"
                defaultValue={paperSize?.width_mm ?? 40}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`paper-size-height-${paperSize?.id ?? "new"}`}>Height (mm)</FieldLabel>
              <Input
                id={`paper-size-height-${paperSize?.id ?? "new"}`}
                name="height_mm"
                type="number"
                min="1"
                step="0.1"
                defaultValue={paperSize?.height_mm ?? 30}
                required
              />
            </Field>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" name="is_default" value="true" defaultChecked={paperSize?.is_default} />
              Set as default paper size
            </label>
          </FieldGroup>
          <Button type="submit">
            <CheckIcon data-icon="inline-start" />
            {paperSize ? "Save Paper Size" : "Create Paper Size"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
