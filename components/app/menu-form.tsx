"use client"

import { useMemo, useState } from "react"
import { createMenu, updateMenu } from "@/app/actions"
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
import { Field, FieldContent, FieldGroup, FieldLabel, FieldTitle } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import type { Attribute, Menu } from "@/lib/types"

export function MenuForm({ menu, attributes }: { menu?: Menu; attributes: Attribute[] }) {
  const [open, setOpen] = useState(false)
  const enabledIds = useMemo(
    () =>
      new Set(
        (menu?.menu_attributes ?? [])
          .filter((item) => item.is_active)
          .map((item) => item.attribute_id)
      ),
    [menu]
  )
  const [enabled, setEnabled] = useState<Set<string>>(enabledIds)
  const action = menu ? updateMenu : createMenu

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={menu ? "outline" : "default"} size="sm">
          {menu ? <PencilIcon data-icon="inline-start" /> : <PlusIcon data-icon="inline-start" />}
          {menu ? "Edit" : "Add Menu"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{menu ? "Edit menu" : "Add menu"}</DialogTitle>
          <DialogDescription>Choose which global attributes apply to this menu.</DialogDescription>
        </DialogHeader>
        <form
          action={async (formData) => {
            await action(formData)
            setOpen(false)
          }}
          className="flex flex-col gap-5"
        >
          {menu ? <input type="hidden" name="id" value={menu.id} /> : null}
          {attributes.map((attribute) => (
            <input key={attribute.id} type="hidden" name="attribute_ids" value={attribute.id} />
          ))}
          {[...enabled].map((id) => (
            <input key={id} type="hidden" name="enabled_attribute_ids" value={id} />
          ))}
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor={`menu-name-${menu?.id ?? "new"}`}>Name</FieldLabel>
              <Input id={`menu-name-${menu?.id ?? "new"}`} name="name" defaultValue={menu?.name} required />
            </Field>
            <Field>
              <FieldLabel htmlFor={`menu-code-${menu?.id ?? "new"}`}>Short Code</FieldLabel>
              <Input id={`menu-code-${menu?.id ?? "new"}`} name="short_code" defaultValue={menu?.short_code ?? ""} />
            </Field>
            <div className="flex flex-col gap-3">
              {attributes.map((attribute) => {
                const checked = enabled.has(attribute.id)
                return (
                  <Field key={attribute.id} orientation="horizontal">
                    <FieldContent>
                      <FieldTitle>{attribute.name}</FieldTitle>
                    </FieldContent>
                    <Switch
                      checked={checked}
                      onCheckedChange={(next) => {
                        setEnabled((current) => {
                          const copy = new Set(current)
                          if (next) copy.add(attribute.id)
                          else copy.delete(attribute.id)
                          return copy
                        })
                      }}
                    />
                  </Field>
                )
              })}
            </div>
          </FieldGroup>
          <Button type="submit">
            <CheckIcon data-icon="inline-start" />
            {menu ? "Save Menu" : "Create Menu"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
