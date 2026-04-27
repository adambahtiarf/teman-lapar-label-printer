"use client";

import { useState } from "react";
import { createAttributeOption, updateAttributeOption } from "@/app/actions";
import { CheckIcon, PencilIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { AttributeOption } from "@/lib/types";

export function AttributeOptionForm({
  attributeId,
  option,
}: {
  attributeId: string;
  option?: AttributeOption;
}) {
  const [open, setOpen] = useState(false);
  const action = option ? updateAttributeOption : createAttributeOption;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          {option ? (
            <PencilIcon data-icon="inline-start" />
          ) : (
            <PlusIcon data-icon="inline-start" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{option ? "Edit option" : "Add option"}</DialogTitle>
          <DialogDescription>
            Options are shown in order while adding items.
          </DialogDescription>
        </DialogHeader>
        <form
          action={async (formData) => {
            await action(formData);
            setOpen(false);
          }}
          className="flex flex-col gap-5"
        >
          <input type="hidden" name="attribute_id" value={attributeId} />
          {option ? <input type="hidden" name="id" value={option.id} /> : null}
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor={`option-label-${option?.id ?? attributeId}`}>
                Label
              </FieldLabel>
              <Input
                id={`option-label-${option?.id ?? attributeId}`}
                name="label"
                defaultValue={option?.label}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`option-value-${option?.id ?? attributeId}`}>
                Value
              </FieldLabel>
              <Input
                id={`option-value-${option?.id ?? attributeId}`}
                name="value"
                defaultValue={option?.value}
                placeholder="auto from label"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`option-sort-${option?.id ?? attributeId}`}>
                Sort Order
              </FieldLabel>
              <Input
                id={`option-sort-${option?.id ?? attributeId}`}
                name="sort_order"
                type="number"
                defaultValue={option?.sort_order ?? 0}
              />
            </Field>
          </FieldGroup>
          <Button type="submit">
            <CheckIcon data-icon="inline-start" />
            {option ? "Save Option" : "Create Option"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
