"use client"

import { Field, FieldContent, FieldDescription, FieldLabel, FieldTitle } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "@/components/app/theme-provider"

export function ThemeSwitch() {
  const { theme, setTheme } = useTheme()

  return (
    <FieldLabel htmlFor="theme-switch">
      <Field orientation="horizontal">
        <FieldContent>
          <FieldTitle>Dark mode</FieldTitle>
          <FieldDescription>Aktifkan tampilan gelap untuk penggunaan malam atau ruangan redup.</FieldDescription>
        </FieldContent>
        <Switch
          id="theme-switch"
          checked={theme === "dark"}
          onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        />
      </Field>
    </FieldLabel>
  )
}
