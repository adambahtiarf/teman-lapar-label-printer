"use client"

import { format } from "date-fns"
import { CalendarIcon, XIcon } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

function parseDateValue(value?: string) {
  if (!value) return undefined

  const [year, month, day] = value.split("-").map(Number)
  if (!year || !month || !day) return undefined

  return new Date(year, month - 1, day)
}

export function DatePickerField({
  id,
  name,
  defaultValue,
}: {
  id: string
  name: string
  defaultValue?: string
}) {
  const [date, setDate] = useState<Date | undefined>(parseDateValue(defaultValue))
  const [open, setOpen] = useState(false)
  const value = date ? format(date, "yyyy-MM-dd") : ""

  return (
    <div className="flex gap-2">
      <input id={id} name={name} type="hidden" value={value} readOnly />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn("min-w-0 flex-1 justify-start", !date && "text-muted-foreground")}
          >
            <CalendarIcon data-icon="inline-start" />
            {date ? format(date, "PPP") : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(nextDate) => {
              setDate(nextDate)
              setOpen(false)
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {date ? (
        <Button type="button" variant="ghost" size="icon" aria-label="Clear date" onClick={() => setDate(undefined)}>
          <XIcon />
        </Button>
      ) : null}
    </div>
  )
}
