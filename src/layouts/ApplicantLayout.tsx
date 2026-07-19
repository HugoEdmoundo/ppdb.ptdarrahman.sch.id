import { useNavigate } from 'react-router-dom'
import { useAuth, usePermission } from '../contexts/AuthContext'
import { LogOut, LayoutDashboard } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { settingsService } from '../services/index'
import { API_BASE } from '../api/client'

export default function ApplicantLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const { isAdmin } = usePermission()
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)
  const [logoUrl, setLogoUrl] = useState('/download.png')
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadLogo = () => {
      settingsService.getAll()
        .then((settings) => {
          const logo = settings.find((s) => s.key === 'logo')?.value
          const favicon = settings.find((s) => s.key === 'favicon')?.value
          if (logo) setLogoUrl(logo)
          else if (favicon) setLogoUrl(favicon)
          else setLogoUrl('/download.png')
        })
        .catch(() => {})
    }
    loadLogo()
    const sseUrl = `${API_BASE}/companyprofile/events`
    const es = new EventSource(sseUrl)
    es.addEventListener('change', () => loadLogo())
    return () => es.close()
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleLogout() {
    await logout()
    navigate('/auth/login')
  }

  return (
    <div className="min-h-dvh bg-[var(--bg)] flex flex-col">
      {/* ── Header ── */}
      <header className="sticky top-0 z-20 bg-white/70 backdrop-blur-xl border-b border-[var(--border)]">
        <div className="flex items-center justify-between px-4 md:px-6 h-14 max-w-5xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <img src={logoUrl} alt="PTDARRAHMAN" className="w-8 h-8 object-contain shrink-0" />
            <h1 className="font-[var(--font-heading)] text-base font-bold text-[var(--text)] hidden sm:block">
              {isAdmin() ? 'Reviewer PPDB' : 'Portal Peserta PPDB'}
            </h1>
          </div>

          {/* Profile dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-[var(--accent-subtle)] transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-[var(--accent-subtle)] flex items-center justify-center text-sm font-bold text-[var(--accent)]">
                {user?.full_name?.[0] || user?.username?.[0] || 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-semibold text-[var(--text)] leading-tight">{user?.full_name || user?.username}</div>
                <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide">{user?.role_name || user?.user_type}</div>
              </div>
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white/90 backdrop-blur-xl border border-[var(--border)] rounded-xl shadow-xl overflow-hidden animate-fadeIn">
                <div className="px-4 py-3 border-b border-[var(--border)]">
                  <p className="text-sm font-semibold text-[var(--text)]">{user?.full_name || user?.username}</p>
                  <p className="text-xs text-[var(--text-muted)]">{user?.email}</p>
                </div>
                <div className="py-1">
                  {isAdmin() && (
                    <button
                      onClick={() => navigate('/admin')}
                      className="w-full px-4 py-2 text-left text-sm text-[var(--text)] hover:bg-[var(--accent-subtle)] transition-all"
                    >
                      <LayoutDashboard className="w-4 h-4 inline mr-2" />
                      Kembali ke Admin
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50 transition-all"
                  >
                    <LogOut className="w-4 h-4 inline mr-2" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Area ── */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto w-full max-w-4xl mx-auto">
        {children}
      </main>
    </div>
  )
}
