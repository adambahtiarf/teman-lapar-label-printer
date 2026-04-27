"use client";

import { useMemo, useState, useTransition } from "react";
import {
  deleteOrderItem,
  incrementPrintedCount,
  updateOrderItem,
} from "@/app/actions";
import { CheckIcon, PencilIcon, PrinterIcon, Trash2Icon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Attribute, Menu, OrderItem } from "@/lib/types";

function isAttribute(attribute: Attribute | null): attribute is Attribute {
  return Boolean(attribute);
}

export function OrderItemCard({
  item,
  menus,
}: {
  item: OrderItem;
  menus: Menu[];
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>(
    item.selected_attributes,
  );
  const [isPending, startTransition] = useTransition();
  const isOverPrinted = item.printed_count >= item.qty;
  const selectedMenu = useMemo(
    () =>
      menus.find((menu) => menu.id === item.menu_id) ??
      menus.find((menu) => menu.name === item.menu_name),
    [item.menu_id, item.menu_name, menus],
  );
  const attributes =
    selectedMenu?.menu_attributes
      .filter(
        (menuAttribute) =>
          menuAttribute.is_active && menuAttribute.attributes?.is_active,
      )
      .map((menuAttribute) => menuAttribute.attributes)
      .filter(isAttribute) ?? [];
  const labels = attributes.length
    ? attributes
        .map((attribute) => {
          const value = selectedValues[attribute.slug];
          return attribute.attribute_options.find(
            (option) => option.value === value,
          )?.label;
        })
        .filter((label): label is string => Boolean(label))
    : item.selected_attribute_labels;

  function printLabel() {
    startTransition(async () => {
      await incrementPrintedCount(item.id, item.order_id);
      window.location.assign(`/print/label/${item.id}`);
      setConfirmOpen(false);
    });
  }

  return (
    <>
      <Card size="sm">
        <CardHeader>
          <CardTitle className="flex items-start justify-between gap-3">
            <span>{item.menu_name}</span>
            <Badge variant={isOverPrinted ? "secondary" : "outline"}>
              {item.printed_count} / {item.qty}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          {item.selected_attribute_labels.length ? (
            <p className="text-muted-foreground">
              {item.selected_attribute_labels.join(" / ")}
            </p>
          ) : null}
          {item.notes ? <p>{item.notes}</p> : null}
          <p className="text-muted-foreground">Qty {item.qty}</p>
        </CardContent>
        <CardFooter className="grid grid-cols-3 gap-2">
          <Button
            type="button"
            size="sm"
            disabled={isPending}
            onClick={() =>
              isOverPrinted ? setConfirmOpen(true) : printLabel()
            }
          >
            <PrinterIcon data-icon="inline-start" />
            Print
          </Button>
          <Dialog
            open={editOpen}
            onOpenChange={(nextOpen) => {
              if (nextOpen) setSelectedValues(item.selected_attributes);
              setEditOpen(nextOpen);
            }}
          >
            <DialogTrigger asChild>
              <Button type="button" variant="outline" size="sm">
                <PencilIcon data-icon="inline-start" />
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit item</DialogTitle>
                <DialogDescription>
                  Update attributes, quantity, or item notes.
                </DialogDescription>
              </DialogHeader>
              <form
                action={async (formData) => {
                  await updateOrderItem(formData);
                  setEditOpen(false);
                }}
                className="flex flex-col gap-5"
              >
                <input type="hidden" name="id" value={item.id} />
                <input type="hidden" name="order_id" value={item.order_id} />
                <input
                  type="hidden"
                  name="selected_attributes"
                  value={JSON.stringify(selectedValues)}
                />
                <input
                  type="hidden"
                  name="selected_attribute_labels"
                  value={JSON.stringify(labels)}
                />
                <FieldGroup>
                  {attributes.map((attribute) => (
                    <Field key={attribute.id}>
                      <FieldLabel>{attribute.name}</FieldLabel>
                      <Select
                        value={selectedValues[attribute.slug] ?? ""}
                        onValueChange={(value) => {
                          setSelectedValues((current) => ({
                            ...current,
                            [attribute.slug]: value,
                          }));
                        }}
                        required
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={`Select ${attribute.name}`}
                          />
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
                    <FieldLabel htmlFor={`qty-${item.id}`}>Qty</FieldLabel>
                    <Input
                      id={`qty-${item.id}`}
                      name="qty"
                      type="number"
                      min="1"
                      defaultValue={item.qty}
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor={`notes-${item.id}`}>Notes</FieldLabel>
                    <Textarea
                      id={`notes-${item.id}`}
                      name="notes"
                      defaultValue={item.notes ?? ""}
                    />
                  </Field>
                </FieldGroup>
                <Button type="submit">
                  <CheckIcon data-icon="inline-start" />
                  Save Item
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          <form action={deleteOrderItem}>
            <input type="hidden" name="id" value={item.id} />
            <input type="hidden" name="order_id" value={item.order_id} />
            <Button
              type="submit"
              variant="destructive"
              size="sm"
              className="w-full"
            >
              <Trash2Icon data-icon="inline-start" />
              Delete
            </Button>
          </form>
        </CardFooter>
      </Card>
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Print another label?</AlertDialogTitle>
            <AlertDialogDescription>
              This item already reached its ordered quantity. Continuing will
              count as a reprint.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={isPending} onClick={printLabel}>
              Reprint
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
