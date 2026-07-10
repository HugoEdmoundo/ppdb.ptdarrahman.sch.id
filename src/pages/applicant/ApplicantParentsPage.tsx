import { useState, useEffect } from 'react'
import { Button, Card, Spinner, Input } from '../../components/ui'
import { applicantService } from '../../services/index'
import { useToast } from '../../components/Toast'
import { Save, User } from 'lucide-react'

const PARENT_TABS = [
  { key: 'father', label: 'Ayah' },
  { key: 'mother', label: 'Ibu' },
  { key: 'guardian', label: 'Wali' },
]

const INITIAL = { full_name: '', nik: '', phone: '', email: '', occupation: '', income: '', education: '', address: '', is_same_address: false }

export default function ApplicantParentsPage() {
  const [tab, setTab] = useState('father')
  const [parents, setParents] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ ...INITIAL, parent_type: 'father' })
  const [dirty, setDirty] = useState(false)
  const { toast } = useToast()

  useEffect(() => { load() }, [])

  useEffect(() => {
    const p = parents[tab]
    if (p) {
      setForm({ full_name: p.full_name || '', nik: p.nik || '', phone: p.phone || '', email: p.email || '', occupation: p.occupation || '', income: p.income || '', education: p.education || '', address: p.address || '', is_same_address: !!p.is_same_address, parent_type: tab })
    } else {
      setForm({ ...INITIAL, parent_type: tab })
    }
    setDirty(false)
  }, [tab, parents])

  async function load() {
    setLoading(true)
    try {
      const list = await applicantService.getParents()
      const map: Record<string, any> = {}
      list.forEach((p: any) => { map[p.parent_type] = p })
      setParents(map)
    } catch { toast('error', 'Gagal memuat data') }
    finally { setLoading(false) }
  }

  async function handleSave() {
    if (!form.full_name) return toast('warning', 'Nama lengkap wajib diisi')
    setSaving(true)
    try {
      const payload = { ...form }
      delete (payload as any).parent_type
      await applicantService.saveParent(tab, payload)
      toast('success', 'Data berhasil disimpan')
      setDirty(false)
      load()
    } catch (e: any) { toast('error', e.message) }
    finally { setSaving(false) }
  }

  function update(field: string, value: any) { setForm({ ...form, [field]: value }); setDirty(true) }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="font-[var(--font-heading)] text-xl font-bold text-[var(--text)]">Data Orang Tua</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Lengkapi data orang tua dan wali</p>
      </div>

      <div className="flex gap-1 bg-white/50 rounded-xl p-1 border border-[var(--border)] w-fit">
        {PARENT_TABS.map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === key ? 'bg-[var(--accent)] text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}>
            <User className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Nama Lengkap *" value={form.full_name} onChange={e => update('full_name', e.target.value)} placeholder={`Nama ${PARENT_TABS.find(t => t.key === tab)?.label.toLowerCase()}`} />
          <Input label="NIK" value={form.nik} onChange={e => update('nik', e.target.value)} placeholder="16 digit" maxLength={16} />
          <Input label="Telepon" value={form.phone} onChange={e => update('phone', e.target.value)} />
          <Input label="Email" value={form.email} onChange={e => update('email', e.target.value)} />
          <Input label="Pekerjaan" value={form.occupation} onChange={e => update('occupation', e.target.value)} placeholder="Contoh: PNS, Wiraswasta" />
          <Input label="Pendidikan Terakhir" value={form.education} onChange={e => update('education', e.target.value)} placeholder="Contoh: S1, SMA" />
          <Input label="Penghasilan" value={form.income} onChange={e => update('income', e.target.value)} placeholder="Contoh: Rp 1.000.000 - Rp 3.000.000" />
        </div>
        <div className="mt-4">
          <Input label="Alamat (opsional, jika berbeda)" value={form.address} onChange={e => update('address', e.target.value)} placeholder="Kosongkan jika sama dengan alamat pendaftar" />
        </div>
        <div className="flex justify-end mt-6 pt-4 border-t border-[var(--border)]">
          <Button loading={saving} onClick={handleSave} disabled={!dirty}>
            <Save className="w-4 h-4" /> Simpan {PARENT_TABS.find(t => t.key === tab)?.label}
          </Button>
        </div>
      </Card>
    </div>
  )
}
