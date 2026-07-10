import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Button, Card, Spinner, Badge, Modal, Input, Select } from '../../components/ui'
import { selectionService } from '../../services/index'
import { useToast } from '../../components/Toast'
import { Plus, Pencil, Trash2, Calendar, GraduationCap, ClipboardList, Trophy, CheckCircle, XCircle, FileCheck } from 'lucide-react'

type Tab = 'test-types' | 'parameters' | 'sessions' | 'results' | 'graduations'

function tabFromPath(path: string): Tab {
  if (path.includes('/test-types')) return 'test-types'
  if (path.includes('/parameters')) return 'parameters'
  if (path.includes('/test-scores')) return 'results'
  if (path.includes('/graduations')) return 'graduations'
  return 'sessions'
}

export default function AdminSelectionPage() {
  const location = useLocation()
  const [tab, setTab] = useState<Tab>(() => tabFromPath(location.pathname))

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="font-[var(--font-heading)] text-2xl font-bold text-[var(--text)]">Manajemen Seleksi</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Kelola tes, nilai, dan kelulusan</p>
      </div>
      <div className="flex gap-1 bg-white/50 rounded-xl p-1 border border-[var(--border)] w-fit">
        {[
          { key: 'test-types', label: 'Tipe Tes', icon: FileCheck },
          { key: 'parameters', label: 'Parameter', icon: ClipboardList },
          { key: 'sessions', label: 'Sesi Tes', icon: Calendar },
          { key: 'results', label: 'Hasil & Nilai', icon: ClipboardList },
          { key: 'graduations', label: 'Kelulusan', icon: Trophy },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key as Tab)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === key ? 'bg-[var(--accent)] text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>
      {tab === 'test-types' ? <TestTypeTab /> : tab === 'parameters' ? <ParameterTab /> : tab === 'sessions' ? <SessionTab /> : tab === 'results' ? <ResultTab /> : <GraduationTab />}
    </div>
  )
}

