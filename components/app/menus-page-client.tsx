"use client"

import { useCallback } from "react"
import { PowerIcon, PowerOffIcon } from "lucide-react"
import { toggleMenu } from "@/app/actions"
import { AppShell } from "@/components/app/app-shell"
import { EmptyState } from "@/components/app/empty-state"
import { MenuForm } from "@/components/app/menu-form"
import { MenuListSkeleton, QueryErrorState } from "@/components/app/page-states"
import { PageHeader } from "@/components/app/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useClientQuery } from "@/hooks/use-client-query"
import { getAttributesClient, getMenusClient } from "@/lib/client-data"

export function MenusPageClient() {
  const queryFn = useCallback(async () => {
    const [menus, attributes] = await Promise.all([getMenusClient(false), getAttributesClient(true)])
    return { attributes, menus }
  }, [])
  const { data, error, isLoading, reload } = useClientQuery({
    queryFn,
    subscribeTo: ["menus", "menu_attributes", "attributes", "attribute_options"],
  })

  return (
    <AppShell>
      <PageHeader
        title="Master Menu"
        description="Configure menu items and the attributes they use."
        action={
          isLoading ? (
            <Skeleton className="h-9 w-24" />
          ) : data ? (
            <MenuForm attributes={data.attributes} />
          ) : null
        }
      />

      {isLoading ? <MenuListSkeleton /> : null}
      {!isLoading && error ? (
        <QueryErrorState description={error.message} onRetry={reload} title="Failed to load menus" />
      ) : null}
      {!isLoading && !error && data?.menus.length ? (
        <section className="flex flex-col gap-3">
          {data.menus.map((menu) => {
            const enabledAttributes = menu.menu_attributes.filter((item) => item.is_active && item.attributes)

            return (
              <Card key={menu.id} size="sm">
                <CardHeader>
                  <CardTitle className="flex items-start justify-between gap-3">
                    <span>{menu.name}</span>
                    <Badge variant={menu.is_active ? "active" : "inactive"}>
                      {menu.is_active ? "Active" : "Disabled"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {menu.short_code ? <p className="text-sm text-muted-foreground">{menu.short_code}</p> : null}
                  {enabledAttributes.length ? (
                    <div className="flex flex-wrap gap-2">
                      {enabledAttributes.map((item) => (
                        <Badge key={item.id} variant="outline">
                          {item.attributes?.name}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No attributes enabled.</p>
                  )}
                </CardContent>
                <CardFooter className="grid grid-cols-2 gap-2">
                  <MenuForm menu={menu} attributes={data.attributes} />
                  <form action={toggleMenu}>
                    <input type="hidden" name="id" value={menu.id} />
                    <input type="hidden" name="is_active" value={String(!menu.is_active)} />
                    <Button
                      type="submit"
                      variant={menu.is_active ? "destructive" : "outline"}
                      size="sm"
                      className="w-full"
                    >
                      {menu.is_active ? (
                        <PowerOffIcon data-icon="inline-start" />
                      ) : (
                        <PowerIcon data-icon="inline-start" />
                      )}
                      {menu.is_active ? "Disable" : "Enable"}
                    </Button>
                  </form>
                </CardFooter>
              </Card>
            )
          })}
        </section>
      ) : null}
      {!isLoading && !error && data && !data.menus.length ? (
        <EmptyState title="No menus" description="Add menu items before creating printable order items.">
          <MenuForm attributes={data.attributes} />
        </EmptyState>
      ) : null}
    </AppShell>
  )
}
