import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../components/Toast'
import { ShieldCheck, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const { login, user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { if (user) { const dest = ['superadmin', 'admin_ppdb', 'admin_keuangan', 'penguji'].includes(user.user_type) ? '/admin' : '/applicant'; navigate(dest, { replace: true }) } }, [user, navigate])
  if (user) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(''); setLoading(true)
    try { await login(username, password); toast('success', 'Login berhasil') }
    catch (err: any) { setError(err.message || 'Login gagal') }
    finally { setLoading(false) }
  }

  return (
    <div className="relative min-h-dvh flex items-center justify-center overflow-hidden bg-[var(--bg)] px-4 py-8">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-subtle)] via-transparent to-[var(--accent-subtle)] opacity-60" />
      <div className="absolute -top-24 -right-24 w-[300px] h-[300px] rounded-full bg-[var(--accent-subtle)] opacity-20 blur-3xl" />
      <div className="absolute -bottom-28 -left-28 w-[350px] h-[350px] rounded-full bg-[var(--accent-subtle)] opacity-20 blur-3xl" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-b from-[var(--accent)]/5 via-transparent to-[var(--accent)]/5 rounded-3xl blur-xl" />
          <div className="relative bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl shadow-xl p-8 md:p-10 text-center">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/30 to-transparent" />

            {/* Icon */}
            <div className="mx-auto mb-5 w-14 h-14 rounded-2xl bg-[var(--accent-subtle)] ring-1 ring-[var(--accent)]/10 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-[var(--accent)]" />
            </div>

            <h1 className="font-[var(--font-display)] text-2xl font-bold text-[var(--text)] mb-1">
              Login PPDB
            </h1>
            <p className="text-xs text-[var(--text-muted)] mb-6">
              PPDB Ar-Rahman
            </p>

            {error && (
              <div className="mb-5 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-left">
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field"
                  placeholder="Masukkan username"
                  required
                  autoFocus
                  autoComplete="username"
                />
              </div>

              <div className="text-left">
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pr-10"
                    placeholder="Masukkan password"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                    tabIndex={-1}
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !username.trim() || !password.trim()}
                className="w-full py-3 rounded-xl bg-[var(--accent)] text-white font-semibold text-sm hover:bg-[var(--accent-hover)] shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Memproses...
                  </span>
                ) : 'Masuk'}
              </button>
            </form>

            <p className="mt-4 text-xs text-[var(--text-muted)]">Belum punya akun? <Link to="/auth/register" className="text-[var(--accent)] font-semibold hover:underline">Daftar</Link></p>
          </div>
        </div>
      </div>
    </div>
  )
}
