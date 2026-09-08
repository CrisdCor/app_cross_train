"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { Home, Timer, Users } from "lucide-react";
import { SquatIcon } from "@/components/icons/SquatIcon";

const ITEMS = [
  { href: "/home", icon: Home, label: "Inicio" },
  { href: "/wod", icon: SquatIcon, label: "WOD" },
  { href: "/temporizador", icon: Timer, label: "Cronómetro" },
  { href: "/comunidad", icon: Users, label: "Comunidad" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 flex items-stretch justify-around border-t border-border bg-white pb-safe">
      {ITEMS.map(({ href, icon: Icon, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            aria-current={active ? "page" : undefined}
            className="flex flex-1 flex-col items-center gap-2 pb-1 pt-3"
          >
            <Icon
              size={22}
              strokeWidth={1.5}
              className={active ? "text-black" : "text-text-muted"}
            />
            <span className={clsx("h-[2px] w-5", active ? "bg-black" : "bg-transparent")} />
          </Link>
        );
      })}
    </nav>
  );
}
