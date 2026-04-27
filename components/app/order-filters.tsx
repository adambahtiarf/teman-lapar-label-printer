"use client";
import Link from "next/link";
import { FilterIcon, RotateCcwIcon, SearchIcon } from "lucide-react";
import { DatePickerField } from "@/components/app/date-picker-field";
import { ONLINE_PLATFORM_OPTIONS } from "@/lib/platforms";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function OrderFilters({
  filters,
}: {
  filters: {
    date?: string;
    order_type?: string;
    platform?: string;
    status?: string;
  };
}) {
  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FilterIcon data-icon="inline-start" />
          Filter Orders{activeCount ? ` (${activeCount})` : ""}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Filter orders</DialogTitle>
          <DialogDescription>
            Choose the order list filters to apply.
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="date">Date</FieldLabel>
              <DatePickerField
                id="date"
                name="date"
                defaultValue={filters.date}
              />
            </Field>
            <Field>
              <FieldLabel>Order Type</FieldLabel>
              <Select
                name="order_type"
                defaultValue={filters.order_type ?? "all"}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Platform</FieldLabel>
              <Select name="platform" defaultValue={filters.platform ?? "all"}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">All</SelectItem>
                    {ONLINE_PLATFORM_OPTIONS.map((option) => (
                      <SelectItem key={option.code} value={option.code}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Status</FieldLabel>
              <Select name="status" defaultValue={filters.status ?? "all"}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>
          <div className="grid grid-cols-2 gap-2">
            <Button asChild variant="outline">
              <Link href="/orders">
                <RotateCcwIcon data-icon="inline-start" />
                Reset
              </Link>
            </Button>
            <Button type="submit">
              <SearchIcon data-icon="inline-start" />
              Apply
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