function TestTypeTab() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ code: '', name: '', description: '', is_active: true })
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try { const r = await selectionService.getTestTypes(); setData(Array.isArray(r) ? r : []) }
    catch { toast('error', 'Gagal memuat') }
    finally { setLoading(false) }
  }

  function openCreate() { setEditId(null); setForm({ code: '', name: '', description: '', is_active: true }); setModalOpen(true) }
  function openEdit(item: any) { setEditId(item.id); setForm({ code: item.code || '', name: item.name || '', description: item.description || '', is_active: item.is_active ?? true }); setModalOpen(true) }

  async function handleSave() {
    if (!form.code || !form.name) return toast('warning', 'Lengkapi field wajib')
    setSaving(true)
    try {
      if (editId) { await selectionService.updateTestType(editId, form); toast('success', 'Tipe tes diperbarui') }
      else { await selectionService.createTestType(form); toast('success', 'Tipe tes dibuat') }
      setModalOpen(false); load()
    } catch (e: any) { toast('error', e.message) } finally { setSaving(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm('Hapus tipe tes ini?')) return
    try { await selectionService.deleteTestType(id); toast('success', 'Tipe tes dihapus'); load() }
    catch (e: any) { toast('error', e.message) }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <>
      <div className="flex justify-end"><Button onClick={openCreate}><Plus className="w-4 h-4" /> Tambah Tipe Tes</Button></div>
      {data.length === 0 ? (
        <Card className="p-12 text-center text-[var(--text-muted)]">Belum ada tipe tes.</Card>
      ) : (
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-[var(--border)] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[var(--accent-subtle)] border-b">
              <tr><th className="text-left px-5 py-3 font-semibold">Kode</th><th className="text-left px-5 py-3 font-semibold">Nama</th><th className="text-left px-5 py-3 font-semibold">Deskripsi</th><th className="text-left px-5 py-3 font-semibold">Status</th><th className="text-right px-5 py-3 font-semibold">Aksi</th></tr>
            </thead>
            <tbody>
              {data.map((item: any) => (
                <tr key={item.id} className="border-b hover:bg-white/40">
                  <td className="px-5 py-3 font-mono text-xs">{item.code}</td>
                  <td className="px-5 py-3 font-medium">{item.name}</td>
                  <td className="px-5 py-3 text-xs text-[var(--text-muted)]">{item.description || '—'}</td>
                  <td className="px-5 py-3"><Badge variant={item.is_active ? 'success' : 'default'}>{item.is_active ? 'Aktif' : 'Nonaktif'}</Badge></td>
                  <td className="px-5 py-3 text-right"><div className="flex justify-end gap-1"><Button size="sm" variant="ghost" onClick={() => openEdit(item)}><Pencil className="w-4 h-4" /></Button><Button size="sm" variant="ghost" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Tipe Tes' : 'Tambah Tipe Tes'}
        footer={<div className="flex gap-2 justify-end"><Button variant="outline" onClick={() => setModalOpen(false)}>Batal</Button><Button loading={saving} onClick={handleSave}>Simpan</Button></div>}>
        <div className="space-y-4">
          <Input label="Kode *" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="TIK" />
          <Input label="Nama *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Tes Iq" />
          <Input label="Deskripsi" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Deskripsi singkat" />
          <Select label="Status" value={form.is_active ? 'true' : 'false'} onChange={e => setForm({ ...form, is_active: e.target.value === 'true' })} options={[{ value: 'true', label: 'Aktif' }, { value: 'false', label: 'Nonaktif' }]} />
        </div>
      </Modal>
    </>
  )
}

function ParameterTab() {
  const [data, setData] = useState<any[]>([])
  const [testTypes, setTestTypes] = useState<any[]>([])
  const [filterType, setFilterType] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ test_type_id: '', name: '', weight: '', min_score: '', max_score: '', passing_score: '', sort_order: '' })
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => { selectionService.getTestTypes().then(setTestTypes).catch(() => {}) }, [])
  useEffect(() => { load() }, [filterType])

  async function load() {
    setLoading(true)
    try { const r = await selectionService.getParameters(filterType || undefined); setData(Array.isArray(r) ? r : []) }
    catch { toast('error', 'Gagal memuat') }
    finally { setLoading(false) }
  }

  function openCreate() { setEditId(null); setForm({ test_type_id: testTypes[0]?.id || '', name: '', weight: '', min_score: '', max_score: '', passing_score: '', sort_order: '' }); setModalOpen(true) }
  function openEdit(item: any) { setEditId(item.id); setForm({ test_type_id: item.test_type_id || '', name: item.name || '', weight: String(item.weight ?? ''), min_score: String(item.min_score ?? ''), max_score: String(item.max_score ?? ''), passing_score: String(item.passing_score ?? ''), sort_order: String(item.sort_order ?? '') }); setModalOpen(true) }

  async function handleSave() {
    if (!form.test_type_id || !form.name) return toast('warning', 'Lengkapi field wajib')
    setSaving(true)
    try {
      const payload = { ...form, weight: form.weight ? Number(form.weight) : null, min_score: form.min_score ? Number(form.min_score) : null, max_score: form.max_score ? Number(form.max_score) : null, passing_score: form.passing_score ? Number(form.passing_score) : null, sort_order: form.sort_order ? Number(form.sort_order) : 0 }
      if (editId) { await selectionService.updateParameter(editId, payload); toast('success', 'Parameter diperbarui') }
      else { await selectionService.createParameter(payload); toast('success', 'Parameter dibuat') }
      setModalOpen(false); load()
    } catch (e: any) { toast('error', e.message) } finally { setSaving(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm('Hapus parameter ini?')) return
    try { await selectionService.deleteParameter(id); toast('success', 'Parameter dihapus'); load() }
    catch (e: any) { toast('error', e.message) }
  }

  const ttOptions = testTypes.map((t: any) => ({ value: t.id, label: t.name }))
  const filterOptions = [{ value: '', label: 'Semua' }, ...ttOptions]

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <>
      <div className="flex justify-between items-center">
        <Select value={filterType} onChange={e => setFilterType(e.target.value)} options={filterOptions} />
        <Button onClick={openCreate}><Plus className="w-4 h-4" /> Tambah Parameter</Button>
      </div>
      {data.length === 0 ? (
        <Card className="p-12 text-center text-[var(--text-muted)]">Belum ada parameter.</Card>
      ) : (
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-[var(--border)] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[var(--accent-subtle)] border-b">
              <tr><th className="text-left px-5 py-3 font-semibold">Nama</th><th className="text-left px-5 py-3 font-semibold">Tipe Tes</th><th className="text-left px-5 py-3 font-semibold">Bobot</th><th className="text-left px-5 py-3 font-semibold">Skor Min</th><th className="text-left px-5 py-3 font-semibold">Skor Max</th><th className="text-left px-5 py-3 font-semibold">Passing Score</th><th className="text-left px-5 py-3 font-semibold">Urutan</th><th className="text-right px-5 py-3 font-semibold">Aksi</th></tr>
            </thead>
            <tbody>
              {data.map((item: any) => (
                <tr key={item.id} className="border-b hover:bg-white/40">
                  <td className="px-5 py-3 font-medium">{item.name}</td>
                  <td className="px-5 py-3 text-xs">{item.test_type?.name || '—'}</td>
                  <td className="px-5 py-3 text-xs">{item.weight ?? '—'}</td>
                  <td className="px-5 py-3 text-xs">{item.min_score ?? '—'}</td>
                  <td className="px-5 py-3 text-xs">{item.max_score ?? '—'}</td>
                  <td className="px-5 py-3 text-xs">{item.passing_score ?? '—'}</td>
                  <td className="px-5 py-3 text-xs">{item.sort_order ?? '—'}</td>
                  <td className="px-5 py-3 text-right"><div className="flex justify-end gap-1"><Button size="sm" variant="ghost" onClick={() => openEdit(item)}><Pencil className="w-4 h-4" /></Button><Button size="sm" variant="ghost" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Parameter' : 'Tambah Parameter'}
        footer={<div className="flex gap-2 justify-end"><Button variant="outline" onClick={() => setModalOpen(false)}>Batal</Button><Button loading={saving} onClick={handleSave}>Simpan</Button></div>}>
        <div className="space-y-4">
          <Select label="Tipe Tes *" value={form.test_type_id} onChange={e => setForm({ ...form, test_type_id: e.target.value })} options={ttOptions} />
          <Input label="Nama *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Parameter name" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Bobot" type="number" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} />
            <Input label="Urutan" type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input label="Skor Min" type="number" value={form.min_score} onChange={e => setForm({ ...form, min_score: e.target.value })} />
            <Input label="Skor Max" type="number" value={form.max_score} onChange={e => setForm({ ...form, max_score: e.target.value })} />
            <Input label="Passing Score" type="number" value={form.passing_score} onChange={e => setForm({ ...form, passing_score: e.target.value })} />
          </div>
        </div>
      </Modal>
    </>
  )
}

function SessionTab() {
  const [data, setData] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [testTypes, setTestTypes] = useState<any[]>([])
  const [form, setForm] = useState({ wave_config_id: '', test_type_id: '', session_name: '', test_date: '', start_time: '', end_time: '', location: '', capacity: 0, status: 'scheduled' })
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const PER_PAGE = 20

  useEffect(() => { load(); selectionService.getTestTypes().then(setTestTypes).catch(() => {}) }, [page])

  async function load() {
    setLoading(true)
    try { const r = await selectionService.getSessions({ page, perPage: PER_PAGE }); setData(r.data || []); setTotal(r.total || 0) }
    catch { toast('error', 'Gagal memuat') }
    finally { setLoading(false) }
  }

  function openCreate() { setEditId(null); setForm({ wave_config_id: '', test_type_id: testTypes[0]?.id || '', session_name: '', test_date: '', start_time: '', end_time: '', location: '', capacity: 30, status: 'scheduled' }); setModalOpen(true) }
  function openEdit(s: any) { setEditId(s.id); setForm({ wave_config_id: s.wave_config_id || '', test_type_id: s.test_type_id, session_name: s.session_name, test_date: s.test_date?.slice(0, 10) || '', start_time: s.start_time || '', end_time: s.end_time || '', location: s.location || '', capacity: s.capacity || 30, status: s.status || 'scheduled' }); setModalOpen(true) }

  async function handleSave() {
    if (!form.session_name || !form.test_type_id || !form.test_date) return toast('warning', 'Lengkapi field')
    setSaving(true)
    try {
      const payload = { ...form, capacity: Number(form.capacity) }
      if (editId) { await selectionService.updateSession(editId, payload); toast('success', 'Sesi diperbarui') }
      else { await selectionService.createSession(payload); toast('success', 'Sesi dibuat') }
      setModalOpen(false); load()
    } catch (e: any) { toast('error', e.message) } finally { setSaving(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm('Hapus sesi tes ini?')) return
    try { await selectionService.deleteSession(id); toast('success', 'Sesi dihapus'); load() }
    catch (e: any) { toast('error', e.message) }
  }

  const ttOptions = testTypes.map((t: any) => ({ value: t.id, label: t.name }))
  const totalPages = Math.ceil(total / PER_PAGE)

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <>
      <div className="flex justify-end"><Button onClick={openCreate}><Plus className="w-4 h-4" /> Tambah Sesi</Button></div>
      {data.length === 0 ? (
        <Card className="p-12 text-center text-[var(--text-muted)]">Belum ada sesi tes.</Card>
      ) : (
        <>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-[var(--border)] overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[var(--accent-subtle)] border-b">
                <tr><th className="text-left px-5 py-3 font-semibold">Sesi</th><th className="text-left px-5 py-3 font-semibold">Tipe Tes</th><th className="text-left px-5 py-3 font-semibold">Tanggal</th><th className="text-left px-5 py-3 font-semibold">Waktu</th><th className="text-left px-5 py-3 font-semibold">Lokasi</th><th className="text-left px-5 py-3 font-semibold">Kapasitas</th><th className="text-left px-5 py-3 font-semibold">Status</th><th className="text-right px-5 py-3 font-semibold">Aksi</th></tr>
            </thead>
            <tbody>
              {data.map((s: any) => (
                <tr key={s.id} className="border-b hover:bg-white/40">
                  <td className="px-5 py-3 font-medium">{s.session_name}</td>
                  <td className="px-5 py-3 text-xs">{s.test_type?.name || '—'}</td>
                  <td className="px-5 py-3 text-xs">{s.test_date?.slice(0, 10)}</td>
                  <td className="px-5 py-3 text-xs">{s.start_time} – {s.end_time}</td>
                  <td className="px-5 py-3 text-xs">{s.location || '—'}</td>
                  <td className="px-5 py-3">{s.capacity}</td>
                  <td className="px-5 py-3"><Badge variant={s.status === 'scheduled' ? 'warning' : s.status === 'completed' ? 'success' : 'default'}>{s.status}</Badge></td>
                  <td className="px-5 py-3 text-right"><div className="flex justify-end gap-1"><Button size="sm" variant="ghost" onClick={() => openEdit(s)}><Pencil className="w-4 h-4" /></Button><Button size="sm" variant="ghost" onClick={() => handleDelete(s.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2">
            <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Sebelumnya</Button>
            <span className="text-sm text-[var(--text-muted)]">Halaman {page} dari {totalPages}</span>
            <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Berikutnya</Button>
          </div>
        )}
      </>
      )}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Sesi' : 'Tambah Sesi'}
        footer={<div className="flex gap-2 justify-end"><Button variant="outline" onClick={() => setModalOpen(false)}>Batal</Button><Button loading={saving} onClick={handleSave}>Simpan</Button></div>}>
        <div className="space-y-4">
          <Select label="Tipe Tes" value={form.test_type_id} onChange={e => setForm({ ...form, test_type_id: e.target.value })} options={ttOptions} />
          <Input label="Nama Sesi" value={form.session_name} onChange={e => setForm({ ...form, session_name: e.target.value })} placeholder="Sesi Pagi" />
          <Input label="Tanggal" type="date" value={form.test_date} onChange={e => setForm({ ...form, test_date: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Mulai" type="time" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} />
            <Input label="Selesai" type="time" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Lokasi" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
            <Input label="Kapasitas" type="number" value={String(form.capacity)} onChange={e => setForm({ ...form, capacity: Number(e.target.value) })} />
          </div>
          <Select label="Status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} options={[{ value: 'scheduled', label: 'Terjadwal' }, { value: 'in_progress', label: 'Berlangsung' }, { value: 'completed', label: 'Selesai' }]} />
        </div>
      </Modal>
    </>
  )
}

function ResultTab() {
  const [testTypes, setTestTypes] = useState<any[]>([])
  const [parameters, setParameters] = useState<any[]>([])
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editResult, setEditResult] = useState<any>(null)
  const [form, setForm] = useState({ applicant_id: '', test_type_id: '', total_score: '', is_passed: true, notes: '', scores: [] as { parameter_id: string; score: number }[] })
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const [tt, res] = await Promise.all([selectionService.getTestTypes(), selectionService.getResults?.({ perPage: 50 }) || Promise.resolve({ data: [] })])
      setTestTypes(tt); setResults((res as any).data || res || [])
    } catch { toast('error', 'Gagal memuat') }
    finally { setLoading(false) }
  }

  useEffect(() => {
    if (form.test_type_id) {
      selectionService.getParameters(form.test_type_id).then(setParameters).catch(() => setParameters([]))
    } else { setParameters([]) }
  }, [form.test_type_id])

  function openScoreInput(result?: any) {
    const tt = result?.test_type_id || testTypes[0]?.id || ''
    setForm({ applicant_id: result?.applicant_id || '', test_type_id: tt, total_score: result?.total_score ?? '', is_passed: result?.is_passed ?? true, notes: result?.notes || '', scores: [] })
    setEditResult(result || null)
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.applicant_id || !form.test_type_id) return toast('warning', 'Lengkapi field')
    setSaving(true)
    try {
      const payload = { ...form, total_score: form.total_score ? Number(form.total_score) : null, scores: form.scores.filter(s => s.parameter_id && s.score > 0) }
      await selectionService.saveResult(payload)
      toast('success', 'Nilai disimpan')
      setModalOpen(false); load()
    } catch (e: any) { toast('error', e.message) } finally { setSaving(false) }
  }

  function toggleParam(pid: string, score: number) {
    const existing = form.scores.findIndex(s => s.parameter_id === pid)
    if (existing >= 0) {
      const s = [...form.scores]
      if (score <= 0) s.splice(existing, 1)
      else s[existing] = { parameter_id: pid, score }
      setForm({ ...form, scores: s })
    } else if (score > 0) {
      setForm({ ...form, scores: [...form.scores, { parameter_id: pid, score }] })
    }
  }

  const ttOptions = testTypes.map((t: any) => ({ value: t.id, label: t.name }))

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <>
      <div className="flex justify-end"><Button onClick={() => openScoreInput()}><Plus className="w-4 h-4" /> Input Nilai</Button></div>
      {!Array.isArray(results) || results.length === 0 ? (
        <Card className="p-12 text-center text-[var(--text-muted)]">Belum ada data hasil tes.</Card>
      ) : (
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-[var(--border)] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[var(--accent-subtle)] border-b">
              <tr><th className="text-left px-5 py-3 font-semibold">Peserta</th><th className="text-left px-5 py-3 font-semibold">Total Skor</th><th className="text-left px-5 py-3 font-semibold">Status</th><th className="text-left px-5 py-3 font-semibold">Catatan</th><th className="text-right px-5 py-3 font-semibold">Aksi</th></tr>
            </thead>
            <tbody>
              {results.map((r: any) => (
                <tr key={r.id} className="border-b hover:bg-white/40">
                  <td className="px-5 py-3">{r.profile?.full_name || r.applicant_id}</td>
                  <td className="px-5 py-3 font-medium">{r.total_score != null ? r.total_score : '—'}</td>
                  <td className="px-5 py-3">{r.is_passed ? <Badge variant="success"><CheckCircle className="w-3 h-3 inline" /> Lulus</Badge> : r.is_passed === false ? <Badge variant="danger"><XCircle className="w-3 h-3 inline" /> Tidak Lulus</Badge> : <Badge variant="warning">Belum</Badge>}</td>
                  <td className="px-5 py-3 text-xs text-[var(--text-muted)]">{r.notes || '—'}</td>
                  <td className="px-5 py-3 text-right"><Button size="sm" variant="outline" onClick={() => openScoreInput(r)}><Pencil className="w-4 h-4" /> Edit</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditResult(null) }} title={editResult ? 'Edit Nilai' : 'Input Nilai'} size="lg"
        footer={<div className="flex gap-2 justify-end"><Button variant="outline" onClick={() => { setModalOpen(false); setEditResult(null) }}>Batal</Button><Button loading={saving} onClick={handleSave}>Simpan</Button></div>}>
        <div className="space-y-4">
          <Input label="ID Peserta" value={form.applicant_id} onChange={e => setForm({ ...form, applicant_id: e.target.value })} placeholder="UUID applicant" />
          <Select label="Tipe Tes" value={form.test_type_id} onChange={e => setForm({ ...form, test_type_id: e.target.value })} options={ttOptions} />
          <Input label="Total Skor" type="number" value={form.total_score} onChange={e => setForm({ ...form, total_score: e.target.value })} />
          <Select label="Status Kelulusan" value={form.is_passed ? 'true' : 'false'} onChange={e => setForm({ ...form, is_passed: e.target.value === 'true' })} options={[{ value: 'true', label: 'Lulus' }, { value: 'false', label: 'Tidak Lulus' }]} />
          <Input label="Catatan" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          {parameters.length > 0 && (
            <div>
              <label className="text-sm font-medium block mb-2">Nilai Per Parameter</label>
              <div className="space-y-2">
                {parameters.map((p: any) => (
                  <div key={p.id} className="flex items-center gap-2">
                    <span className="text-xs text-[var(--text-muted)] w-32 truncate">{p.name}</span>
                    <Input type="number" className="w-24" placeholder="Nilai" value={String(form.scores.find(s => s.parameter_id === p.id)?.score || '')} onChange={e => toggleParam(p.id, Number(e.target.value))} />
                    <span className="text-xs text-[var(--text-muted)]">/ {p.max_score || 100}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  )
}

function GraduationTab() {
  const [data, setData] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ applicant_id: '', is_graduated: true, total_score: '', graduation_rank: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const [ruleModal, setRuleModal] = useState(false)
  const [rules, setRules] = useState<any[]>([])
  const [editRuleId, setEditRuleId] = useState<string | null>(null)
  const [ruleForm, setRuleForm] = useState({ wave_config_id: '', rule_type: 'pass_all', min_total_score: '', must_pass_all_tests: true, description: '', is_active: true })
  const { toast } = useToast()
  const PER_PAGE = 20

  useEffect(() => { load(); loadRules() }, [page])

  async function load() {
    setLoading(true)
    try { const r = await selectionService.getGraduations({ page, perPage: PER_PAGE }); setData((r as any).data || r || []); setTotal((r as any).total || 0) }
    catch { toast('error', 'Gagal memuat') }
    finally { setLoading(false) }
  }

  async function loadRules() {
    try { setRules(await selectionService.getGraduationRules()) } catch { }
  }

  function openGraduate() { setForm({ applicant_id: '', is_graduated: true, total_score: '', graduation_rank: '', notes: '' }); setModalOpen(true) }

  async function handleGraduate() {
    if (!form.applicant_id) return toast('warning', 'ID peserta wajib')
    setSaving(true)
    try {
      await selectionService.setGraduation({ ...form, total_score: form.total_score ? Number(form.total_score) : null, graduation_rank: form.graduation_rank ? Number(form.graduation_rank) : null })
      toast('success', 'Kelulusan diset')
      setModalOpen(false); load()
    } catch (e: any) { toast('error', e.message) } finally { setSaving(false) }
  }

  function openCreateRule() { setEditRuleId(null); setRuleForm({ wave_config_id: '', rule_type: 'pass_all', min_total_score: '', must_pass_all_tests: true, description: '', is_active: true }); setRuleModal(true) }
  function openEditRule(rule: any) { setEditRuleId(rule.id); setRuleForm({ wave_config_id: rule.wave_config_id || '', rule_type: rule.rule_type || 'pass_all', min_total_score: String(rule.min_total_score ?? ''), must_pass_all_tests: rule.must_pass_all_tests ?? true, description: rule.description || '', is_active: rule.is_active ?? true }); setRuleModal(true) }

  async function handleSaveRule() {
    if (!ruleForm.wave_config_id) return toast('warning', 'Wave config wajib')
    setSaving(true)
    try {
      const payload = { ...ruleForm, min_total_score: ruleForm.min_total_score ? Number(ruleForm.min_total_score) : null }
      if (editRuleId) { await selectionService.updateGraduationRule(editRuleId, payload); toast('success', 'Aturan diperbarui') }
      else { await selectionService.createGraduationRule(payload); toast('success', 'Aturan disimpan') }
      setRuleModal(false); loadRules()
    } catch (e: any) { toast('error', e.message) } finally { setSaving(false) }
  }

  async function handleDeleteRule(id: string) {
    if (!confirm('Hapus aturan kelulusan ini?')) return
    try { await selectionService.deleteGraduationRule(id); toast('success', 'Aturan dihapus'); loadRules() }
    catch (e: any) { toast('error', e.message) }
  }

  const totalPages = Math.ceil(total / PER_PAGE)

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <>
      <div className="flex justify-between items-center gap-3">
        <Button variant="outline" onClick={openCreateRule}><GraduationCap className="w-4 h-4" /> Aturan Kelulusan</Button>
        <Button onClick={openGraduate}><Trophy className="w-4 h-4" /> Set Kelulusan</Button>
      </div>
      {(!Array.isArray(data) || data.length === 0) ? (
        <Card className="p-12 text-center text-[var(--text-muted)]">Belum ada data kelulusan.</Card>
      ) : (
        <>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-[var(--border)] overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[var(--accent-subtle)] border-b">
                <tr><th className="text-left px-5 py-3 font-semibold">Rank</th><th className="text-left px-5 py-3 font-semibold">Peserta</th><th className="text-left px-5 py-3 font-semibold">Total Skor</th><th className="text-left px-5 py-3 font-semibold">Status</th><th className="text-left px-5 py-3 font-semibold">Catatan</th></tr>
              </thead>
              <tbody>
                {data.map((g: any) => (
                  <tr key={g.id} className="border-b hover:bg-white/40">
                    <td className="px-5 py-3 font-mono">{g.graduation_rank || '—'}</td>
                    <td className="px-5 py-3 font-medium">{g.profile?.full_name || g.applicant_id}</td>
                    <td className="px-5 py-3">{g.total_score ?? '—'}</td>
                    <td className="px-5 py-3">{g.is_graduated ? <Badge variant="success"><CheckCircle className="w-3 h-3 inline" /> Lulus</Badge> : <Badge variant="danger">Tidak Lulus</Badge>}</td>
                    <td className="px-5 py-3 text-xs text-[var(--text-muted)]">{g.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Sebelumnya</Button>
              <span className="text-sm text-[var(--text-muted)]">Halaman {page} dari {totalPages}</span>
              <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Berikutnya</Button>
            </div>
          )}
        </>
      )}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Set Kelulusan"
        footer={<div className="flex gap-2 justify-end"><Button variant="outline" onClick={() => setModalOpen(false)}>Batal</Button><Button loading={saving} onClick={handleGraduate}>Simpan</Button></div>}>
        <div className="space-y-4">
          <Input label="ID Peserta *" value={form.applicant_id} onChange={e => setForm({ ...form, applicant_id: e.target.value })} />
          <Select label="Status" value={form.is_graduated ? 'true' : 'false'} onChange={e => setForm({ ...form, is_graduated: e.target.value === 'true' })} options={[{ value: 'true', label: 'Lulus' }, { value: 'false', label: 'Tidak Lulus' }]} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Total Skor" type="number" value={form.total_score} onChange={e => setForm({ ...form, total_score: e.target.value })} />
            <Input label="Peringkat" type="number" value={form.graduation_rank} onChange={e => setForm({ ...form, graduation_rank: e.target.value })} />
          </div>
          <Input label="Catatan" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
        </div>
      </Modal>
      <Modal isOpen={ruleModal} onClose={() => setRuleModal(false)} title={editRuleId ? 'Edit Aturan Kelulusan' : 'Aturan Kelulusan'}
        footer={<div className="flex gap-2 justify-end"><Button variant="outline" onClick={() => setRuleModal(false)}>Batal</Button><Button loading={saving} onClick={handleSaveRule}>{editRuleId ? 'Simpan' : 'Tambah'}</Button></div>}>
        <div className="space-y-4">
          <Input label="Wave Config ID" value={ruleForm.wave_config_id} onChange={e => setRuleForm({ ...ruleForm, wave_config_id: e.target.value })} placeholder="UUID wave config" />
          <Select label="Tipe Aturan" value={ruleForm.rule_type} onChange={e => setRuleForm({ ...ruleForm, rule_type: e.target.value })} options={[{ value: 'pass_all', label: 'Lulus Semua Tes' }, { value: 'min_score', label: 'Skor Minimal' }, { value: 'ranking', label: 'Peringkat' }]} />
          <Input label="Skor Minimal" type="number" value={ruleForm.min_total_score} onChange={e => setRuleForm({ ...ruleForm, min_total_score: e.target.value })} />
          <Input label="Deskripsi" value={ruleForm.description} onChange={e => setRuleForm({ ...ruleForm, description: e.target.value })} />
        </div>
      </Modal>
      {rules.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold text-sm mb-2">Aturan yang Ada</h3>
          <div className="space-y-1">
            {rules.map((r: any) => (
              <div key={r.id} className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <Badge variant={r.is_active ? 'success' : 'default'}>{r.rule_type}</Badge>
                  <span className="text-[var(--text-muted)]">{r.description || '—'}</span>
                  {r.min_total_score && <span className="text-[var(--text-muted)]">Min: {r.min_total_score}</span>}
                </div>
                <div className="flex gap-1"><Button size="sm" variant="ghost" onClick={() => openEditRule(r)}><Pencil className="w-4 h-4" /></Button><Button size="sm" variant="ghost" onClick={() => handleDeleteRule(r.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button></div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </>
  )
}