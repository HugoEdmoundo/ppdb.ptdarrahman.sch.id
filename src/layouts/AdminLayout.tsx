import { useState, useEffect, useRef } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Settings, Users, GraduationCap, CreditCard, FileText, Calendar, BarChart3, ClipboardList, ChevronDown, ChevronLeft, LogOut, Bell, Search } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/Toast'

const SIDEBAR_KEY = 'ppdb_sidebar_collapsed'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { label: 'Konfigurasi PPDB', icon: Settings, roles: ['superadmin'], children: [
    { label: 'Periode', href: '/admin/periods' }, { label: 'Gelombang', href: '/admin/waves' }, { label: 'Jenjang', href: '/admin/levels' }, { label: 'Kategori', href: '/admin/categories' }, { label: 'Alur Seleksi', href: '/admin/flows' }, { label: 'Konfigurasi', href: '/admin/wave-configs' },
  ]},
  { label: 'Pendaftar', icon: Users, children: [{ label: 'Daftar', href: '/admin/applicants' }, { label: 'Verifikasi Dokumen', href: '/admin/documents' }] },
  { label: 'Seleksi', icon: GraduationCap, children: [{ label: 'Jadwal Tes', href: '/admin/test-sessions' }, { label: 'Nilai', href: '/admin/test-scores' }, { label: 'Kelulusan', href: '/admin/graduations' }] },
  { label: 'Keuangan', icon: CreditCard, roles: ['superadmin', 'admin_keuangan'], children: [{ label: 'Pembayaran', href: '/admin/payments' }, { label: 'Invoice', href: '/admin/invoices' }, { label: 'Diskon', href: '/admin/discounts' }] },
  { label: 'MOU', icon: FileText, href: '/admin/mou' },
  { label: 'Daftar Ulang', icon: ClipboardList, href: '/admin/re-registrations' },
  { label: 'MPLS', icon: Calendar, href: '/admin/mpls' },
  { label: 'Laporan', icon: BarChart3, href: '/admin/reports' },
  { label: 'Pengaturan', icon: Settings, roles: ['superadmin'], children: [{ label: 'Users', href: '/admin/users' }, { label: 'Roles', href: '/admin/roles' }, { label: 'Notifikasi', href: '/admin/notifications' }] },
]

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(SIDEBAR_KEY) === 'true')
  const [profileOpen, setProfileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setSidebarOpen(false) }, [location.pathname])
  useEffect(() => { localStorage.setItem(SIDEBAR_KEY, String(collapsed)) }, [collapsed])
  useEffect(() => {
    function handler(e: MouseEvent) { if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false) }
    document.addEventListener('mousedown', handler); return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function handleLogout() { await logout(); toast('success', 'Berhasil logout'); navigate('/auth/login') }

  const filtered = navItems.filter(i => !i.roles || i.roles.includes(user?.user_type || ''))
  const initials = (user?.full_name || user?.username || 'A').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="min-h-dvh flex bg-[var(--bg)]">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-50 lg:hidden"><div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} /><div className="relative w-60 h-full bg-white/80 backdrop-blur-xl border-r border-[var(--border)] overflow-y-auto animate-slideInLeft"><SidebarContent collapsed={false} filtered={filtered} currentPath={location.pathname} /></div></div>}

      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col fixed md:sticky top-0 left-0 z-40 h-dvh bg-white/80 backdrop-blur-xl border-r border-[var(--border)] transition-all duration-300 shrink-0 ${collapsed ? 'w-16' : 'w-60'}`}>
        <SidebarContent collapsed={collapsed} filtered={filtered} currentPath={location.pathname} />
        <button onClick={() => setCollapsed(!collapsed)} className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg bg-white border border-[var(--border)] shadow-sm flex items-center justify-center hover:bg-[var(--accent-subtle)] transition-all">
          <ChevronLeft className={`w-3 h-3 text-[var(--text-muted)] transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 h-14 bg-white/70 backdrop-blur-xl border-b border-[var(--border)]">
          <div className="flex items-center justify-between h-full px-4 md:px-6">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-[var(--accent-subtle)]"><Search className="w-4 h-4 text-[var(--text-secondary)]" /></button>
              <h1 className="font-[var(--font-heading)] text-base font-bold text-[var(--text)]">Dashboard</h1>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-xl hover:bg-[var(--accent-subtle)] relative"><Bell className="w-4 h-4 text-[var(--text-secondary)]" /><span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" /></button>
              <div className="h-6 w-px bg-[var(--border)]" />
              <div className="relative" ref={profileRef}>
                <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-[var(--accent-subtle)] transition-colors">
                  <div className="w-8 h-8 rounded-full bg-[var(--accent-subtle)] flex items-center justify-center text-sm font-bold text-[var(--accent)]">{initials}</div>
                  <div className="hidden sm:block text-left"><p className="text-sm font-semibold text-[var(--text)] leading-tight">{user?.full_name || user?.username}</p><p className="text-[11px] text-[var(--text-muted)]">{user?.user_type}</p></div>
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white/90 backdrop-blur-xl border border-[var(--border)] rounded-xl shadow-xl animate-fadeIn z-50">
                    <div className="px-4 py-3 border-b border-[var(--border)]"><p className="text-sm font-bold text-[var(--text)]">{user?.full_name || user?.username}</p><p className="text-xs text-[var(--text-muted)]">{user?.email}</p></div>
                    <button onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"><LogOut className="w-4 h-4" /> Logout</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <div className="space-y-6 animate-fadeIn"><Outlet /></div>
        </main>
      </div>
    </div>
  )
}

