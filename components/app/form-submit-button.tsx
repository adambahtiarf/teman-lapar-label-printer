"use client"

import * as React from "react"
import { useFormStatus } from "react-dom"
import { Loader2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"

type FormSubmitButtonProps = React.ComponentProps<typeof Button> & {
  pendingLabel?: string
}

export function FormSubmitButton({
  children,
  disabled,
  pendingLabel = "Saving...",
  size,
  ...props
}: FormSubmitButtonProps) {
  const { pending } = useFormStatus()
  const isIconOnly = size === "icon" || size === "icon-sm" || size === "icon-lg" || size === "icon-xs"

  return (
    <Button {...props} size={size} type="submit" disabled={pending || disabled}>
      {pending ? (
        <>
          <Loader2Icon data-icon={isIconOnly ? undefined : "inline-start"} className="animate-spin" />
          {isIconOnly ? <span className="sr-only">{pendingLabel}</span> : pendingLabel}
        </>
      ) : (
        children
      )}
    </Button>
  )
}
