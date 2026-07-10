import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../components/Toast'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Alert } from '../../components/ui/Alert'
import { GraduationCap } from 'lucide-react'
import * as api from '../../api/client'
export default function RegisterPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', full_name: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  useEffect(() => { if (user) navigate('/applicant', { replace: true }) }, [user, navigate])
  if (user) return null
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError('')
    if (!form.username || !form.email || !form.full_name || !form.password) { setError('Semua field wajib diisi'); return }
    setLoading(true)
    try {
      await api.apiFetch('/auth/register-applicant', { method: 'POST', body: JSON.stringify(form) })
      toast('success', 'Pendaftaran berhasil! Silakan login.')
      navigate('/auth/login')
    } catch (err: any) { setError(err.message || 'Gagal') }
    finally { setLoading(false) }
  }
  return (
    <div className="relative min-h-dvh flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#F7F5F0] via-white to-[#F0EDE4] px-4 py-8">
      <div className="absolute inset-0 bg-pattern-dots opacity-[0.1] pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-[300px] h-[300px] rounded-full opacity-[0.04] pointer-events-none"
        style={{ background: 'radial-gradient(circle, var(--color-emerald) 0%, transparent 70%)' }}
      />
      <div className="absolute -bottom-28 -left-28 w-[350px] h-[350px] rounded-full opacity-[0.03] pointer-events-none"
        style={{ background: 'radial-gradient(circle, var(--color-gold) 0%, transparent 70%)' }}
      />
      <div className="absolute top-0 left-0 right-0 verse-strip" />

      <div className="relative z-10 w-full max-w-md">
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-b from-[var(--accent)]/5 via-transparent to-[var(--accent)]/5 rounded-3xl blur-xl" />
          <div className="relative bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl shadow-xl p-8 md:p-10">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/30 to-transparent" />
            <div className="text-center mb-6">
              <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-[var(--accent-subtle)] ring-1 ring-[var(--accent)]/10 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-[var(--accent)]" />
              </div>
              <h1 className="font-[var(--font-display)] text-2xl font-bold text-[var(--text)]">Daftar PPDB</h1>
              <p className="text-xs text-[var(--text-muted)] mt-1">Buat akun PPDB Ar-Rahman</p>
            </div>
            {error && <Alert type="error" className="mb-4">{error}</Alert>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Nama Lengkap" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} required />
              <Input label="Username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
              <Input label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              <Input label="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
              <Button type="submit" className="w-full" loading={loading}>Daftar</Button>
            </form>
            <p className="mt-4 text-center text-xs text-[var(--text-muted)]">Sudah punya akun? <Link to="/auth/login" className="text-[var(--accent)] font-semibold hover:underline">Login</Link></p>
          </div>
        </div>
      </div>
    </div>
  )
}
