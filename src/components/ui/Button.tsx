import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

/*
  Botões do Oratio: pílula, peso 700, e um hover que escurece, sobe 2px e
  ganha sombra. O secundário é o .btn-ghost de lá — fundo creme quente e texto
  na cor principal fechada.
*/
const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-accent-solid text-on-accent shadow-sm hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-xl dark:hover:bg-accent-solid/90",
  secondary:
    "bg-elevated text-accent-hover hover:-translate-y-0.5 hover:bg-line-strong hover:shadow-md dark:text-accent",
  ghost: "text-muted hover:bg-elevated hover:text-heading",
  danger:
    "bg-accent/10 text-accent hover:-translate-y-0.5 hover:bg-accent/15 hover:shadow-md",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-4 text-xs",
  md: "h-11 px-6 text-[0.92rem]",
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-bold tracking-[0.01em] transition-[transform,background-color,box-shadow,color] duration-[250ms] ease-oratio active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:pointer-events-none disabled:opacity-50";

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(BASE, VARIANTS[variant], SIZES[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
}: CommonProps & { href: string }) {
  return (
    <Link
      href={href}
      className={cn(BASE, VARIANTS[variant], SIZES[size], className)}
    >
      {children}
    </Link>
  );
}
