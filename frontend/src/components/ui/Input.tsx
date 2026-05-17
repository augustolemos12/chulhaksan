import { forwardRef, type InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', label, error, icon, ...props }, ref) => {
        return (
            <div className="w-full flex flex-col gap-1.5">
                {label && (
                    <label className="text-sm font-semibold text-text ml-1">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-muted text-[22px]">
                            {icon}
                        </span>
                    )}
                    <input
                        className={`
              w-full h-14 rounded-2xl border bg-surface text-text 
              transition-all duration-300
              focus:outline-none focus:ring-4 focus:ring-primary/10
              ${icon ? 'pl-12 pr-5' : 'px-5'}
              ${error
                                ? 'border-danger focus:border-danger bg-danger/5'
                                : 'border-border focus:border-primary hover:border-primary/50'
                            }
              ${className}
            `}
                        ref={ref}
                        {...props}
                    />
                </div>
                {error && <span className="text-xs font-medium text-danger ml-1 mt-0.5">{error}</span>}
            </div>
        );
    }
);
Input.displayName = 'Input';