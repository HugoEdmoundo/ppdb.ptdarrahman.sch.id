import { useState, useEffect } from 'react'
import { Button, Card, Spinner, Badge, Modal, Input, Select } from '../../components/ui'
import { ppdbService } from '../../services/index'
import { useToast } from '../../components/Toast'
import { Plus, Pencil, Trash2, Calendar, Layers } from 'lucide-react'

const STATUS_OPTIONS = [
  { value: 'active', label: 'Aktif' },
  { value: 'inactive', label: 'Tidak Aktif' },
  { value: 'archived', label: 'Arsip' },
]

type Tab = 'periods' | 'waves'

export default function PeriodsPage() {
  const [tab, setTab] = useState<Tab>('periods')

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="font-[var(--font-heading)] text-2xl font-bold text-[var(--text)]">Periode & Gelombang</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Kelola periode pendaftaran dan gelombang PPDB</p>
      </div>
      <div className="flex gap-1 bg-white/50 rounded-xl p-1 border border-[var(--border)] w-fit">
        {[
          { key: 'periods', label: 'Periode', icon: Calendar },
          { key: 'waves', label: 'Gelombang', icon: Layers },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key as Tab)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === key ? 'bg-[var(--accent)] text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>
      {tab === 'periods' ? <PeriodTab /> : <WaveTab />}
    </div>
  )
}

function PeriodTab() {
  const [periods, setPeriods] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', academic_year: '', start_date: '', end_date: '', status: 'active', description: '' })
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => { loadPeriods() }, [])

  async function loadPeriods() {
    setLoading(true)
    try { setPeriods(await ppdbService.getAllPeriods()) }
    catch { toast('error', 'Gagal memuat periode') }
    finally { setLoading(false) }
  }

  function openCreate() {
    setEditId(null)
    setForm({ name: '', academic_year: '', start_date: '', end_date: '', status: 'active', description: '' })
    setModalOpen(true)
  }

  function openEdit(p: any) {
    setEditId(p.id)
    setForm({ name: p.name, academic_year: p.academic_year, start_date: p.start_date?.slice(0, 10) || '', end_date: p.end_date?.slice(0, 10) || '', status: p.status || 'active', description: p.description || '' })
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.name || !form.academic_year || !form.start_date || !form.end_date) return toast('warning', 'Lengkapi semua field')
    setSaving(true)
    try {
      if (editId) { await ppdbService.updatePeriod(editId, form); toast('success', 'Periode diperbarui') }
      else { await ppdbService.createPeriod(form); toast('success', 'Periode dibuat') }
      setModalOpen(false)
      loadPeriods()
    } catch (e: any) { toast('error', e.message) }
    finally { setSaving(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm('Hapus periode ini?')) return
    try { await ppdbService.deletePeriod(id); toast('success', 'Periode dihapus'); loadPeriods() }
    catch (e: any) { toast('error', e.message) }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={openCreate}><Plus className="w-4 h-4" /> Tambah Periode</Button>
      </div>
      {periods.length === 0 ? (
        <Card className="p-12 text-center text-[var(--text-muted)]">Belum ada periode. Klik "Tambah Periode" untuk membuat.</Card>
      ) : (
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-[var(--border)] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[var(--accent-subtle)] border-b border-[var(--border)]">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-[var(--text-secondary)]">Nama</th>
                <th className="text-left px-5 py-3 font-semibold text-[var(--text-secondary)]">Tahun Ajaran</th>
                <th className="text-left px-5 py-3 font-semibold text-[var(--text-secondary)]">Tanggal</th>
                <th className="text-left px-5 py-3 font-semibold text-[var(--text-secondary)]">Status</th>
                <th className="text-right px-5 py-3 font-semibold text-[var(--text-secondary)]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {periods.map((p: any) => (
                <tr key={p.id} className="border-b border-[var(--border)] hover:bg-white/40 transition-colors">
                  <td className="px-5 py-3 font-medium">{p.name}</td>
                  <td className="px-5 py-3 text-[var(--text-muted)]">{p.academic_year}</td>
                  <td className="px-5 py-3 text-[var(--text-muted)] text-xs">
                    {p.start_date?.slice(0, 10)} – {p.end_date?.slice(0, 10)}
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant={p.status === 'active' ? 'success' : p.status === 'inactive' ? 'warning' : 'default'}>
                      {p.status === 'active' ? 'Aktif' : p.status === 'inactive' ? 'Nonaktif' : 'Arsip'}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(p)}><Pencil className="w-4 h-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(p.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Periode' : 'Tambah Periode'}
        footer={<div className="flex gap-2 justify-end"><Button variant="outline" onClick={() => setModalOpen(false)}>Batal</Button><Button loading={saving} onClick={handleSave}>Simpan</Button></div>}>
        <div className="space-y-4">
          <Input label="Nama Periode" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Contoh: PPDB 2025/2026" />
          <Input label="Tahun Ajaran" value={form.academic_year} onChange={e => setForm({ ...form, academic_year: e.target.value })} placeholder="2025/2026" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Tanggal Mulai" type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
            <Input label="Tanggal Selesai" type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} />
          </div>
          <Select label="Status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} options={STATUS_OPTIONS} />
          <Input label="Deskripsi (opsional)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Deskripsi periode" />
        </div>
      </Modal>
    </>
  )
}

