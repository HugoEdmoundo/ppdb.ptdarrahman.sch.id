export function Spinner({ className = '', size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const s: Record<string, string> = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }
  return <div className={`flex items-center justify-center ${className}`}><div className={`${s[size]} border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin`} /></div>
}
