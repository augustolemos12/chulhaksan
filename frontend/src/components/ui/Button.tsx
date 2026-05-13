import { ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  fullWidth = false,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center font-bold rounded-xl transition-all duration-300 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none";

  const variants = {
    primary: "bg-gradient-to-r from-primary to-accent text-white shadow-md hover:shadow-glow hover:scale-[1.02]",
    secondary: "bg-surface text-text shadow-soft border border-border hover:border-primary/50",
    outline: "border-2 border-primary text-primary hover:bg-primary/5",
    ghost: "text-muted hover:text-text hover:bg-black/5 dark:hover:bg-surface/5",
  };

  const widthStyle = fullWidth ? "w-full" : "";
  const padding = variant === 'ghost' ? "px-4 py-2" : "px-6 py-3.5";

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${widthStyle} ${padding} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}