import { Link, Outlet, useLocation } from 'react-router-dom'
import { Menu, X, ChevronDown, MapPin, Phone, Mail, ArrowUpRight, GraduationCap } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { APP_NAME } from '../utils/constants'
import VerseStrip from '../components/shared/VerseStrip'

const navItems = [
  { href: '/', label: 'Beranda' },
  { href: '/info', label: 'Informasi' },
  { href: '/jadwal', label: 'Jadwal' },
  { href: '/kontak', label: 'Kontak' },
]

export function PublicLayout() {
  const { user } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll)
    setTimeout(() => setScrolled(window.scrollY > 80), 0)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const isHome = location.pathname === '/'
  const isTransparent = isHome && !scrolled

  return (
    <div className="min-h-dvh bg-[var(--bg)]">
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-white/80 backdrop-blur-2xl border-b border-[var(--color-border)] shadow-sm ${
          isTransparent ? 'md:-translate-y-full md:bg-transparent md:border-transparent md:shadow-none' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav role="navigation" aria-label="Navigasi utama" className="flex items-center justify-between h-16 md:h-20">
            <Link to="/" className="flex items-center gap-2 md:gap-3 flex-shrink-0 min-w-0">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                isTransparent ? 'bg-white/20' : 'bg-[var(--accent)]'
              }`}>
                <GraduationCap className={`w-5 h-5 ${isTransparent ? 'text-white' : 'text-white'}`} />
              </div>
              <div>
                <span className={`font-[var(--font-heading)] text-sm font-bold leading-tight transition-colors ${
                  isTransparent ? 'text-white' : 'text-[var(--text)]'
                }`}>{APP_NAME}</span>
                <span className={`block text-[10px] tracking-wider transition-colors ${
                  isTransparent ? 'text-white/60' : 'text-[var(--text-muted)]'
                }`}>Penerimaan Peserta Didik Baru</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                    location.pathname === item.href
                      ? isTransparent
                        ? 'text-white bg-white/15'
                        : 'text-[var(--accent)] bg-[var(--accent-subtle)]'
                      : isTransparent
                        ? 'text-white/70 hover:text-white hover:bg-white/10'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--accent-subtle)]'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {user ? (
                <Link
                  to="/applicant"
                  className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-full whitespace-nowrap transition-all ${
                    isTransparent
                      ? 'bg-white/20 text-white hover:bg-white/30'
                      : 'bg-[var(--accent)] text-white hover:bg-[#15803D] hover:shadow-md'
                  }`}
                >
                  Dashboard
                </Link>
              ) : (
                <div className="hidden md:flex items-center gap-3">
                  <Link
                    to="/auth/login"
                    className={`px-5 py-2.5 text-xs font-bold rounded-full whitespace-nowrap transition-all ${
                      isTransparent
                        ? 'text-white/70 hover:text-white hover:bg-white/10 border border-white/20'
                        : 'text-[var(--text-secondary)] hover:text-[var(--accent)] border border-[var(--border)] hover:border-[var(--accent)]'
                    }`}
                  >
                    Login
                  </Link>
                  <Link
                    to="/auth/register"
                    className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-full whitespace-nowrap transition-all ${
                      isTransparent
                        ? 'bg-white/20 text-white hover:bg-white/30'
                        : 'bg-[var(--accent)] text-white hover:bg-[#15803D] hover:shadow-md'
                    }`}
                  >
                    Daftar
                  </Link>
                </div>
              )}

              <button
                className="lg:hidden! inline-flex items-center justify-center z-50 p-3 rounded-lg hover:bg-black/5 active:bg-black/10 focus:outline-none transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Buka/tutup menu"
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? (
                  <X className={`w-6 h-6 pointer-events-none ${isTransparent && !scrolled ? 'text-white' : 'text-[var(--text)]'}`} />
                ) : (
                  <Menu className={`w-6 h-6 pointer-events-none ${isTransparent && !scrolled ? 'text-white' : 'text-[var(--text)]'}`} />
                )}
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-500 lg:hidden overflow-y-auto ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)' }}
      >
        <div className="flex flex-col items-center justify-center min-h-full py-24 px-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setMobileOpen(false)}
              className={`block py-3 text-xl sm:text-2xl font-[var(--font-display)] font-bold transition-colors ${
                location.pathname === item.href ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:text-[var(--accent)]'
              }`}
            >
              {item.label}
            </Link>
          ))}
          {!user && (
            <div className="mt-8 flex flex-col gap-3 w-full max-w-xs">
              <Link to="/auth/login" onClick={() => setMobileOpen(false)} className="block w-full text-center px-10 py-3.5 border border-[var(--border)] text-[var(--text-secondary)] text-sm font-bold rounded-full hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all">
                Login
              </Link>
              <Link to="/auth/register" onClick={() => setMobileOpen(false)} className="block w-full text-center px-10 py-3.5 bg-[var(--accent)] text-white text-sm font-bold rounded-full hover:bg-[#15803D] transition-all">
                Daftar
              </Link>
            </div>
          )}
        </div>
      </div>

      <main className="pt-16 md:pt-20">
        <Outlet />
      </main>

      <footer className="relative bg-[var(--bg-secondary)] pt-16 pb-8 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, var(--color-emerald) 0%, transparent 70%)' }}
        />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, var(--color-gold) 0%, transparent 70%)' }}
        />

        <VerseStrip className="mb-16" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid sm:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10 mb-10 sm:mb-12">
            <div className="sm:col-span-2 lg:col-span-4">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-[var(--accent)] flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-[var(--font-heading)] text-base font-bold text-[var(--text)] leading-tight tracking-tight">
                    {APP_NAME}
                  </div>
                  <div className="text-[10px] sm:text-xs tracking-wider text-[var(--text-muted)]">
                    PPDB Ar-Rahman
                  </div>
                </div>
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6 max-w-xs lg:max-w-xs">
                Sistem Penerimaan Peserta Didik Baru terintegrasi untuk Pesantren Tahfidz Qur'an dan Digital Ar-Rahman.
              </p>
            </div>

            <div className="lg:col-span-2">
              <h4 className="font-[var(--font-heading)] text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-6">
                Tautan
              </h4>
              <ul className="space-y-3">
                {[
                  { href: '/', label: 'Beranda' },
                  { href: '/info', label: 'Informasi' },
                  { href: '/jadwal', label: 'Jadwal' },
                  { href: '/kontak', label: 'Kontak' },
                ].map((l) => (
                  <li key={l.href}>
                    <Link to={l.href} className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors flex items-center gap-1 group">
                      {l.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-3">
              <h4 className="font-[var(--font-heading)] text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-6">
                Layanan
              </h4>
              <ul className="space-y-3">
                <li><Link to="/auth/register" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">Daftar PPDB</Link></li>
                <li><Link to="/auth/login" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">Login Peserta</Link></li>
                <li><Link to="/admin" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">Admin Panel</Link></li>
              </ul>
            </div>

            <div className="lg:col-span-3">
              <h4 className="font-[var(--font-heading)] text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-6">
                Kontak
              </h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-sm text-[var(--text-secondary)]">
                  <MapPin className="w-4 h-4 mt-0.5 text-[var(--accent)] flex-shrink-0" />
                  <span>Rukan Hexa Green Kalimalang, Jl. Inspeksi Kalimalang C8-C9, Jatimulya, Tambun Selatan, Bekasi 175106</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                  <Phone className="w-4 h-4 text-[var(--accent)] flex-shrink-0" />
                  <span>(021) 812-8361-2352</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                  <Mail className="w-4 h-4 text-[var(--accent)] flex-shrink-0" />
                  <span>info@ptdarrahman.sch.id</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[var(--color-border)] pt-6 sm:pt-8 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
            <p className="text-xs text-[var(--text-muted)]">
              &copy; {new Date().getFullYear()} {APP_NAME}. Hak cipta dilindungi.
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              Pesantren Tahfidz Qur'an dan Digital Arrahman
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
