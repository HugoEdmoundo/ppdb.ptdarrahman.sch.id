import { useState, useEffect } from 'react'
import { Button, Card, Spinner, Badge, Modal, Select, Input } from '../../components/ui'
import { ppdbService } from '../../services/index'
import { useToast } from '../../components/Toast'
import { Plus, Pencil, Trash2, Link2 } from 'lucide-react'

export default function WaveConfigPage() {
  const [configs, setConfigs] = useState<{ data: any[]; total: number }>({ data: [], total: 0 })
  const [periods, setPeriods] = useState<any[]>([])
  const [waves, setWaves] = useState<any[]>([])
  const [levels, setLevels] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [flows, setFlows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterPeriod, setFilterPeriod] = useState('')
  const [filterWave, setFilterWave] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ wave_id: '', level_id: '', category_id: '', flow_id: '', quota: 0, status: 'active', payment_stage_count: 1 })
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    Promise.all([ppdbService.getAllPeriods(), ppdbService.getLevels(), ppdbService.getCategories(), ppdbService.getFlows()])
      .then(([p, l, c, f]) => { setPeriods(p); setLevels(l); setCategories(c); setFlows(f) })
      .catch(() => toast('error', 'Gagal memuat data referensi'))
  }, [])

  useEffect(() => {
    if (filterPeriod) {
      ppdbService.getAllWaves(filterPeriod).then(setWaves).catch(() => {})
    } else {
      setWaves([])
    }
  }, [filterPeriod])

  useEffect(() => { loadConfigs() }, [filterWave])

  async function loadConfigs() {
    setLoading(true)
    try {
      const params: any = { perPage: 100 }
      if (filterWave) params.wave_id = filterWave
      const res = await ppdbService.getWaveConfigs(params)
      setConfigs({ data: res.data || res, total: res.total || 0 })
    } catch { toast('error', 'Gagal memuat konfigurasi') }
    finally { setLoading(false) }
  }

  function openCreate() {
    setEditId(null)
    setForm({ wave_id: filterWave || (waves[0]?.id || ''), level_id: levels[0]?.id || '', category_id: categories[0]?.id || '', flow_id: flows[0]?.id || '', quota: 0, status: 'active', payment_stage_count: 1 })
    setModalOpen(true)
  }

  function openEdit(c: any) {
    setEditId(c.id)
    setForm({ wave_id: c.wave_id, level_id: c.level_id, category_id: c.category_id, flow_id: c.flow_id, quota: c.quota || 0, status: c.status || 'active', payment_stage_count: c.payment_stage_count || 1 })
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.wave_id || !form.level_id || !form.category_id || !form.flow_id) return toast('warning', 'Lengkapi semua pilihan')
    setSaving(true)
    try {
      const payload = { ...form, quota: Number(form.quota), payment_stage_count: Number(form.payment_stage_count) }
      if (editId) { await ppdbService.updateWaveConfig(editId, payload); toast('success', 'Konfigurasi diperbarui') }
      else { await ppdbService.createWaveConfig(payload); toast('success', 'Konfigurasi dibuat') }
      setModalOpen(false); loadConfigs()
    } catch (e: any) { toast('error', e.message) }
    finally { setSaving(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm('Hapus konfigurasi ini?')) return
    try { await ppdbService.deleteWaveConfig(id); toast('success', 'Dihapus'); loadConfigs() }
    catch (e: any) { toast('error', e.message) }
  }

  function findName(items: any[], id: string) { return items.find(i => i.id === id)?.name || id }

  const periodOptions = periods.map((p: any) => ({ value: p.id, label: `${p.name} (${p.academic_year})` }))
  const waveOptions = (filterPeriod ? waves : []).map((w: any) => ({ value: w.id, label: `Gelombang ${w.wave_number} - ${w.name}` }))
  const levelOptions = levels.map((l: any) => ({ value: l.id, label: l.name }))
  const categoryOptions = categories.map((c: any) => ({ value: c.id, label: c.name }))
  const flowOptions = flows.map((f: any) => ({ value: f.id, label: f.name }))

  // Build wave-level-category names lookup from all configs for display
  function enrichConfigs() {
    const data = Array.isArray(configs.data) ? configs.data : (Array.isArray(configs) ? configs : [])
    return data.map((c: any) => ({
      ...c,
      waveName: findName(waves.length > 0 ? waves : [], c.wave_id),
      levelName: findName(levels, c.level_id),
      categoryName: findName(categories, c.category_id),
      flowName: findName(flows, c.flow_id),
    }))
  }

  const enriched = enrichConfigs()

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="font-[var(--font-heading)] text-2xl font-bold text-[var(--text)]">Konfigurasi Gelombang</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Petakan gelombang dengan jenjang, kategori, dan alur seleksi</p>
      </div>

      <div className="flex flex-wrap justify-between items-center gap-3">
        <div className="flex gap-3">
          <Select
            value={filterPeriod}
            onChange={e => { setFilterPeriod(e.target.value); setFilterWave('') }}
            options={[{ value: '', label: 'Semua Periode' }, ...periodOptions]}
            placeholder="Pilih Periode"
            className="w-48"
          />
          {filterPeriod && (
            <Select
              value={filterWave}
              onChange={e => setFilterWave(e.target.value)}
              options={[{ value: '', label: 'Semua Gelombang' }, ...waveOptions]}
              placeholder="Pilih Gelombang"
              className="w-48"
            />
          )}
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4" /> Tambah Konfigurasi</Button>
      </div>

      {enriched.length === 0 ? (
        <Card className="p-12 text-center text-[var(--text-muted)]">
          <Link2 className="w-12 h-12 mx-auto mb-3 text-[var(--border)]" />
          <p>Belum ada konfigurasi gelombang.</p>
          <p className="text-xs mt-1">Pilih periode dan klik "Tambah Konfigurasi"</p>
        </Card>
      ) : (
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-[var(--border)] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[var(--accent-subtle)] border-b border-[var(--border)]">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-[var(--text-secondary)]">Gelombang</th>
                <th className="text-left px-5 py-3 font-semibold text-[var(--text-secondary)]">Jenjang</th>
                <th className="text-left px-5 py-3 font-semibold text-[var(--text-secondary)]">Kategori</th>
                <th className="text-left px-5 py-3 font-semibold text-[var(--text-secondary)]">Alur</th>
                <th className="text-left px-5 py-3 font-semibold text-[var(--text-secondary)]">Kuota</th>
                <th className="text-left px-5 py-3 font-semibold text-[var(--text-secondary)]">Status</th>
                <th className="text-right px-5 py-3 font-semibold text-[var(--text-secondary)]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {enriched.map((c: any) => (
                <tr key={c.id} className="border-b border-[var(--border)] hover:bg-white/40 transition-colors">
                  <td className="px-5 py-3">{c.waveName}</td>
                  <td className="px-5 py-3">{c.levelName}</td>
                  <td className="px-5 py-3">{c.categoryName}</td>
                  <td className="px-5 py-3">{c.flowName}</td>
                  <td className="px-5 py-3">{c.quota || '—'}</td>
                  <td className="px-5 py-3">
                    <Badge variant={c.status === 'active' ? 'success' : 'warning'}>{c.status === 'active' ? 'Aktif' : 'Nonaktif'}</Badge>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(c)}><Pencil className="w-4 h-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(c.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Konfigurasi' : 'Tambah Konfigurasi'} size="lg"
        footer={<div className="flex gap-2 justify-end"><Button variant="outline" onClick={() => setModalOpen(false)}>Batal</Button><Button loading={saving} onClick={handleSave}>Simpan</Button></div>}>
        <div className="space-y-4">
          <Select label="Gelombang" value={form.wave_id} onChange={e => setForm({ ...form, wave_id: e.target.value })} options={waveOptions} placeholder="Pilih gelombang" />
          <Select label="Jenjang" value={form.level_id} onChange={e => setForm({ ...form, level_id: e.target.value })} options={levelOptions} placeholder="Pilih jenjang" />
          <Select label="Kategori" value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} options={categoryOptions} placeholder="Pilih kategori" />
          <Select label="Alur Seleksi" value={form.flow_id} onChange={e => setForm({ ...form, flow_id: e.target.value })} options={flowOptions} placeholder="Pilih alur" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Kuota" type="number" value={String(form.quota)} onChange={e => setForm({ ...form, quota: Number(e.target.value) })} />
            <Input label="Jumlah Tahap Pembayaran" type="number" value={String(form.payment_stage_count)} onChange={e => setForm({ ...form, payment_stage_count: Number(e.target.value) })} />
          </div>
          <Select label="Status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} options={[{ value: 'active', label: 'Aktif' }, { value: 'inactive', label: 'Tidak Aktif' }]} />
        </div>
      </Modal>
    </div>
  )
}
