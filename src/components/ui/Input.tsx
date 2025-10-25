import React, { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'terminal' | 'neon';
  error?: boolean;
  icon?: React.ReactNode;
  label?: string;
  helperText?: string;
}

const variantClasses = {
  default: cn(
    'bg-background-secondary border border-border-primary text-text-primary',
    'placeholder:text-text-muted',
    'focus:border-accent-primary focus:ring-1 focus:ring-accent-primary',
    'hover:border-border-accent transition-colors'
  ),
  terminal: cn(
    'bg-dark-800 border border-neon-green/30 text-neon-green',
    'font-mono placeholder:text-neon-green/50',
    'focus:border-neon-green focus:ring-1 focus:ring-neon-green focus:shadow-glow-green',
    'hover:border-neon-green/60 transition-all'
  ),
  neon: cn(
    'bg-background-secondary/50 border border-accent-primary/30 text-text-primary',
    'placeholder:text-text-muted backdrop-blur-sm',
    'focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 focus:shadow-glow-cyan',
    'hover:border-accent-primary/50 transition-all'
  ),
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    variant = 'default',
    error = false,
    icon,
    label,
    helperText,
    ...props
  }, ref) => {
    const inputElement = (
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            // Base styles
            'w-full px-4 py-3 rounded-lg transition-all duration-200',
            'focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed',

            // Variant styles
            variantClasses[variant],

            // Icon padding
            icon && 'pl-10',

            // Error state
            error && 'border-accent-danger focus:border-accent-danger focus:ring-accent-danger',

            className
          )}
          {...props}
        />
      </div>
    );

    if (label || helperText) {
      return (
        <div className="space-y-2">
          {label && (
            <label className={cn(
              'block text-sm font-medium',
              variant === 'terminal' ? 'text-neon-green font-mono' : 'text-text-primary',
              error && 'text-accent-danger'
            )}>
              {label}
              {props.required && <span className="text-accent-danger ml-1">*</span>}
            </label>
          )}
          {inputElement}
          {helperText && (
            <p className={cn(
              'text-xs',
              variant === 'terminal' ? 'font-mono' : '',
              error ? 'text-accent-danger' : 'text-text-muted'
            )}>
              {helperText}
            </p>
          )}
        </div>
      );
    }

    return inputElement;
  }
);

Input.displayName = 'Input';

// Specialized input components
export const TerminalInput = forwardRef<HTMLInputElement, Omit<InputProps, 'variant'>>(
  (props, ref) => <Input ref={ref} variant="terminal" {...props} />
);

export const NeonInput = forwardRef<HTMLInputElement, Omit<InputProps, 'variant'>>(
  (props, ref) => <Input ref={ref} variant="neon" {...props} />
);

// Textarea component
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'terminal' | 'neon';
  error?: boolean;
  label?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({
    className,
    variant = 'default',
    error = false,
    label,
    helperText,
    ...props
  }, ref) => {
    const textareaElement = (
      <textarea
        ref={ref}
        className={cn(
          // Base styles
          'w-full px-4 py-3 rounded-lg transition-all duration-200 resize-none',
          'focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed',

          // Variant styles
          variantClasses[variant],

          // Error state
          error && 'border-accent-danger focus:border-accent-danger focus:ring-accent-danger',

          className
        )}
        {...props}
      />
    );

    if (label || helperText) {
      return (
        <div className="space-y-2">
          {label && (
            <label className={cn(
              'block text-sm font-medium',
              variant === 'terminal' ? 'text-neon-green font-mono' : 'text-text-primary',
              error && 'text-accent-danger'
            )}>
              {label}
              {props.required && <span className="text-accent-danger ml-1">*</span>}
            </label>
          )}
          {textareaElement}
          {helperText && (
            <p className={cn(
              'text-xs',
              variant === 'terminal' ? 'font-mono' : '',
              error ? 'text-accent-danger' : 'text-text-muted'
            )}>
              {helperText}
            </p>
          )}
        </div>
      );
    }

    return textareaElement;
  }
);

Textarea.displayName = 'Textarea';

// Search input with built-in icon
export const SearchInput = forwardRef<HTMLInputElement, Omit<InputProps, 'icon'>>(
  ({ placeholder = 'Search...', ...props }, ref) => (
    <Input
      ref={ref}
      type="search"
      placeholder={placeholder}
      icon={
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      }
      {...props}
    />
  )
);

// Password input with toggle visibility
export const PasswordInput = forwardRef<HTMLInputElement, Omit<InputProps, 'type' | 'icon'>>(
  ({ ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          {...props}
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      </div>
    );
  }
);

TerminalInput.displayName = 'TerminalInput';
NeonInput.displayName = 'NeonInput';
SearchInput.displayName = 'SearchInput';
PasswordInput.displayName = 'PasswordInput';