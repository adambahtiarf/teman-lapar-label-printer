"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardListIcon,
  HomeIcon,
  SettingsIcon,
  UtensilsIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/orders", label: "Orders", icon: ClipboardListIcon },
  { href: "/menus", label: "Menus", icon: UtensilsIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-120 flex-col bg-background px-4 pt-4">
      <div className="flex min-h-0 flex-1 flex-col gap-4">{children}</div>
      <nav className="sticky bottom-0 -mx-4 grid grid-cols-4 gap-1 border-t bg-background/95 px-3 py-3 backdrop-blur">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Button
              key={item.href}
              asChild
              variant={isActive ? "default" : "ghost"}
              size="sm"
            >
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className="h-10 flex-col"
              >
                <Icon />
                {/* <span className="text-xs">{item.label}</span> */}
              </Link>
            </Button>
          );
        })}
      </nav>
    </main>
  );
}
