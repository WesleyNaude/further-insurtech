import type { LucideIcon } from 'lucide-react'

export function Empty({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: LucideIcon
  title: string
  body: string
  action?: React.ReactNode
}) {
  return (
    <div className="gutter flex flex-col items-center py-16 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-sunken text-ink-faint">
        <Icon size={20} strokeWidth={1.7} />
      </span>
      <h2 className="mt-4 text-[16px] font-medium tracking-[-0.015em] text-ink">{title}</h2>
      <p className="mt-1.5 max-w-[30ch] text-[14px] leading-[1.5] text-ink-muted">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
