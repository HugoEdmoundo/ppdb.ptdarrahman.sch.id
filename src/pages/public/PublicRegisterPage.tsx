import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Spinner, Input } from '../../components/ui'
import { useToast } from '../../components/Toast'
import * as api from '../../api/client'
import { ChevronRight, ChevronLeft, GraduationCap, Tags, User, CheckCircle } from 'lucide-react'

interface WaveConfigOption {
  id: string; wave_name: string; wave_number: number; wave_start: string; wave_end: string
  level_name: string; level_code: string; level_desc: string
  category_name: string; category_code: string; category_desc: string
  period_name: string; academic_year: string; period_desc: string
  quota: number; payment_stage_count: number
}

interface GroupedLevel {
  name: string; code: string; desc: string
  categories: GroupedCategory[]
}

interface GroupedCategory {
  name: string; code: string; desc: string
  config: WaveConfigOption
}

export default function PublicRegisterPage() {
  const [step, setStep] = useState(1)
  const [levels, setLevels] = useState<GroupedLevel[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLevel, setSelectedLevel] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedConfig, setSelectedConfig] = useState<WaveConfigOption | null>(null)
  const [form, setForm] = useState({ username: '', email: '', full_name: '', password: '', confirmPassword: '' })
  const [registering, setRegistering] = useState(false)
  const [error, setError] = useState('')
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    fetch(`${api.API_BASE}/ppdb/public/wave-configs`)
      .then(res => res.json())
      .then((data: WaveConfigOption[]) => {
        const lvlMap = new Map<string, GroupedLevel>()
        data.forEach(c => {
          if (!lvlMap.has(c.level_code)) {
            lvlMap.set(c.level_code, { name: c.level_name, code: c.level_code, desc: c.level_desc, categories: [] })
          }
          lvlMap.get(c.level_code)!.categories.push({ name: c.category_name, code: c.category_code, desc: c.category_desc, config: c })
        })
        setLevels([...lvlMap.values()])
      })
      .catch(() => toast('error', 'Gagal memuat data PPDB'))
      .finally(() => setLoading(false))
  }, [])

  function selectLevel(code: string) {
    setSelectedLevel(code)
    setSelectedCategory('')
    setSelectedConfig(null)
  }

  function selectCategory(code: string) {
    setSelectedCategory(code)
    const lvl = levels.find(l => l.code === selectedLevel)
    const cat = lvl?.categories.find(c => c.code === code)
    setSelectedConfig(cat?.config || null)
  }

  function goNext() {
    if (step === 1 && !selectedLevel) return toast('warning', 'Pilih jenjang terlebih dahulu')
    if (step === 1 && !selectedCategory) return toast('warning', 'Pilih kategori terlebih dahulu')
    setStep(step + 1)
    setError('')
  }

  function goBack() { setStep(step - 1); setError('') }

  async function handleRegister() {
    if (!form.username || !form.email || !form.full_name || !form.password) return toast('warning', 'Semua field wajib diisi')
    if (form.password !== form.confirmPassword) return toast('warning', 'Password tidak cocok')
    if (form.password.length < 8) return toast('warning', 'Password minimal 8 karakter')
    setRegistering(true)
    setError('')
    try {
      await api.apiFetch('/auth/register-applicant', {
        method: 'POST',
        body: JSON.stringify({ username: form.username, email: form.email, full_name: form.full_name, password: form.password }),
      })
      toast('success', 'Akun berhasil dibuat! Silakan login.')
      navigate('/auth/login?registered=true')
    } catch (e: any) {
      setError(e.message || 'Gagal mendaftar')
    } finally {
      setRegistering(false)
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  const steps = [
    { num: 1, label: 'Pilihan PPDB' },
    { num: 2, label: 'Buat Akun' },
  ]

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 animate-fadeIn">
      <div className="flex items-center justify-center gap-3 mb-10">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              step >= s.num ? 'bg-[var(--accent)] text-white' : 'bg-gray-100 text-[var(--text-muted)]'
            }`}>
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">{s.num}</span>
              {s.label}
            </div>
            {i < steps.length - 1 && <ChevronRight className="w-4 h-4 text-[var(--border)]" />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <Card className="p-6 text-center">
            <GraduationCap className="w-12 h-12 mx-auto mb-3 text-[var(--accent)]" />
            <h2 className="text-lg font-bold text-[var(--text)]">Pilih Jenjang & Kategori</h2>
            <p className="text-sm text-[var(--text-muted)] mt-1">Pilih jenjang pendidikan dan kategori pendaftaran yang tersedia</p>
          </Card>

          {selectedConfig && (
            <div className="p-4 rounded-2xl bg-[var(--accent-subtle)] border border-[var(--accent)]/20">
              <h3 className="font-semibold text-sm text-[var(--accent)]">Rincian Pilihan</h3>
              <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-[var(--text-secondary)]">
                <div><span className="text-[var(--text-muted)]">Periode:</span> {selectedConfig.period_name} ({selectedConfig.academic_year})</div>
                <div><span className="text-[var(--text-muted)]">Gelombang:</span> {selectedConfig.wave_name} (Gel. {selectedConfig.wave_number})</div>
                <div><span className="text-[var(--text-muted)]">Jenjang:</span> {selectedConfig.level_name}</div>
                <div><span className="text-[var(--text-muted)]">Kategori:</span> {selectedConfig.category_name}</div>
                <div><span className="text-[var(--text-muted)]">Kuota:</span> {selectedConfig.quota || 'Tidak terbatas'}</div>
                <div><span className="text-[var(--text-muted)]">Tanggal:</span> {selectedConfig.wave_start?.slice(0, 10)} – {selectedConfig.wave_end?.slice(0, 10)}</div>
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-3">
            {levels.map(lvl => (
              <div key={lvl.code}
                onClick={() => selectLevel(lvl.code)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedLevel === lvl.code ? 'border-[var(--accent)] bg-[var(--accent-subtle)] shadow-md ring-1 ring-[var(--accent)]/20' : 'bg-white/60 border-[var(--border)] hover:border-[var(--accent)]/30'
                }`}>
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap className={`w-5 h-5 ${selectedLevel === lvl.code ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`} />
                  <span className="font-semibold text-sm">{lvl.name}</span>
                </div>
                <p className="text-xs text-[var(--text-muted)] mb-3">{lvl.desc || ''}</p>
                <div className="flex flex-wrap gap-1.5">
                  {lvl.categories.map(cat => (
                    <button key={cat.code} onClick={(e) => { e.stopPropagation(); selectLevel(lvl.code); selectCategory(cat.code) }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        selectedCategory === cat.code && selectedLevel === lvl.code
                          ? 'bg-[var(--accent)] text-white'
                          : 'bg-white border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)]/50 hover:text-[var(--text)]'
                      }`}>
                      <Tags className="w-3 h-3 inline mr-1" />{cat.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <Button onClick={goNext} disabled={!selectedLevel || !selectedCategory}>
              Lanjut <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="max-w-md mx-auto space-y-6">
          <Card className="p-6 text-center">
            <User className="w-12 h-12 mx-auto mb-3 text-[var(--accent)]" />
            <h2 className="text-lg font-bold text-[var(--text)]">Buat Akun</h2>
            <p className="text-sm text-[var(--text-muted)] mt-1">Isi data berikut untuk membuat akun pendaftar</p>
          </Card>

          <Card className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
            )}
            <div className="space-y-4">
              <Input label="Nama Lengkap" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} placeholder="Nama sesuai dokumen resmi" />
              <Input label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
              <Input label="Username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="Min 3 karakter" />
              <Input label="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min 8 karakter" />
              <Input label="Konfirmasi Password" type="password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} placeholder="Ulangi password" />
            </div>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={goBack}><ChevronLeft className="w-4 h-4" /> Kembali</Button>
            <Button loading={registering} onClick={handleRegister}><CheckCircle className="w-4 h-4" /> Daftar</Button>
          </div>
        </div>
      )}
    </div>
  )
}
