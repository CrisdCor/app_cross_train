"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Dumbbell, User, Users } from "lucide-react";
import { clsx } from "clsx";
import type { Role } from "@/lib/types";

const baseItems = [
  { href: "/home", label: "Inicio", icon: Home },
  { href: "/workout", label: "Workout", icon: Dumbbell },
];

const coachItem = { href: "/coach", label: "Coach", icon: Users };

const profileItem = { href: "/perfil", label: "Perfil", icon: User };

export function BottomNav({ role }: { role?: Role }) {
  const pathname = usePathname();
  const items =
    role === "head_coach" || role === "admin"
      ? [...baseItems, coachItem, profileItem]
      : [...baseItems, profileItem];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-md">
      <div className="mx-3 mb-3 flex items-center justify-around rounded-card border border-border bg-surface-1/90 px-2 py-2 pb-safe backdrop-blur-md">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname?.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className="relative flex flex-1 flex-col items-center gap-1 py-2"
            >
              {active && (
                <motion.div
                  layoutId="bottom-nav-active"
                  className="absolute -top-1 h-1 w-6 rounded-full bg-accent-lime"
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                />
              )}
              <Icon
                size={22}
                strokeWidth={2}
                className={clsx(active ? "text-accent-lime" : "text-text-secondary")}
              />
              <span
                className={clsx(
                  "text-[11px] font-medium",
                  active ? "text-accent-lime" : "text-text-secondary"
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
