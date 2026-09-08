import Link from "next/link";
import { buttonClassName, type ButtonVariant } from "@/components/ui/Button";

interface LinkButtonProps {
  href: string;
  variant?: ButtonVariant;
  className?: string;
  children: React.ReactNode;
}

/**
 * Mismo aspecto visual que <Button>, pero renderiza un <Link> — nunca un
 * <button> anidado dentro de un enlace (HTML inválido y mal accesible).
 */
export function LinkButton({ href, variant = "primary", className, children }: LinkButtonProps) {
  return (
    <Link href={href} className={buttonClassName(variant, className)}>
      {children}
    </Link>
  );
}
