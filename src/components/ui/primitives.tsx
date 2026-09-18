import * as React from 'react'
import { cx } from '@/lib/cx'

/* ------------------------------------------------------------------ Card */
export function Card({
  className,
  inset = true,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }) {
  return (
    <div
      className={cx(
        'rounded-[--radius-card] bg-surface shadow-[--shadow-card] ring-1 ring-line',
        inset && 'p-4',
        className,
      )}
      {...props}
    />
  )
}

/* ------------------------------------------------------------- Section */
export function Section({
  title,
  action,
  children,
  className,
}: {
  title?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cx('mt-8 first:mt-0', className)}>
      {(title || action) && (
        <header className="gutter mb-3 flex items-baseline justify-between">
          {title && (
            <h2 className="text-[13px] font-medium uppercase tracking-[0.08em] text-ink-faint">
              {title}
            </h2>
          )}
          {action}
        </header>
      )}
      {children}
    </section>
  )
}

/* -------------------------------------------------------------- Button */
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'accent'
  size?: 'md' | 'lg'
}

export function Button({
  variant = 'secondary',
  size = 'md',
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-[--radius-pill] font-medium',
        'transition-[transform,background-color,opacity] duration-150 ease-[--ease-out-soft]',
        'active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40',
        size === 'md' ? 'h-10 px-4 text-[15px]' : 'h-12 px-6 text-[16px]',
        variant === 'primary' && 'bg-ink text-paper hover:bg-ink/90',
        variant === 'accent' && 'bg-accent text-white hover:bg-accent-ink',
        variant === 'secondary' && 'bg-sunken text-ink hover:bg-line',
        variant === 'ghost' && 'text-ink-muted hover:bg-sunken',
        className,
      )}
      {...props}
    />
  )
}

/* ----------------------------------------------------------------- Pill */
export function Pill({
  tone = 'neutral',
  children,
  className,
}: {
  tone?: 'neutral' | 'accent' | 'warn' | 'car'
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded-[--radius-pill] px-2 py-0.5 text-[12px] font-medium',
        tone === 'neutral' && 'bg-sunken text-ink-muted',
        tone === 'accent' && 'bg-accent-soft text-accent-ink',
        tone === 'warn' && 'bg-warn-soft text-warn',
        tone === 'car' && 'bg-car-soft text-car',
        className,
      )}
    >
      {children}
    </span>
  )
}

/* ----------------------------------------------------------- Row / List */
export function List({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cx('bg-surface ring-1 ring-line', className)}>
      <div className="divide-y divide-line">{children}</div>
    </div>
  )
}

export function Row({
  leading,
  title,
  subtitle,
  trailing,
  onClick,
  className,
}: {
  leading?: React.ReactNode
  title: React.ReactNode
  subtitle?: React.ReactNode
  trailing?: React.ReactNode
  onClick?: () => void
  className?: string
}) {
  const Tag = (onClick ? 'button' : 'div') as 'button'
  return (
    <Tag
      onClick={onClick}
      className={cx(
        'flex w-full items-center gap-3 px-5 py-3.5 text-left',
        onClick && 'transition-colors duration-100 active:bg-sunken',
        className,
      )}
    >
      {leading}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-medium text-ink">{title}</span>
        {subtitle && (
          <span className="mt-0.5 block truncate text-[13px] text-ink-muted">{subtitle}</span>
        )}
      </span>
      {trailing}
    </Tag>
  )
}

/* -------------------------------------------------------------- Divider */
export const Divider = ({ className }: { className?: string }) => (
  <div className={cx('h-px w-full bg-line', className)} />
)
