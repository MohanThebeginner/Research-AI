import { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

const variantStyles = {
  primary: "bg-primary text-white hover:bg-primary-hover",
  secondary: "bg-surface text-ink border border-border hover:bg-primary-soft",
  ghost: "bg-transparent text-ink hover:bg-primary-soft",
  danger: "bg-transparent text-danger hover:bg-danger-soft",
};

export default function Button({
  variant = "primary",
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variantStyles[variant]} ${className}`}
      disabled={disabled}
      {...props}
    />
  );
}
