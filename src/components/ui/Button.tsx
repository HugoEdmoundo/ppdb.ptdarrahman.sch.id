import { forwardRef, type ButtonHTMLAttributes } from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className = '', variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold transition-all active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed'
  const sizes: Record<string, string> = { sm: 'px-4 py-2 text-xs rounded-xl', md: 'px-5 py-2.5 text-sm rounded-xl', lg: 'px-6 py-3 text-sm rounded-xl' }
  const variants: Record<string, string> = {
    primary: 'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] shadow-md hover:shadow-lg',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-md',
    ghost: 'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--accent-subtle)]',
    outline: 'border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--accent-subtle)] hover:border-[var(--accent)]/30',
  }
  return (
    <button ref={ref} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} disabled={disabled || loading} {...props}>
      {loading && <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
      {children}
    </button>
  )
})
Button.displayName = 'Button'