function SidebarContent({ collapsed, filtered, currentPath }: { collapsed: boolean; filtered: typeof navItems; currentPath: string }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  useEffect(() => {
    // Auto-expand parent yang child-nya active
    const updates: Record<string, boolean> = {}
    filtered.forEach(item => {
      if (item.children) {
        updates[item.label] = !!item.children.some(c => currentPath.startsWith(c.href))
      }
    })
    setExpanded(prev => ({ ...prev, ...updates }))
  }, [currentPath])

  function toggle(label: string) {
    setExpanded(prev => ({ ...prev, [label]: !prev[label] }))
  }

  return (
    <>
      <div className={collapsed ? 'flex justify-center px-2 py-3' : 'px-5 py-4'}>
        {collapsed ? (
          <div className="w-9 h-9 rounded-lg bg-[var(--accent)] flex items-center justify-center"><GraduationCap className="w-5 h-5 text-white" /></div>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[var(--accent)] flex items-center justify-center shrink-0"><GraduationCap className="w-5 h-5 text-white" /></div>
            <div className="min-w-0"><p className="text-sm font-bold text-[var(--text)] truncate font-[var(--font-heading)]">PPDB</p><p className="text-[11px] text-[var(--text-muted)]">Ar-Rahman</p></div>
          </div>
        )}
      </div>
      <nav className="sidebar-nav flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {filtered.map(item => {
          const Icon = item.icon
          const active = item.href ? currentPath === item.href || currentPath.startsWith(item.href + '/') : !!item.children?.some(c => currentPath.startsWith(c.href))
          if (item.children) {
            const isExpanded = expanded[item.label]
            return (
              <div key={item.label}>
                <button onClick={() => toggle(item.label)} className={`w-full flex items-center gap-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${active ? 'bg-[var(--accent-subtle)] text-[var(--accent)] shadow-sm' : 'text-[var(--text-secondary)] hover:bg-[var(--accent-subtle)] hover:text-[var(--text)]'} ${collapsed ? 'justify-center p-2' : 'px-3 py-2.5'}`} title={collapsed ? item.label : undefined}>
                  <Icon className="w-4 h-4 shrink-0" />
                  {!collapsed && <><span className="flex-1 text-left">{item.label}</span><ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} /></>}
                </button>
                {!collapsed && isExpanded && (
                  <div className="ml-8 mt-0.5 space-y-0.5">{item.children.map(c => (<Link key={c.href} to={c.href} className={`block px-3 py-2 rounded-lg text-xs transition-colors ${currentPath === c.href ? 'text-[var(--accent)] bg-[var(--accent-subtle)] font-semibold' : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--accent-subtle)]'}`}>{c.label}</Link>))}</div>
                )}
              </div>
            )
          }
          return <Link key={item.href} to={item.href!} className={`flex items-center gap-3 rounded-xl text-sm font-medium transition-colors ${active ? 'bg-[var(--accent-subtle)] text-[var(--accent)] shadow-sm' : 'text-[var(--text-secondary)] hover:bg-[var(--accent-subtle)] hover:text-[var(--text)]'} ${collapsed ? 'justify-center p-2' : 'px-3 py-2.5'}`} title={collapsed ? item.label : undefined}><Icon className="w-4 h-4 shrink-0" />{!collapsed && <span>{item.label}</span>}</Link>
        })}
      </nav>
    </>
  )
}
