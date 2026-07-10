import { useState, useEffect } from 'react'
import { Button, Card, Spinner, Badge, Modal, Input } from '../../components/ui'
import { ppdbService } from '../../services/index'
import { useToast } from '../../components/Toast'
import { Plus, Pencil, Trash2, GraduationCap, Tags, GitBranch, GripVertical } from 'lucide-react'

type Tab = 'levels' | 'categories' | 'flows'

export default function LevelsPage() {
  const [tab, setTab] = useState<Tab>('levels')
  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="font-[var(--font-heading)] text-2xl font-bold text-[var(--text)]">Jenjang, Kategori & Alur</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Kelola jenjang pendidikan, kategori pendaftaran, dan alur seleksi</p>
      </div>
      <div className="flex gap-1 bg-white/50 rounded-xl p-1 border border-[var(--border)] w-fit">
        {[
          { key: 'levels', label: 'Jenjang', icon: GraduationCap },
          { key: 'categories', label: 'Kategori', icon: Tags },
          { key: 'flows', label: 'Alur Seleksi', icon: GitBranch },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key as Tab)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === key ? 'bg-[var(--accent)] text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>
      {tab === 'levels' ? <LevelTab /> : tab === 'categories' ? <CategoryTab /> : <FlowTab />}
    </div>
  )
}

