import { Link, Outlet } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { APP_NAME } from '../utils/constants'

export function PublicLayout() {
  const [open, setOpen] = useState(false)
  const { user } = useAuth()
  return (
    <div className="min-h-dvh bg-[var(--bg)]">
      <nav className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[var(--accent)] flex items-center justify-center"><span className="text-white text-sm font-bold">AR</span></div>
            <span className="font-[var(--font-heading)] text-sm font-bold text-[var(--text)]">{APP_NAME}</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link to="/info" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors">Info</Link>
            <Link to="/jadwal" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors">Jadwal</Link>
            {user ? (
              <Link to="/applicant" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:bg-[var(--accent-hover)] shadow-md hover:shadow-lg transition-all active:scale-[0.97]">Dashboard</Link>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/auth/login" className="px-4 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] text-sm font-semibold hover:bg-[var(--accent-subtle)] transition-all">Login</Link>
                <Link to="/auth/register" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:bg-[var(--accent-hover)] shadow-md hover:shadow-lg transition-all active:scale-[0.97]">Daftar</Link>
              </div>
            )}
          </div>
          <button className="md:hidden p-2 rounded-xl hover:bg-[var(--accent-subtle)]" onClick={() => setOpen(!open)}>{open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
        </div>
        {open && (
          <div className="md:hidden py-4 px-4 border-t border-[var(--border)] space-y-3">
            <Link to="/info" className="block text-sm text-[var(--text-secondary)] py-2" onClick={() => setOpen(false)}>Info</Link>
            <Link to="/jadwal" className="block text-sm text-[var(--text-secondary)] py-2" onClick={() => setOpen(false)}>Jadwal</Link>
            {!user && <div className="flex gap-2 pt-2"><Link to="/auth/login" className="flex-1"><span className="block text-center px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm font-semibold">Login</span></Link><Link to="/auth/register" className="flex-1"><span className="block text-center px-4 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold">Daftar</span></Link></div>}
          </div>
        )}
      </nav>
      <Outlet />
      <footer className="border-t border-[var(--border)] mt-16"><div className="max-w-7xl mx-auto px-4 py-8 text-center text-xs text-[var(--text-muted)]">&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</div></footer>
    </div>
  )
}
