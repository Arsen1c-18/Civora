import type { ButtonHTMLAttributes } from "react";
import { clsx } from "clsx";

export type ButtonVariant = "primary" | "orange" | "navy" | "secondary" | "outline" | "ghost" | "dark";
export type ButtonSize = "sm" | "md" | "lg";

const variants: Record<ButtonVariant, string> = {
  /* Primary buttons use CIVORA Primary Teal (#0D9488) */
  primary:
    "bg-[#0D9488] text-white shadow-xs hover:bg-[#0F766E] active:bg-[#115E59] focus-visible:ring-[#0D9488]",
  /* Legacy alias seamlessly mapped to Teal — no orange rendered */
  orange:
    "bg-[#0D9488] text-white shadow-xs hover:bg-[#0F766E] active:bg-[#115E59] focus-visible:ring-[#0D9488]",
  /* Navy brand variant (#101D32) */
  navy:
    "bg-[#101D32] text-white shadow-xs hover:bg-[#192B45] active:bg-[#0B1320] focus-visible:ring-[#101D32]",
  /* Clean white card secondary with #E2E8F0 border */
  secondary:
    "border border-[#E2E8F0] bg-white text-[#172033] shadow-2xs hover:bg-[#F3F6F8] hover:border-slate-300 active:bg-slate-100 focus-visible:ring-[#0D9488]",
  outline:
    "border border-[#0D9488] bg-white text-[#0D9488] shadow-2xs hover:bg-teal-50 hover:border-[#0F766E] active:bg-teal-100 focus-visible:ring-[#0D9488]",
  ghost:
    "text-[#0D9488] hover:bg-teal-50 hover:text-[#0F766E] active:bg-teal-100 focus-visible:ring-[#0D9488]",
  dark:
    "bg-[#101D32] text-white shadow-xs hover:bg-[#192B45] active:bg-[#0B1320] focus-visible:ring-[#101D32]",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8.5 px-3 text-xs font-semibold",
  md: "h-10 px-4 text-sm font-semibold",
  lg: "h-11 px-5 text-sm font-semibold",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-all duration-150 cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        "disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.99]",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
