import { clsx } from "clsx";
import { ArrowRight } from "lucide-react";

type ButtonVariant = "primary" | "outline";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  showArrow?: boolean;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-black text-white",
  outline: "bg-white text-black border border-black",
};

export function Button({
  variant = "primary",
  showArrow = false,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "flex h-[48px] w-full items-center justify-center gap-2 px-5 text-sm font-bold uppercase tracking-wide",
        "transition-opacity active:opacity-70 disabled:opacity-40",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
      {showArrow && <ArrowRight size={16} strokeWidth={1.75} />}
    </button>
  );
}
