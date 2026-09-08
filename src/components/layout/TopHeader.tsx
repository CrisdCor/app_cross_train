import Link from "next/link";
import { Bell, User } from "lucide-react";

interface TopHeaderProps {
  greetingName: string;
  hasUnreadNotifications?: boolean;
}

export function TopHeader({ greetingName, hasUnreadNotifications = false }: TopHeaderProps) {
  return (
    <header className="flex items-center justify-between px-5 pb-4 pt-6">
      <p className="label-heading text-[15px] text-text-primary">Hola, {greetingName}</p>
      <div className="flex items-center gap-5">
        <Link href="/notificaciones" aria-label="Notificaciones" className="relative">
          <Bell size={22} strokeWidth={1.5} className="text-text-primary" />
          {hasUnreadNotifications && (
            <span className="absolute -right-0.5 -top-0.5 h-[7px] w-[7px] bg-black" />
          )}
        </Link>
        <Link href="/perfil" aria-label="Perfil">
          <User size={22} strokeWidth={1.5} className="text-text-primary" />
        </Link>
      </div>
    </header>
  );
}
