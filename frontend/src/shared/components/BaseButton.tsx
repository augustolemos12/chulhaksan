import { forwardRef, type ButtonHTMLAttributes } from 'react';

export interface BaseButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  fullWidth?: boolean;
}

export const BaseButton = forwardRef<HTMLButtonElement, BaseButtonProps>(
  ({ children, variant = 'primary', fullWidth = false, className = '', ...rest }, ref) => {
    const containerClasses = [
      'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-300 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none',
      fullWidth ? 'w-full' : '',
      variant === 'ghost' ? 'px-4 py-2' : 'px-6 py-3.5',
      variant === 'primary' ? 'bg-gradient-to-r from-primary to-accent text-white shadow-md hover:shadow-glow hover:scale-[1.02]' : '',
      variant === 'secondary' ? 'bg-surface text-text shadow-soft border border-border hover:border-primary/50' : '',
      variant === 'outline' ? 'border-2 border-primary text-primary hover:bg-primary/5' : '',
      variant === 'ghost' ? 'text-muted hover:text-text hover:bg-black/5 dark:hover:bg-surface/5' : '',
      className
    ].filter(Boolean).join(' ');

    return (
      <button ref={ref} className={containerClasses} {...rest}>
        {children}
      </button>
    );
  }
);
BaseButton.displayName = 'BaseButton';
