"use client"

import { useCallback } from "react"
import { PowerIcon, PowerOffIcon, StarIcon } from "lucide-react"
import {
  setDefaultOrderNumberFormat,
  setDefaultPaperSize,
  toggleAttribute,
  toggleAttributeOption,
  toggleOrderNumberFormat,
  togglePaperSize,
} from "@/app/actions"
import { AppShell } from "@/components/app/app-shell"
import { AttributeForm } from "@/components/app/attribute-form"
import { AttributeOptionForm } from "@/components/app/attribute-option-form"
import { EmptyState } from "@/components/app/empty-state"
import { OrderNumberFormatForm } from "@/components/app/order-number-format-form"
import { PageHeader } from "@/components/app/page-header"
import { PaperSizeForm } from "@/components/app/paper-size-form"
import { QueryErrorState, SettingsListSkeleton } from "@/components/app/page-states"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useClientQuery } from "@/hooks/use-client-query"
import { getAttributesClient, getOrderNumberFormatsClient, getPaperSizesClient } from "@/lib/client-data"
import { buildOrderNumberPreview, getActiveOrderNumberFormat, getActivePaperSize, resolvePaperSize } from "@/lib/settings"

export function SettingsPageClient() {
  const queryFn = useCallback(
    async () => {
      const [attributes, paperSizes, orderNumberFormats] = await Promise.all([
        getAttributesClient(false),
        getPaperSizesClient(false),
        getOrderNumberFormatsClient(false),
      ])

      return { attributes, paperSizes, orderNumberFormats }
    },
    []
  )

  const { data, error, isLoading, reload } = useClientQuery({
    queryFn,
    subscribeTo: ["attributes", "attribute_options", "paper_sizes", "order_number_formats"],
  })

  const activePaperSize = getActivePaperSize(data?.paperSizes ?? [])
  const resolvedPaperSize = resolvePaperSize(activePaperSize)
  const activeOrderNumberFormat = getActiveOrderNumberFormat(data?.orderNumberFormats ?? [])

  return (
    <AppShell>
      <PageHeader title="Settings" description="Manage reusable attributes, label sizes, and order numbering." />

      <section className="grid gap-3 md:grid-cols-3">
        <Card size="sm">
          <CardHeader>
            <CardTitle>Attribute</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-muted-foreground">
            <p>{data?.attributes.length ?? 0} configured</p>
            <p>Reusable choices for menu items.</p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardTitle>Paper Size</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-muted-foreground">
            <p>{data?.paperSizes.length ?? 0} configured</p>
            <p>{resolvedPaperSize.label}</p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardTitle>Order Number</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-muted-foreground">
            <p>{data?.orderNumberFormats.length ?? 0} configured</p>
            <p>{buildOrderNumberPreview(activeOrderNumberFormat)}</p>
          </CardContent>
        </Card>
      </section>

      {isLoading ? <SettingsListSkeleton /> : null}
      {!isLoading && error ? (
        <QueryErrorState description={error.message} onRetry={reload} title="Failed to load settings" />
      ) : null}

      {!isLoading && !error ? (
        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-heading text-lg font-semibold">Attributes</h2>
              <p className="text-sm text-muted-foreground">Reusable options like sugar, size, or spice.</p>
            </div>
            <AttributeForm />
          </div>

          {data?.attributes.length ? (
            <section className="flex flex-col gap-3">
              {data.attributes.map((attribute) => (
                <Card key={attribute.id} size="sm">
                  <CardHeader>
                    <CardTitle className="flex items-start justify-between gap-3">
                      <span>{attribute.name}</span>
                      <Badge variant={attribute.is_active ? "active" : "inactive"}>
                        {attribute.is_active ? "Active" : "Disabled"}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <p className="text-sm text-muted-foreground">{attribute.slug}</p>
                    {attribute.attribute_options.length ? (
                      <div className="flex flex-col gap-2">
                        {attribute.attribute_options.map((option) => (
                          <div key={option.id} className="flex items-center justify-between gap-2 text-sm">
                            <div className="min-w-0">
                              <p className="truncate font-medium">{option.label}</p>
                              <p className="truncate text-muted-foreground">{option.value}</p>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              <Badge variant={option.is_active ? "active" : "inactive"}>
                                {option.is_active ? "On" : "Off"}
                              </Badge>
                              <AttributeOptionForm attributeId={attribute.id} option={option} />
                              <form action={toggleAttributeOption}>
                                <input type="hidden" name="id" value={option.id} />
                                <input type="hidden" name="is_active" value={String(!option.is_active)} />
                                <Button type="submit" variant={option.is_active ? "destructive" : "ghost"} size="icon">
                                  {option.is_active ? (
                                    <PowerOffIcon data-icon="inline-start" />
                                  ) : (
                                    <PowerIcon data-icon="inline-start" />
                                  )}
                                </Button>
                              </form>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No options yet.</p>
                    )}
                    <Separator />
                    <AttributeOptionForm attributeId={attribute.id} />
                  </CardContent>
                  <CardFooter className="grid grid-cols-2 gap-2">
                    <AttributeForm attribute={attribute} />
                    <form action={toggleAttribute}>
                      <input type="hidden" name="id" value={attribute.id} />
                      <input type="hidden" name="is_active" value={String(!attribute.is_active)} />
                      <Button
                        type="submit"
                        variant={attribute.is_active ? "destructive" : "outline"}
                        size="sm"
                        className="w-full"
                      >
                        {attribute.is_active ? (
                          <PowerOffIcon data-icon="inline-start" />
                        ) : (
                          <PowerIcon data-icon="inline-start" />
                        )}
                        {attribute.is_active ? "Disable" : "Enable"}
                      </Button>
                    </form>
                  </CardFooter>
                </Card>
              ))}
            </section>
          ) : (
            <EmptyState
              title="No attributes"
              description="Add Sugar Level, Ice Level, Size, or other reusable choices."
            >
              <AttributeForm />
            </EmptyState>
          )}

          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-heading text-lg font-semibold">Paper Sizes</h2>
              <p className="text-sm text-muted-foreground">Choose which label size becomes the default print layout.</p>
            </div>
            <PaperSizeForm />
          </div>

          {data?.paperSizes.length ? (
            <section className="flex flex-col gap-3">
              {data.paperSizes.map((paperSize) => (
                <Card key={paperSize.id} size="sm">
                  <CardHeader>
                    <CardTitle className="flex items-start justify-between gap-3">
                      <span>{paperSize.name}</span>
                      <div className="flex items-center gap-2">
                        {paperSize.is_default ? <Badge variant="active">Default</Badge> : null}
                        <Badge variant={paperSize.is_active ? "active" : "inactive"}>
                          {paperSize.is_active ? "Active" : "Disabled"}
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
                    <p>
                      {paperSize.width_mm} x {paperSize.height_mm} mm
                    </p>
                    <p>Used by the label preview page and direct NIIMBOT printing.</p>
                  </CardContent>
                  <CardFooter className="grid grid-cols-3 gap-2">
                    <PaperSizeForm paperSize={paperSize} />
                    <form action={setDefaultPaperSize}>
                      <input type="hidden" name="id" value={paperSize.id} />
                      <Button type="submit" variant={paperSize.is_default ? "secondary" : "outline"} size="sm" className="w-full">
                        <StarIcon data-icon="inline-start" />
                        {paperSize.is_default ? "Default" : "Make Default"}
                      </Button>
                    </form>
                    <form action={togglePaperSize}>
                      <input type="hidden" name="id" value={paperSize.id} />
                      <input type="hidden" name="is_active" value={String(!paperSize.is_active)} />
                      <Button
                        type="submit"
                        variant={paperSize.is_active ? "destructive" : "outline"}
                        size="sm"
                        className="w-full"
                      >
                        {paperSize.is_active ? <PowerOffIcon data-icon="inline-start" /> : <PowerIcon data-icon="inline-start" />}
                        {paperSize.is_active ? "Disable" : "Enable"}
                      </Button>
                    </form>
                  </CardFooter>
                </Card>
              ))}
            </section>
          ) : (
            <EmptyState title="No paper sizes" description="Add label sizes like 40 x 30 mm or 50 x 30 mm.">
              <PaperSizeForm />
            </EmptyState>
          )}

          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-heading text-lg font-semibold">Order Number Formats</h2>
              <p className="text-sm text-muted-foreground">Manage prefixes and format rules for newly created orders.</p>
            </div>
            <OrderNumberFormatForm />
          </div>

          {data?.orderNumberFormats.length ? (
            <section className="flex flex-col gap-3">
              {data.orderNumberFormats.map((format) => (
                <Card key={format.id} size="sm">
                  <CardHeader>
                    <CardTitle className="flex items-start justify-between gap-3">
                      <span>{format.name}</span>
                      <div className="flex items-center gap-2">
                        {format.is_default ? <Badge variant="active">Default</Badge> : null}
                        <Badge variant={format.is_active ? "active" : "inactive"}>
                          {format.is_active ? "Active" : "Disabled"}
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
                    <p>Preview: {buildOrderNumberPreview(format)}</p>
                    <p>
                      Offline: {format.offline_prefix} | GOJ: {format.goj_prefix} | GRB: {format.grab_prefix} | SHP:{" "}
                      {format.shopee_prefix}
                    </p>
                    <p>
                      Date: {format.date_pattern} | Sequence: {format.sequence_padding} digits | Random suffix:{" "}
                      {format.include_random_suffix ? "On" : "Off"}
                    </p>
                  </CardContent>
                  <CardFooter className="grid grid-cols-3 gap-2">
                    <OrderNumberFormatForm format={format} />
                    <form action={setDefaultOrderNumberFormat}>
                      <input type="hidden" name="id" value={format.id} />
                      <Button type="submit" variant={format.is_default ? "secondary" : "outline"} size="sm" className="w-full">
                        <StarIcon data-icon="inline-start" />
                        {format.is_default ? "Default" : "Make Default"}
                      </Button>
                    </form>
                    <form action={toggleOrderNumberFormat}>
                      <input type="hidden" name="id" value={format.id} />
                      <input type="hidden" name="is_active" value={String(!format.is_active)} />
                      <Button
                        type="submit"
                        variant={format.is_active ? "destructive" : "outline"}
                        size="sm"
                        className="w-full"
                      >
                        {format.is_active ? <PowerOffIcon data-icon="inline-start" /> : <PowerIcon data-icon="inline-start" />}
                        {format.is_active ? "Disable" : "Enable"}
                      </Button>
                    </form>
                  </CardFooter>
                </Card>
              ))}
            </section>
          ) : (
            <EmptyState title="No order formats" description="Add a numbering format for offline and marketplace orders.">
              <OrderNumberFormatForm />
            </EmptyState>
          )}
        </section>
      ) : null}
    </AppShell>
  )
}
