import { toggleAttribute, toggleAttributeOption } from "@/app/actions";
import { PowerIcon, PowerOffIcon } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { AttributeForm } from "@/components/app/attribute-form";
import { AttributeOptionForm } from "@/components/app/attribute-option-form";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getAttributes } from "@/lib/data";
import { ORDER_CODE_PREFIX_INFO } from "@/lib/platforms";

export default async function SettingsPage() {
  const attributes = await getAttributes(false);

  return (
    <AppShell>
      <PageHeader
        title="Settings"
        description="Global reusable attributes for menu items."
        action={<AttributeForm />}
      />

      {attributes.length ? (
        <section className="flex flex-col gap-3">
          {attributes.map((attribute) => (
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
                <p className="text-sm text-muted-foreground">
                  {attribute.slug}
                </p>
                {attribute.attribute_options.length ? (
                  <div className="flex flex-col gap-2">
                    {attribute.attribute_options.map((option) => (
                      <div
                        key={option.id}
                        className="flex items-center justify-between gap-2 text-sm"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium">{option.label}</p>
                          <p className="truncate text-muted-foreground">
                            {option.value}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <Badge
                            variant={option.is_active ? "active" : "inactive"}
                          >
                            {option.is_active ? "On" : "Off"}
                          </Badge>
                          <AttributeOptionForm
                            attributeId={attribute.id}
                            option={option}
                          />
                          <form action={toggleAttributeOption}>
                            <input type="hidden" name="id" value={option.id} />
                            <input
                              type="hidden"
                              name="is_active"
                              value={String(!option.is_active)}
                            />
                            <Button
                              type="submit"
                              variant={
                                option.is_active ? "destructive" : "ghost"
                              }
                              size="icon"
                            >
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
                  <p className="text-sm text-muted-foreground">
                    No options yet.
                  </p>
                )}
                <Separator />
                <AttributeOptionForm attributeId={attribute.id} />
              </CardContent>
              <CardFooter className="grid grid-cols-2 gap-2">
                <AttributeForm attribute={attribute} />
                <form action={toggleAttribute}>
                  <input type="hidden" name="id" value={attribute.id} />
                  <input
                    type="hidden"
                    name="is_active"
                    value={String(!attribute.is_active)}
                  />
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

      <Card size="sm">
        <CardHeader>
          <CardTitle>General</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
          <p>Label route uses a 40mm x 30mm print page.</p>
          <p>
            NIIMBOT direct print is available from the label page with Bluetooth
            and USB Serial browser support.
          </p>
          <p>
            Order code prefixes:{" "}
            {ORDER_CODE_PREFIX_INFO.map((item) => `${item.code} = ${item.label}`).join(", ")}.
          </p>
          <p>Use the browser print dialog to choose the thermal printer.</p>
        </CardContent>
      </Card>
    </AppShell>
  );
}
