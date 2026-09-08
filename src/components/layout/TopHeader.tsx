import Link from "next/link";
import { Search, Bell, User } from "lucide-react";

interface TopHeaderProps {
  greetingName: string;
  unreadCount?: number;
}

export function TopHeader({ greetingName, unreadCount = 0 }: TopHeaderProps) {
  return (
    <header className="flex items-center justify-between px-5 pb-4 pt-6">
      <p className="label-heading text-[15px] text-text-primary">Hola, {greetingName}</p>
      <div className="flex items-center gap-5">
        <Link href="/buscar" aria-label="Buscar">
          <Search size={22} strokeWidth={1.5} className="text-text-primary" />
        </Link>
        <Link href="/notificaciones" aria-label="Notificaciones" className="relative">
          <Bell size={22} strokeWidth={1.5} className="text-text-primary" />
          {unreadCount > 0 && (
            <span className="absolute -right-2 -top-2 flex h-[16px] min-w-[16px] items-center justify-center bg-black px-[3px] text-[10px] font-bold leading-none text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>
        <Link href="/cuenta" aria-label="Cuenta">
          <User size={22} strokeWidth={1.5} className="text-text-primary" />
        </Link>
      </div>
    </header>
  );
}
