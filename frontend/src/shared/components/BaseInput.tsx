import { forwardRef, type InputHTMLAttributes } from 'react';

export interface BaseInputProps extends InputHTMLAttributes<HTMLInputElement> {
  labelText?: string;
  errorMessage?: string;
  leftIcon?: string;
}

export const BaseInput = forwardRef<HTMLInputElement, BaseInputProps>(
  ({ className = '', labelText, errorMessage, leftIcon, ...rest }, ref) => {
    const hasError = !!errorMessage;
    const hasIcon = !!leftIcon;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {labelText && (
          <label className="text-sm font-semibold text-text ml-1">
            {labelText}
          </label>
        )}
        <div className="relative">
          {hasIcon && (
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-muted text-[22px]">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            className={`
              w-full h-14 rounded-2xl border bg-surface text-text 
              transition-all duration-300
              focus:outline-none focus:ring-4 focus:ring-primary/10
              ${hasIcon ? 'pl-12 pr-5' : 'px-5'}
              ${hasError ? 'border-danger focus:border-danger bg-danger/5' : 'border-border focus:border-primary hover:border-primary/50'}
              ${className}
            `}
            {...rest}
          />
        </div>
        {hasError && <span className="text-xs font-medium text-danger ml-1 mt-0.5">{errorMessage}</span>}
      </div>
    );
  }
);
BaseInput.displayName = 'BaseInput';
