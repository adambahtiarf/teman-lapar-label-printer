import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PageHeader({
  title,
  description,
  backHref,
  action,
}: {
  title: string
  description?: string
  backHref?: string
  action?: React.ReactNode
}) {
  return (
    <header className="flex items-start justify-between gap-3 py-2">
      <div className="flex min-w-0 flex-col gap-1">
        {backHref ? (
          <Button asChild variant="ghost" size="sm" className="-ml-3 w-fit">
            <Link href={backHref}>
              <ArrowLeftIcon data-icon="inline-start" />
              Back
            </Link>
          </Button>
        ) : null}
        <h1 className="font-heading text-2xl font-semibold tracking-normal">{title}</h1>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  )
}