function LevelTab() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ code: '', name: '', description: '', sort_order: 0, is_active: true })
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => { load() }, [])

  async function load() { setLoading(true); try { setData(await ppdbService.getLevels()) } catch { toast('error', 'Gagal memuat') } finally { setLoading(false) } }

  function openCreate() { setEditId(null); setForm({ code: '', name: '', description: '', sort_order: 0, is_active: true }); setModalOpen(true) }
  function openEdit(l: any) { setEditId(l.id); setForm({ code: l.code, name: l.name, description: l.description || '', sort_order: l.sort_order || 0, is_active: !!l.is_active }); setModalOpen(true) }

  async function handleSave() {
    if (!form.code || !form.name) return toast('warning', 'Lengkapi code dan nama')
    setSaving(true)
    try {
      if (editId) { await ppdbService.updateLevel(editId, form); toast('success', 'Jenjang diperbarui') }
      else { await ppdbService.createLevel(form); toast('success', 'Jenjang dibuat') }
      setModalOpen(false); load()
    } catch (e: any) { toast('error', e.message) } finally { setSaving(false) }
  }

  async function handleDelete(id: string) { if (!confirm('Hapus jenjang ini?')) return; try { await ppdbService.deleteLevel(id); toast('success', 'Dihapus'); load() } catch (e: any) { toast('error', e.message) } }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <>
      <div className="flex justify-end"><Button onClick={openCreate}><Plus className="w-4 h-4" /> Tambah Jenjang</Button></div>
      {data.length === 0 ? <Card className="p-12 text-center text-[var(--text-muted)]">Belum ada jenjang.</Card> : (
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-[var(--border)] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[var(--accent-subtle)] border-b border-[var(--border)]">
              <tr><th className="text-left px-5 py-3 font-semibold">Kode</th><th className="text-left px-5 py-3 font-semibold">Nama</th><th className="text-left px-5 py-3 font-semibold">Urutan</th><th className="text-left px-5 py-3 font-semibold">Status</th><th className="text-right px-5 py-3 font-semibold">Aksi</th></tr>
            </thead>
            <tbody>
              {data.map((l: any) => (
                <tr key={l.id} className="border-b border-[var(--border)] hover:bg-white/40">
                  <td className="px-5 py-3 font-mono text-xs">{l.code}</td><td className="px-5 py-3 font-medium">{l.name}</td>
                  <td className="px-5 py-3 text-[var(--text-muted)]">{l.sort_order}</td>
                  <td className="px-5 py-3"><Badge variant={l.is_active ? 'success' : 'default'}>{l.is_active ? 'Aktif' : 'Nonaktif'}</Badge></td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(l)}><Pencil className="w-4 h-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(l.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Jenjang' : 'Tambah Jenjang'}
        footer={<div className="flex gap-2 justify-end"><Button variant="outline" onClick={() => setModalOpen(false)}>Batal</Button><Button loading={saving} onClick={handleSave}>Simpan</Button></div>}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Kode" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="sma" />
            <Input label="Urutan" type="number" value={String(form.sort_order)} onChange={e => setForm({ ...form, sort_order: Number(e.target.value) })} />
          </div>
          <Input label="Nama" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="SMA" />
          <Input label="Deskripsi" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Deskripsi (opsional)" />
        </div>
      </Modal>
    </>
  )
}

function CategoryTab() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ code: '', name: '', description: '', is_active: true })
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => { load() }, [])
  async function load() { setLoading(true); try { setData(await ppdbService.getCategories()) } catch { toast('error', 'Gagal memuat') } finally { setLoading(false) } }
  function openCreate() { setEditId(null); setForm({ code: '', name: '', description: '', is_active: true }); setModalOpen(true) }
  function openEdit(c: any) { setEditId(c.id); setForm({ code: c.code, name: c.name, description: c.description || '', is_active: !!c.is_active }); setModalOpen(true) }
  async function handleSave() {
    if (!form.code || !form.name) return toast('warning', 'Lengkapi code dan nama'); setSaving(true)
    try { if (editId) { await ppdbService.updateCategory(editId, form); toast('success', 'Kategori diperbarui') } else { await ppdbService.createCategory(form); toast('success', 'Kategori dibuat') }; setModalOpen(false); load() }
    catch (e: any) { toast('error', e.message) } finally { setSaving(false) }
  }
  async function handleDelete(id: string) { if (!confirm('Hapus kategori ini?')) return; try { await ppdbService.deleteCategory(id); toast('success', 'Dihapus'); load() } catch (e: any) { toast('error', e.message) } }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <>
      <div className="flex justify-end"><Button onClick={openCreate}><Plus className="w-4 h-4" /> Tambah Kategori</Button></div>
      {data.length === 0 ? <Card className="p-12 text-center text-[var(--text-muted)]">Belum ada kategori.</Card> : (
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-[var(--border)] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[var(--accent-subtle)] border-b border-[var(--border)]">
              <tr><th className="text-left px-5 py-3 font-semibold">Kode</th><th className="text-left px-5 py-3 font-semibold">Nama</th><th className="text-left px-5 py-3 font-semibold">Status</th><th className="text-right px-5 py-3 font-semibold">Aksi</th></tr>
            </thead>
            <tbody>
              {data.map((c: any) => (
                <tr key={c.id} className="border-b border-[var(--border)] hover:bg-white/40">
                  <td className="px-5 py-3 font-mono text-xs">{c.code}</td><td className="px-5 py-3 font-medium">{c.name}</td>
                  <td className="px-5 py-3"><Badge variant={c.is_active ? 'success' : 'default'}>{c.is_active ? 'Aktif' : 'Nonaktif'}</Badge></td>
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
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Kategori' : 'Tambah Kategori'}
        footer={<div className="flex gap-2 justify-end"><Button variant="outline" onClick={() => setModalOpen(false)}>Batal</Button><Button loading={saving} onClick={handleSave}>Simpan</Button></div>}>
        <div className="space-y-4">
          <Input label="Kode" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="reguler" />
          <Input label="Nama" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Reguler" />
          <Input label="Deskripsi" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        </div>
      </Modal>
    </>
  )
}

function FlowTab() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', description: '', is_active: true, steps: [] as any[] })
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const STEP_TYPES = [
    { value: 'registration', label: 'Pendaftaran' },
    { value: 'document', label: 'Verifikasi Dokumen' },
    { value: 'payment', label: 'Pembayaran' },
    { value: 'test', label: 'Tes Seleksi' },
    { value: 'interview', label: 'Wawancara' },
    { value: 'announcement', label: 'Pengumuman' },
  ]

  useEffect(() => { load() }, [])
  async function load() { setLoading(true); try { setData(await ppdbService.getFlows()) } catch { toast('error', 'Gagal memuat') } finally { setLoading(false) } }

  function openCreate() { setEditId(null); setForm({ name: '', description: '', is_active: true, steps: [] }); setModalOpen(true) }

  async function openEdit(id: string) {
    try { const f = await ppdbService.getFlow(id); setEditId(id); setForm({ name: f.name, description: f.description || '', is_active: !!f.is_active, steps: (f.steps || []).map((s: any) => ({ ...s, config: typeof s.config === 'string' ? s.config : JSON.stringify(s.config || '') })) }); setModalOpen(true) }
    catch (e: any) { toast('error', e.message) }
  }

  function addStep() { setForm({ ...form, steps: [...form.steps, { sequence: form.steps.length + 1, code: '', name: '', step_type: 'registration', is_required: true, config: '' }] }) }
  function updateStep(idx: number, field: string, value: any) { const s = [...form.steps]; s[idx] = { ...s[idx], [field]: value }; setForm({ ...form, steps: s }) }
  function removeStep(idx: number) { setForm({ ...form, steps: form.steps.filter((_, i) => i !== idx).map((s, i) => ({ ...s, sequence: i + 1 })) }) }

  async function handleSave() {
    if (!form.name) return toast('warning', 'Nama alur wajib diisi')
    const cleanSteps = form.steps.map(s => ({ sequence: s.sequence, code: s.code || `step_${s.sequence}`, name: s.name || `Step ${s.sequence}`, step_type: s.step_type, is_required: s.is_required, config: s.config ? s.config : null }))
    setSaving(true)
    try {
      if (editId) { await ppdbService.updateFlow(editId, { ...form, steps: cleanSteps }); toast('success', 'Alur diperbarui') }
      else { await ppdbService.createFlow({ ...form, steps: cleanSteps }); toast('success', 'Alur dibuat') }
      setModalOpen(false); load()
    } catch (e: any) { toast('error', e.message) } finally { setSaving(false) }
  }

  async function handleDelete(id: string) { if (!confirm('Hapus alur ini?')) return; try { await ppdbService.deleteFlow(id); toast('success', 'Dihapus'); load() } catch (e: any) { toast('error', e.message) } }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <>
      <div className="flex justify-end"><Button onClick={openCreate}><Plus className="w-4 h-4" /> Tambah Alur</Button></div>
      {data.length === 0 ? <Card className="p-12 text-center text-[var(--text-muted)]">Belum ada alur seleksi.</Card> : (
        <div className="space-y-3">
          {data.map((f: any) => (
            <Card key={f.id} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm">{f.name}</h3>
                    <Badge variant={f.is_active ? 'success' : 'default'}>{f.is_active ? 'Aktif' : 'Nonaktif'}</Badge>
                  </div>
                  {f.description && <p className="text-xs text-[var(--text-muted)]">{f.description}</p>}
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(f.id)}><Pencil className="w-4 h-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(f.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Alur Seleksi' : 'Tambah Alur Seleksi'} size="lg"
        footer={<div className="flex gap-2 justify-end"><Button variant="outline" onClick={() => setModalOpen(false)}>Batal</Button><Button loading={saving} onClick={handleSave}>Simpan</Button></div>}>
        <div className="space-y-4">
          <Input label="Nama Alur" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Alur Standar" />
          <Input label="Deskripsi" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[var(--text)]">Tahapan</label>
              <Button size="sm" variant="outline" onClick={addStep}><Plus className="w-3 h-3" /> Tambah Tahap</Button>
            </div>
            {form.steps.length === 0 ? <p className="text-xs text-[var(--text-muted)] py-4 text-center">Belum ada tahapan. Tambahkan tahapan seleksi.</p> : (
              <div className="space-y-2">
                {form.steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-3 bg-white/40 rounded-xl border border-[var(--border)]">
                    <GripVertical className="w-4 h-4 text-[var(--text-muted)] mt-2 shrink-0" />
                    <div className="grid grid-cols-12 gap-2 flex-1">
                      <Input className="col-span-2" placeholder="Seq" type="number" value={String(step.sequence)} onChange={e => updateStep(idx, 'sequence', Number(e.target.value))} />
                      <Input className="col-span-2" placeholder="Kode" value={step.code} onChange={e => updateStep(idx, 'code', e.target.value)} />
                      <Input className="col-span-4" placeholder="Nama tahap" value={step.name} onChange={e => updateStep(idx, 'name', e.target.value)} />
                      <div className="col-span-3">
                        <select value={step.step_type} onChange={e => updateStep(idx, 'step_type', e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-white border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] outline-none">
                          {STEP_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                      </div>
                      <Button size="sm" variant="ghost" className="col-span-1" onClick={() => removeStep(idx)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  )
}
