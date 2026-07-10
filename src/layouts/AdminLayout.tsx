import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  LayoutDashboard, Settings, Users, GraduationCap, CreditCard, FileText,
  BarChart3, ChevronDown, ChevronLeft, Menu, LogOut, Bell,
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { settingsService } from '../services/index'
import { API_BASE } from '../api/client'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { label: 'Konfigurasi PPDB', icon: Settings, roles: ['superadmin'], children: [
    { label: 'Periode & Gelombang', href: '/admin/periods' }, { label: 'Jenjang, Kategori & Alur', href: '/admin/levels' }, { label: 'Konfigurasi Gelombang', href: '/admin/wave-configs' },
  ]},
  { label: 'Pendaftar', icon: Users, children: [{ label: 'Daftar', href: '/admin/applicants' }, { label: 'Verifikasi Dokumen', href: '/admin/documents' }] },
  { label: 'Seleksi', icon: GraduationCap, children: [{ label: 'Jadwal Tes', href: '/admin/test-sessions' }, { label: 'Nilai', href: '/admin/test-scores' }, { label: 'Kelulusan', href: '/admin/graduations' }] },
  { label: 'Keuangan', icon: CreditCard, roles: ['superadmin', 'admin_keuangan'], children: [{ label: 'Pembayaran', href: '/admin/payments' }, { label: 'Invoice', href: '/admin/invoices' }, { label: 'Diskon', href: '/admin/discounts' }] },
  { label: 'Post-Seleksi', icon: FileText, children: [{ label: 'MOU', href: '/admin/mou' }, { label: 'Daftar Ulang', href: '/admin/re-registrations' }, { label: 'MPLS', href: '/admin/mpls' }] },
  { label: 'Laporan', icon: BarChart3, href: '/admin/reports' },
  { label: 'Notifikasi', icon: Bell, href: '/admin/notifications' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('ppdb_collapsed') === 'true')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [logoUrl, setLogoUrl] = useState('/download.png')
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

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
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  // Auto-expand parent yang child-nya active
  useEffect(() => {
    const updates: Record<string, boolean> = {}
    filtered.forEach(item => {
      if (item.children) {
        updates[item.label] = !!item.children.some(c => location.pathname.startsWith(c.href))
      }
    })
    setExpanded(prev => ({ ...prev, ...updates }))
  }, [location.pathname])

  async function handleLogout() {
    await logout()
    navigate('/auth/login')
  }

  const toggleCollapse = () => {
    setCollapsed(p => { const v = !p; localStorage.setItem('ppdb_collapsed', String(v)); return v })
  }

  function toggleExpand(label: string) {
    setExpanded(prev => ({ ...prev, [label]: !prev[label] }))
  }

  const filtered = navItems.filter(i => !i.roles || i.roles.includes(user?.user_type || ''))

  function isActive(item: typeof navItems[number]): boolean {
    if (item.href) return location.pathname === item.href || location.pathname.startsWith(item.href + '/')
    return !!item.children?.some(c => location.pathname.startsWith(c.href))
  }

  return (
    <div className="min-h-dvh bg-[var(--bg)] flex">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/30 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-dvh bg-white/80 backdrop-blur-xl border-r border-[var(--border)] flex flex-col transition-all duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${collapsed ? 'w-16' : 'w-60'}`}
      >
        {/* Header */}
        <div className={`flex items-center border-b border-[var(--border)] relative ${collapsed ? 'justify-center px-2 py-3' : 'px-5 py-4'}`}>
          {collapsed ? (
            <img src={logoUrl} alt="PTDARRAHMAN" className="w-9 h-9 object-contain" />
          ) : (
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <img src={logoUrl} alt="PTDARRAHMAN" className="w-9 h-9 object-contain shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-bold text-[var(--text)] truncate font-[var(--font-heading)]">PTDARRAHMAN</div>
                <div className="text-[11px] text-[var(--text-muted)]">PPDB Admin</div>
              </div>
            </div>
          )}
          <button
            onClick={toggleCollapse}
            className="hidden md:flex items-center justify-center w-6 h-6 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--accent-subtle)] transition-all absolute -right-3 top-1/2 -translate-y-1/2 bg-white border border-[var(--border)] shadow-sm"
          >
            <ChevronLeft className={`w-3.5 h-3.5 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {filtered.map((item) => {
            const Icon = item.icon
            const active = isActive(item)
            if (item.children) {
              const isExpanded = expanded[item.label]
              return (
                <div key={item.label}>
                  <button
                    onClick={() => toggleExpand(item.label)}
                    className={`w-full flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
                      collapsed ? 'justify-center p-2' : 'px-3 py-2.5'
                    } ${
                      active
                        ? 'bg-[var(--accent-subtle)] text-[var(--accent)] shadow-sm'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--accent-subtle)] hover:text-[var(--text)]'
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left truncate">{item.label}</span>
                        <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                      </>
                    )}
                  </button>
                  {!collapsed && isExpanded && (
                    <div className="ml-8 mt-0.5 space-y-0.5">
                      {item.children.map(c => (
                        <NavLink
                          key={c.href}
                          to={c.href}
                          className={`block px-3 py-2 rounded-lg text-xs transition-all ${
                            location.pathname === c.href
                              ? 'text-[var(--accent)] bg-[var(--accent-subtle)] font-semibold'
                              : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--accent-subtle)]'
                          }`}
                        >
                          {c.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              )
            }
            return (
              <NavLink
                key={item.href}
                to={item.href!}
                className={`flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                  collapsed ? 'justify-center p-2' : 'px-3 py-2.5'
                } ${
                  active
                    ? 'bg-[var(--accent-subtle)] text-[var(--accent)] shadow-sm'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--accent-subtle)] hover:text-[var(--text)]'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            )
          })}
        </nav>

      </aside>

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white/70 backdrop-blur-xl border-b border-[var(--border)]">
          <div className="flex items-center justify-between px-4 md:px-6 h-14">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden p-2 -ml-2 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--accent-subtle)] transition-all"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="font-[var(--font-heading)] text-base font-bold text-[var(--text)] hidden sm:block">
                Admin PPDB
              </h1>
            </div>

            {/* Profile dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-[var(--accent-subtle)] transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-[var(--accent-subtle)] flex items-center justify-center text-sm font-bold text-[var(--accent)]">
                  {user?.full_name?.[0] || user?.username?.[0] || 'A'}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-semibold text-[var(--text)] leading-tight">{user?.full_name || user?.username}</div>
                  <div className="text-[11px] text-[var(--text-muted)]">Admin</div>
                </div>
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white/90 backdrop-blur-xl border border-[var(--border)] rounded-xl shadow-xl overflow-hidden animate-fadeIn">
                  <div className="px-4 py-3 border-b border-[var(--border)]">
                    <p className="text-sm font-semibold text-[var(--text)]">{user?.full_name || user?.username}</p>
                    <p className="text-xs text-[var(--text-muted)]">{user?.email}</p>
                  </div>
                  <div className="py-1">
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

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
