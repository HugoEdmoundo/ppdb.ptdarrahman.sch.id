import { useState, useEffect, useRef } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { BarChart3, User, FileText, CreditCard, Calendar, GraduationCap, FileDown, ClipboardList, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/Toast'

const tabs = [
  { label: 'Dashboard', href: '/applicant', icon: BarChart3 },
  { label: 'Profil', href: '/applicant/profile', icon: User },
  { label: 'Dokumen', href: '/applicant/documents', icon: FileText },
  { label: 'Pembayaran', href: '/applicant/payments', icon: CreditCard },
  { label: 'Tes', href: '/applicant/tests', icon: Calendar },
  { label: 'Hasil', href: '/applicant/results', icon: GraduationCap },
  { label: 'MOU', href: '/applicant/mou', icon: FileDown },
  { label: 'Daftar Ulang', href: '/applicant/re-registration', icon: ClipboardList },
]

export function ApplicantLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function h(e: MouseEvent) { if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false) }
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h)
  }, [])

  async function handleLogout() { await logout(); toast('success', 'Logout berhasil'); navigate('/auth/login') }
  const initials = (user?.full_name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="min-h-dvh bg-[var(--bg)]">
      <header className="sticky top-0 z-30 h-14 bg-white/70 backdrop-blur-xl border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-full">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center"><span className="text-white text-xs font-bold">AR</span></div>
            <span className="font-[var(--font-heading)] text-sm font-bold text-[var(--text)]">PPDB Ar-Rahman</span>
          </Link>
          <div className="relative" ref={profileRef}>
            <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-[var(--accent-subtle)] transition-colors">
              <div className="w-8 h-8 rounded-full bg-[var(--accent-subtle)] flex items-center justify-center text-xs font-bold text-[var(--accent)]">{initials}</div>
              <span className="hidden sm:block text-sm font-semibold text-[var(--text)]">{user?.full_name || 'User'}</span>
            </button>
            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white/90 backdrop-blur-xl border border-[var(--border)] rounded-xl shadow-xl animate-fadeIn z-50">
                <button onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"><LogOut className="w-4 h-4" /> Logout</button>
              </div>
            )}
          </div>
        </div>
      </header>
      <nav className="bg-white/50 border-b border-[var(--border)] overflow-x-auto">
        <div className="max-w-5xl mx-auto px-4 flex gap-1">
          {tabs.map(t => {
            const Icon = t.icon; const active = location.pathname === t.href
            return <Link key={t.href} to={t.href} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${active ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--border)]'}`}><Icon className="w-4 h-4" />{t.label}</Link>
          })}
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-4 py-6"><div className="space-y-6 animate-fadeIn"><Outlet /></div></main>
    </div>
  )
}