function WaveTab() {
  const [waves, setWaves] = useState<any[]>([])
  const [periods, setPeriods] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterPeriod, setFilterPeriod] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ period_id: '', name: '', wave_number: 1, start_date: '', end_date: '', quota: 0, status: 'active', discount_type: '', discount_value: '' })
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => { loadData() }, [filterPeriod])

  async function loadData() {
    setLoading(true)
    try {
      const [p, w] = await Promise.all([ppdbService.getAllPeriods(), ppdbService.getAllWaves(filterPeriod || undefined)])
      setPeriods(p); setWaves(w)
    } catch { toast('error', 'Gagal memuat data') }
    finally { setLoading(false) }
  }

  function openCreate() {
    setEditId(null)
    setForm({ period_id: filterPeriod || (periods[0]?.id || ''), name: '', wave_number: 1, start_date: '', end_date: '', quota: 0, status: 'active', discount_type: '', discount_value: '' })
    setModalOpen(true)
  }

  function openEdit(w: any) {
    setEditId(w.id)
    setForm({ period_id: w.period_id, name: w.name, wave_number: w.wave_number, start_date: w.start_date?.slice(0, 10) || '', end_date: w.end_date?.slice(0, 10) || '', quota: w.quota || 0, status: w.status || 'active', discount_type: w.discount_type || '', discount_value: w.discount_value ?? '' })
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.name || !form.period_id || !form.start_date || !form.end_date) return toast('warning', 'Lengkapi semua field')
    setSaving(true)
    try {
      const payload = { ...form, wave_number: Number(form.wave_number), quota: Number(form.quota), discount_value: form.discount_value ? Number(form.discount_value) : null }
      if (editId) { await ppdbService.updateWave(editId, payload); toast('success', 'Gelombang diperbarui') }
      else { await ppdbService.createWave(payload); toast('success', 'Gelombang dibuat') }
      setModalOpen(false)
      loadData()
    } catch (e: any) { toast('error', e.message) }
    finally { setSaving(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm('Hapus gelombang ini?')) return
    try { await ppdbService.deleteWave(id); toast('success', 'Gelombang dihapus'); loadData() }
    catch (e: any) { toast('error', e.message) }
  }

  const periodOptions = periods.map((p: any) => ({ value: p.id, label: `${p.name} (${p.academic_year})` }))

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <>
      <div className="flex justify-between items-center gap-3">
        <Select value={filterPeriod} onChange={e => setFilterPeriod(e.target.value)} options={[{ value: '', label: 'Semua Periode' }, ...periodOptions]} className="w-64" />
        <Button onClick={openCreate}><Plus className="w-4 h-4" /> Tambah Gelombang</Button>
      </div>
      {waves.length === 0 ? (
        <Card className="p-12 text-center text-[var(--text-muted)]">Belum ada gelombang. Klik "Tambah Gelombang" untuk membuat.</Card>
      ) : (
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-[var(--border)] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[var(--accent-subtle)] border-b border-[var(--border)]">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-[var(--text-secondary)]">Nama</th>
                <th className="text-left px-5 py-3 font-semibold text-[var(--text-secondary)]">Periode</th>
                <th className="text-left px-5 py-3 font-semibold text-[var(--text-secondary)]">No</th>
                <th className="text-left px-5 py-3 font-semibold text-[var(--text-secondary)]">Tanggal</th>
                <th className="text-left px-5 py-3 font-semibold text-[var(--text-secondary)]">Kuota</th>
                <th className="text-left px-5 py-3 font-semibold text-[var(--text-secondary)]">Status</th>
                <th className="text-right px-5 py-3 font-semibold text-[var(--text-secondary)]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {waves.map((w: any) => {
                const p = periods.find((pp: any) => pp.id === w.period_id)
                return (
                  <tr key={w.id} className="border-b border-[var(--border)] hover:bg-white/40 transition-colors">
                    <td className="px-5 py-3 font-medium">{w.name}</td>
                    <td className="px-5 py-3 text-[var(--text-muted)] text-xs">{p?.name || w.period_id}</td>
                    <td className="px-5 py-3">{w.wave_number}</td>
                    <td className="px-5 py-3 text-[var(--text-muted)] text-xs">{w.start_date?.slice(0, 10)} – {w.end_date?.slice(0, 10)}</td>
                    <td className="px-5 py-3">{w.quota || '—'}</td>
                    <td className="px-5 py-3">
                      <Badge variant={w.status === 'active' ? 'success' : 'warning'}>{w.status === 'active' ? 'Aktif' : 'Nonaktif'}</Badge>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(w)}><Pencil className="w-4 h-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(w.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Gelombang' : 'Tambah Gelombang'}
        footer={<div className="flex gap-2 justify-end"><Button variant="outline" onClick={() => setModalOpen(false)}>Batal</Button><Button loading={saving} onClick={handleSave}>Simpan</Button></div>}>
        <div className="space-y-4">
          <Select label="Periode" value={form.period_id} onChange={e => setForm({ ...form, period_id: e.target.value })} options={periodOptions} />
          <Input label="Nama Gelombang" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Contoh: Gelombang 1" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Nomor Gelombang" type="number" value={String(form.wave_number)} onChange={e => setForm({ ...form, wave_number: Number(e.target.value) })} />
            <Input label="Kuota" type="number" value={String(form.quota)} onChange={e => setForm({ ...form, quota: Number(e.target.value) })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Tanggal Mulai" type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
            <Input label="Tanggal Selesai" type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} />
          </div>
          <Select label="Status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} options={STATUS_OPTIONS} />
        </div>
      </Modal>
    </>
  )
}
