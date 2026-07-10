import type { ReactNode } from 'react'

export function Card({ children, className = '', header }: { children: ReactNode; className?: string; header?: ReactNode }) {
  return (
    <div className={`bg-white/60 backdrop-blur-sm rounded-2xl border border-[var(--border)] ${header ? '' : 'p-6'} ${className}`}>
      {header && <div className="px-6 py-4 border-b border-[var(--border)]">{header}</div>}
      {header ? <div className="p-6">{children}</div> : children}
    </div>
  )
}
