import { forwardRef, ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type Size = 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const sizeMap: Record<Size, string> = {
  md: 'h-11 px-5 text-[15px]',
  lg: 'h-[52px] px-6 text-[16px]',
};

const variantMap: Record<Variant, string> = {
  primary: 'bg-primary text-primary-fg hover:bg-primary-hover shadow-sm',
  secondary: 'border border-border-strong bg-transparent text-ink hover:bg-surface-2',
  ghost: 'bg-transparent text-ink-muted hover:text-ink',
  destructive: 'border border-danger bg-danger-soft text-danger hover:opacity-85',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, className = '', children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-md font-sans font-semibold no-underline transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${sizeMap[size]} ${variantMap[variant]} ${className}`}
      {...rest}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
});

export function Spinner({ className = '' }: { className?: string }) {
  return (
    <svg className={`animate-spinSlow ${className}`} width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function Card({ className = '', children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-lg border border-border bg-surface p-6 shadow-sm ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className = '', ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      className={`h-[46px] w-full rounded-md border border-border-strong bg-bg px-3.5 font-sans text-[15px] text-ink placeholder:text-ink-subtle focus:border-primary ${className}`}
      {...rest}
    />
  );
});

export function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-semibold text-ink-muted">
      {children}
    </label>
  );
}

type BadgeTone = 'gold' | 'primary' | 'neutral' | 'success' | 'danger';

const badgeMap: Record<BadgeTone, string> = {
  gold: 'bg-spotlight-soft text-spotlight-fg',
  primary: 'bg-primary-soft text-primary',
  neutral: 'bg-surface-2 text-ink-muted',
  success: 'bg-[color-mix(in_srgb,var(--success)_16%,var(--surface))] text-success',
  danger: 'bg-danger-soft text-danger',
};

export function Badge({
  tone = 'neutral',
  children,
  className = '',
}: {
  tone?: BadgeTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold ${badgeMap[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
