import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../components/Toast'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Alert } from '../../components/ui/Alert'
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
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8"><h1 className="text-2xl font-bold">Daftar PPDB</h1><p className="text-gray-500 mt-2">Buat akun PPDB Ar-Rahman</p></div>
        <div className="bg-white rounded-2xl shadow-sm border border-[var(--border)] p-6">
          {error && <Alert type="error" className="mb-4">{error}</Alert>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Nama Lengkap" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} required />
            <Input label="Username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
            <Input label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            <Input label="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            <Button type="submit" className="w-full" loading={loading}>Daftar</Button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-500">Sudah punya akun? <Link to="/auth/login" className="text-[var(--accent)] font-medium hover:underline">Login</Link></p>
        </div>
      </div>
    </div>
  )
}
