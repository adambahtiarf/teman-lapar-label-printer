"use client"

import { useState } from "react"
import { createOrder } from "@/app/actions"
import { PlusIcon } from "lucide-react"
import { ONLINE_PLATFORM_OPTIONS } from "@/lib/platforms"
import { Button } from "@/components/ui/button"
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

export function CreateOrderForm() {
  const [orderType, setOrderType] = useState("offline")
  const [platform, setPlatform] = useState("GOJ")

  return (
    <form action={createOrder} className="flex flex-col gap-5">
      <input type="hidden" name="order_type" value={orderType} />
      <input type="hidden" name="platform" value={platform} />
      <FieldGroup>
        <Field>
          <FieldLabel>Order Type</FieldLabel>
          <Select value={orderType} onValueChange={setOrderType}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="offline">Offline</SelectItem>
                <SelectItem value="online">Online</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        {orderType === "online" ? (
          <Field>
            <FieldLabel>Platform</FieldLabel>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {ONLINE_PLATFORM_OPTIONS.map((option) => (
                    <SelectItem key={option.code} value={option.code}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        ) : null}
        <Field>
          <FieldLabel htmlFor="customer_name">Customer Name</FieldLabel>
          <Input id="customer_name" name="customer_name" required />
        </Field>
        <Field>
          <FieldLabel htmlFor="note">Order Note</FieldLabel>
          <Textarea id="note" name="note" />
        </Field>
      </FieldGroup>
      <Button type="submit">
        <PlusIcon data-icon="inline-start" />
        Create Order
      </Button>
    </form>
  )
}
