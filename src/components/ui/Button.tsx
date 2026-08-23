"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { clsx } from "clsx";

type ButtonVariant = "primary" | "outline" | "ghost";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: ButtonVariant;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-text-primary text-black",
  outline: "bg-transparent text-text-primary border border-border",
  ghost: "bg-transparent text-text-secondary",
};

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className={clsx(
        "flex h-[42px] w-full items-center justify-center gap-2 rounded-control px-5 text-sm font-bold uppercase tracking-wide",
        "disabled:opacity-40",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
