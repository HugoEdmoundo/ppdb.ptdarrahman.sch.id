import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Button, Card, Spinner, Badge, Modal, Input, Select } from '../../components/ui'
import { postService } from '../../services/index'
import { useToast } from '../../components/Toast'
import { Plus, FileText, FileDown, ClipboardList, Calendar, CheckCircle, XCircle, Download, Users, Trash2, Pencil } from 'lucide-react'
import { API_BASE } from '../../api/client'

type Tab = 'mou' | 'acceptance' | 're-registration' | 'mpls'

function tabFromPath(path: string): Tab {
  if (path.includes('/re-registrations')) return 're-registration'
  if (path.includes('/mpls')) return 'mpls'
  if (path.includes('/acceptance')) return 'acceptance'
  return 'mou'
}

export default function AdminPostPage() {
  const location = useLocation()
  const [tab, setTab] = useState<Tab>(() => tabFromPath(location.pathname))

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="font-[var(--font-heading)] text-2xl font-bold text-[var(--text)]">Post-Seleksi</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">MOU, Surat Penerimaan, Daftar Ulang, MPLS</p>
      </div>
      <div className="flex gap-1 bg-white/50 rounded-xl p-1 border border-[var(--border)] w-fit flex-wrap">
        {[
          { key: 'mou', label: 'MOU', icon: FileText },
          { key: 'acceptance', label: 'Surat Penerimaan', icon: FileDown },
          { key: 're-registration', label: 'Daftar Ulang', icon: ClipboardList },
          { key: 'mpls', label: 'MPLS', icon: Calendar },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key as Tab)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === key ? 'bg-[var(--accent)] text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>
      {tab === 'mou' ? <MouTab /> : tab === 'acceptance' ? <AcceptanceTab /> : tab === 're-registration' ? <ReRegTab /> : <MplsTab />}
    </div>
  )
}

function MouTab() {
  const [templates, setTemplates] = useState<any[]>([])
  const [mouList, setMouList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tplModal, setTplModal] = useState(false)
  const [tplForm, setTplForm] = useState({ name: '', description: '', is_active: true })
  const [editId, setEditId] = useState<string | null>(null)
  const [genModal, setGenModal] = useState(false)
  const [genForm, setGenForm] = useState({ applicant_id: '', template_id: '' })
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const [t, m] = await Promise.all([postService.getMouTemplates(), postService.getMouList().catch(() => ({ data: [] }))])
      setTemplates(t); setMouList((m as any).data || m || [])
    } catch { toast('error', 'Gagal memuat') }
    finally { setLoading(false) }
  }

  async function handleSaveTpl() {
    if (!tplForm.name) return toast('warning', 'Nama template wajib')
    setSaving(true)
    try {
      if (editId) { await postService.updateMouTemplate(editId, { ...tplForm, description: tplForm.description || null }); toast('success', 'Template diperbarui') }
      else { await postService.createMouTemplate({ ...tplForm, description: tplForm.description || null }); toast('success', 'Template dibuat') }
      setTplModal(false); setEditId(null); load()
    }
    catch (e: any) { toast('error', e.message) } finally { setSaving(false) }
  }

  async function handleDeleteTemplate(id: string) {
    if (!confirm('Hapus template ini?')) return
    try { await postService.deleteMouTemplate(id); toast('success', 'Template dihapus'); load() }
    catch (e: any) { toast('error', e.message) }
  }

  async function handleDeleteMou(id: string) {
    if (!confirm('Hapus MOU ini?')) return
    try { await postService.deleteMou(id); toast('success', 'MOU dihapus'); load() }
    catch (e: any) { toast('error', e.message) }
  }

  async function handleGenerate() {
    if (!genForm.applicant_id || !genForm.template_id) return toast('warning', 'Lengkapi')
    setSaving(true)
    try { await postService.generateMou(genForm.applicant_id, genForm.template_id); toast('success', 'MOU di-generate'); setGenModal(false); load() }
    catch (e: any) { toast('error', e.message) } finally { setSaving(false) }
  }

  async function handleReview(mouId: string, status: string) {
    try { await postService.reviewMou(mouId, status); toast('success', status === 'approved' ? 'MOU disetujui' : 'MOU ditolak'); load() }
    catch (e: any) { toast('error', e.message) }
  }

  function openCreateTpl() { setEditId(null); setTplForm({ name: '', description: '', is_active: true }); setTplModal(true) }
  function openEditTpl(t: any) { setEditId(t.id); setTplForm({ name: t.name, description: t.description || '', is_active: t.is_active }); setTplModal(true) }

  const tplOptions = templates.filter(t => t.is_active).map((t: any) => ({ value: t.id, label: t.name }))

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <>
      <div className="flex justify-between items-center gap-3">
        <Button variant="outline" onClick={openCreateTpl}><Plus className="w-4 h-4" /> Template</Button>
        <Button onClick={() => { setGenForm({ applicant_id: '', template_id: templates[0]?.id || '' }); setGenModal(true) }}><FileDown className="w-4 h-4" /> Generate MOU</Button>
      </div>
      {templates.length > 0 && (
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-[var(--border)] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[var(--accent-subtle)] border-b">
              <tr><th className="text-left px-5 py-3 font-semibold">Template</th><th className="text-left px-5 py-3 font-semibold">Deskripsi</th><th className="text-left px-5 py-3 font-semibold">Status</th><th className="text-right px-5 py-3 font-semibold">Aksi</th></tr>
            </thead>
            <tbody>
              {templates.map((t: any) => (
                <tr key={t.id} className="border-b hover:bg-white/40">
                  <td className="px-5 py-3 font-medium">{t.name}</td>
                  <td className="px-5 py-3 text-xs text-[var(--text-muted)]">{t.description || '—'}</td>
                  <td className="px-5 py-3">{t.is_active ? <Badge variant="success">Aktif</Badge> : <Badge variant="default">Nonaktif</Badge>}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="outline" onClick={() => openEditTpl(t)}><Pencil className="w-3 h-3" /></Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteTemplate(t.id)}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {mouList.length === 0 ? (
        <Card className="p-12 text-center text-[var(--text-muted)]">Belum ada MOU.</Card>
      ) : (
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-[var(--border)] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[var(--accent-subtle)] border-b">
              <tr><th className="text-left px-5 py-3 font-semibold">Peserta</th><th className="text-left px-5 py-3 font-semibold">Template</th><th className="text-left px-5 py-3 font-semibold">Status</th><th className="text-left px-5 py-3 font-semibold">Tgl Generate</th><th className="text-right px-5 py-3 font-semibold">Aksi</th></tr>
            </thead>
            <tbody>
              {mouList.map((m: any) => (
                <tr key={m.id} className="border-b hover:bg-white/40">
                  <td className="px-5 py-3">{m.applicant?.registration_number || m.applicant_id}</td>
                  <td className="px-5 py-3 text-xs">{templates.find(t => t.id === m.template_id)?.name || '—'}</td>
                  <td className="px-5 py-3">
                    {m.status === 'approved' ? <Badge variant="success">Disetujui</Badge> : m.status === 'rejected' ? <Badge variant="danger">Ditolak</Badge> : m.signed_file_url ? <Badge variant="warning">Menunggu</Badge> : <Badge variant="default">Generated</Badge>}
                  </td>
                  <td className="px-5 py-3 text-xs text-[var(--text-muted)]">{new Date(m.created_at).toLocaleDateString('id-ID')}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      {m.signed_file_url && m.status !== 'approved' && m.status !== 'rejected' && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleReview(m.id, 'approved')}><CheckCircle className="w-3 h-3" /> Setuju</Button>
                          <Button size="sm" variant="outline" onClick={() => handleReview(m.id, 'rejected')}><XCircle className="w-3 h-3" /> Tolak</Button>
                        </>
                      )}
                      <Button size="sm" variant="outline" onClick={() => handleDeleteMou(m.id)}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal isOpen={tplModal} onClose={() => { setTplModal(false); setEditId(null) }} title={editId ? 'Edit Template MOU' : 'Tambah Template MOU'}
        footer={<div className="flex gap-2 justify-end"><Button variant="outline" onClick={() => { setTplModal(false); setEditId(null) }}>Batal</Button><Button loading={saving} onClick={handleSaveTpl}>Simpan</Button></div>}>
        <div className="space-y-4">
          <Input label="Nama Template" value={tplForm.name} onChange={e => setTplForm({ ...tplForm, name: e.target.value })} placeholder="Template MOU 2025" />
          <Input label="Deskripsi" value={tplForm.description} onChange={e => setTplForm({ ...tplForm, description: e.target.value })} />
        </div>
      </Modal>
      <Modal isOpen={genModal} onClose={() => setGenModal(false)} title="Generate MOU"
        footer={<div className="flex gap-2 justify-end"><Button variant="outline" onClick={() => setGenModal(false)}>Batal</Button><Button loading={saving} onClick={handleGenerate}>Generate</Button></div>}>
        <div className="space-y-4">
          <Input label="ID Peserta" value={genForm.applicant_id} onChange={e => setGenForm({ ...genForm, applicant_id: e.target.value })} placeholder="UUID applicant" />
          <Select label="Template" value={genForm.template_id} onChange={e => setGenForm({ ...genForm, template_id: e.target.value })} options={tplOptions} />
        </div>
      </Modal>
    </>
  )
}

function AcceptanceTab() {
  const [letters, setLetters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [applicantId, setApplicantId] = useState('')
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try { const r = await postService.getAcceptanceLetters(); setLetters((r as any).data || r || []) }
    catch { toast('error', 'Gagal memuat') }
    finally { setLoading(false) }
  }

  async function handleGenerate() {
    if (!applicantId) return toast('warning', 'ID peserta wajib')
    setSaving(true)
    try { await postService.generateAcceptanceLetter(applicantId); toast('success', 'Surat penerimaan dibuat'); setModalOpen(false); load() }
    catch (e: any) { toast('error', e.message) } finally { setSaving(false) }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <>
      <div className="flex justify-end"><Button onClick={() => { setApplicantId(''); setModalOpen(true) }}><Plus className="w-4 h-4" /> Generate Surat</Button></div>
      {letters.length === 0 ? (
        <Card className="p-12 text-center text-[var(--text-muted)]">Belum ada surat penerimaan.</Card>
      ) : (
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-[var(--border)] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[var(--accent-subtle)] border-b">
              <tr><th className="text-left px-5 py-3 font-semibold">No. Dokumen</th><th className="text-left px-5 py-3 font-semibold">Peserta</th><th className="text-left px-5 py-3 font-semibold">Tanggal</th><th className="text-right px-5 py-3 font-semibold">Aksi</th></tr>
            </thead>
            <tbody>
              {letters.map((l: any) => (
                <tr key={l.id} className="border-b hover:bg-white/40">
                  <td className="px-5 py-3 font-mono text-xs">{l.letter_number || l.document_number || '—'}</td>
                  <td className="px-5 py-3">{l.applicant?.registration_number || l.applicant_id}</td>
                  <td className="px-5 py-3 text-xs text-[var(--text-muted)]">{new Date(l.issued_date || l.created_at).toLocaleDateString('id-ID')}</td>
                  <td className="px-5 py-3 text-right"><Button size="sm" variant="outline" onClick={() => window.open(API_BASE + l.pdf_url, '_blank')}><Download className="w-3 h-3" /> Download</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Generate Surat Penerimaan"
        footer={<div className="flex gap-2 justify-end"><Button variant="outline" onClick={() => setModalOpen(false)}>Batal</Button><Button loading={saving} onClick={handleGenerate}>Generate</Button></div>}>
        <Input label="ID Peserta" value={applicantId} onChange={e => setApplicantId(e.target.value)} placeholder="UUID applicant" />
      </Modal>
    </>
  )
}

function ReRegTab() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ applicant_id: '', schedule_date: '', status: 'scheduled' })
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try { const r = await postService.getReRegistrations(); setData((r as any).data || r || []) }
    catch { toast('error', 'Gagal memuat') }
    finally { setLoading(false) }
  }

  function openCreate() { setForm({ applicant_id: '', schedule_date: '', status: 'scheduled' }); setModalOpen(true) }

  async function handleSave() {
    if (!form.applicant_id) return toast('warning', 'ID peserta wajib')
    setSaving(true)
    try { await postService.createReRegistration(form); toast('success', 'Jadwal dibuat'); setModalOpen(false); load() }
    catch (e: any) { toast('error', e.message) } finally { setSaving(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm('Hapus jadwal daftar ulang ini?')) return
    try { await postService.deleteReRegistration(id); toast('success', 'Dihapus'); load() }
    catch (e: any) { toast('error', e.message) }
  }

  async function handleMarkAttended(id: string, attended: boolean) {
    try { await postService.updateReRegistration(id, { status: attended ? 'attended' : 'missed' }); toast('success', 'Diperbarui'); load() }
    catch (e: any) { toast('error', e.message) }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <>
      <div className="flex justify-end"><Button onClick={openCreate}><Plus className="w-4 h-4" /> Jadwalkan</Button></div>
      {data.length === 0 ? (
        <Card className="p-12 text-center text-[var(--text-muted)]">Belum ada jadwal daftar ulang.</Card>
      ) : (
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-[var(--border)] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[var(--accent-subtle)] border-b">
              <tr><th className="text-left px-5 py-3 font-semibold">Peserta</th><th className="text-left px-5 py-3 font-semibold">Tanggal</th><th className="text-left px-5 py-3 font-semibold">Status</th><th className="text-right px-5 py-3 font-semibold">Aksi</th></tr>
            </thead>
            <tbody>
              {data.map((r: any) => (
                <tr key={r.id} className="border-b hover:bg-white/40">
                  <td className="px-5 py-3">{r.applicant?.registration_number || r.applicant_id}</td>
                  <td className="px-5 py-3 text-xs">{r.schedule_date?.slice(0, 10) || '—'}</td>
                  <td className="px-5 py-3">
                    {r.status === 'attended' ? <Badge variant="success">Hadir</Badge> : r.status === 'missed' ? <Badge variant="danger">Tidak Hadir</Badge> : <Badge variant="warning">Terjadwal</Badge>}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      {r.status === 'scheduled' && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleMarkAttended(r.id, true)}><CheckCircle className="w-3 h-3" /> Hadir</Button>
                          <Button size="sm" variant="outline" onClick={() => handleMarkAttended(r.id, false)}><XCircle className="w-3 h-3" /> Tdk Hadir</Button>
                        </>
                      )}
                      <Button size="sm" variant="outline" onClick={() => handleDelete(r.id)}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Jadwalkan Daftar Ulang"
        footer={<div className="flex gap-2 justify-end"><Button variant="outline" onClick={() => setModalOpen(false)}>Batal</Button><Button loading={saving} onClick={handleSave}>Simpan</Button></div>}>
        <div className="space-y-4">
          <Input label="ID Peserta" value={form.applicant_id} onChange={e => setForm({ ...form, applicant_id: e.target.value })} placeholder="UUID applicant" />
          <Input label="Tanggal" type="date" value={form.schedule_date} onChange={e => setForm({ ...form, schedule_date: e.target.value })} />
        </div>
      </Modal>
    </>
  )
}

function MplsTab() {
  const [schedules, setSchedules] = useState<any[]>([])
  const [assignments, setAssignments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [schedModal, setSchedModal] = useState(false)
  const [schedForm, setSchedForm] = useState({ title: '', start_date: '', end_date: '', location: '', description: '' })
  const [editId, setEditId] = useState<string | null>(null)
  const [assignModal, setAssignModal] = useState(false)
  const [assignForm, setAssignForm] = useState({ applicant_id: '', schedule_id: '' })
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const [s, a] = await Promise.all([postService.getMplsSchedules(), postService.getMplsList().catch(() => [])])
      setSchedules(s); setAssignments(a || [])
    } catch { toast('error', 'Gagal memuat') }
    finally { setLoading(false) }
  }

  async function handleSaveSched() {
    if (!schedForm.title) return toast('warning', 'Judul wajib')
    setSaving(true)
    try {
      if (editId) { await postService.updateMplsSchedule(editId, schedForm); toast('success', 'Jadwal diperbarui') }
      else { await postService.createMplsSchedule(schedForm); toast('success', 'Jadwal dibuat') }
      setSchedModal(false); setEditId(null); load()
    }
    catch (e: any) { toast('error', e.message) } finally { setSaving(false) }
  }

  async function handleDeleteSched(id: string) {
    if (!confirm('Hapus jadwal MPLS ini?')) return
    try { await postService.deleteMplsSchedule(id); toast('success', 'Jadwal dihapus'); load() }
    catch (e: any) { toast('error', e.message) }
  }

  async function handleDeleteAssignment(id: string) {
    if (!confirm('Batalkan assign peserta ini?')) return
    try { await postService.deleteMplsAssignment(id); toast('success', 'Assignment dihapus'); load() }
    catch (e: any) { toast('error', e.message) }
  }

  async function handleAssign() {
    if (!assignForm.applicant_id || !assignForm.schedule_id) return toast('warning', 'Lengkapi')
    setSaving(true)
    try { await postService.assignMpls(assignForm.applicant_id, assignForm.schedule_id); toast('success', 'Peserta di-assign'); setAssignModal(false); load() }
    catch (e: any) { toast('error', e.message) } finally { setSaving(false) }
  }

  function openCreateSched() { setEditId(null); setSchedForm({ title: '', start_date: '', end_date: '', location: '', description: '' }); setSchedModal(true) }
  function openEditSched(s: any) { setEditId(s.id); setSchedForm({ title: s.title, start_date: s.start_date?.slice(0, 10) || '', end_date: s.end_date?.slice(0, 10) || '', location: s.location || '', description: s.description || '' }); setSchedModal(true) }

  const schedOptions = schedules.map((s: any) => ({ value: s.id, label: s.title }))

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <>
      <div className="flex justify-between items-center gap-3">
        <Button variant="outline" onClick={openCreateSched}><Plus className="w-4 h-4" /> Jadwal MPLS</Button>
        <Button onClick={() => { setAssignForm({ applicant_id: '', schedule_id: schedules[0]?.id || '' }); setAssignModal(true) }}><Users className="w-4 h-4" /> Assign Peserta</Button>
      </div>
      {schedules.length === 0 ? (
        <Card className="p-12 text-center text-[var(--text-muted)]">Belum ada jadwal MPLS.</Card>
      ) : (
        <div className="space-y-3">
          {schedules.map((s: any) => {
            const count = assignments.filter((a: any) => a.mpls_schedule_id === s.id).length
            return (
              <Card key={s.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-sm">{s.title}</h3>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      {s.start_date?.slice(0, 10)} – {s.end_date?.slice(0, 10)}
                      {s.location && ` · ${s.location}`}
                    </p>
                    {s.description && <p className="text-xs text-[var(--text-muted)] mt-0.5">{s.description}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="info">{count} peserta</Badge>
                    <Button size="sm" variant="outline" onClick={() => openEditSched(s)}><Pencil className="w-3 h-3" /></Button>
                    <Button size="sm" variant="outline" onClick={() => handleDeleteSched(s.id)}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
      {assignments.length > 0 && (
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-[var(--border)] overflow-hidden mt-4">
          <table className="w-full text-sm">
            <thead className="bg-[var(--accent-subtle)] border-b">
              <tr><th className="text-left px-5 py-3 font-semibold">Peserta</th><th className="text-left px-5 py-3 font-semibold">Jadwal MPLS</th><th className="text-right px-5 py-3 font-semibold">Aksi</th></tr>
            </thead>
            <tbody>
              {assignments.map((a: any) => (
                <tr key={a.id} className="border-b hover:bg-white/40">
                  <td className="px-5 py-3">{a.applicant_id}</td>
                  <td className="px-5 py-3 text-xs">{schedules.find(s => s.id === a.mpls_schedule_id)?.title || '—'}</td>
                  <td className="px-5 py-3 text-right">
                    <Button size="sm" variant="outline" onClick={() => handleDeleteAssignment(a.id)}><Trash2 className="w-3 h-3" /> Unassign</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal isOpen={schedModal} onClose={() => { setSchedModal(false); setEditId(null) }} title={editId ? 'Edit Jadwal MPLS' : 'Tambah Jadwal MPLS'}
        footer={<div className="flex gap-2 justify-end"><Button variant="outline" onClick={() => { setSchedModal(false); setEditId(null) }}>Batal</Button><Button loading={saving} onClick={handleSaveSched}>Simpan</Button></div>}>
        <div className="space-y-4">
          <Input label="Judul" value={schedForm.title} onChange={e => setSchedForm({ ...schedForm, title: e.target.value })} placeholder="MPLS 2025" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Mulai" type="date" value={schedForm.start_date} onChange={e => setSchedForm({ ...schedForm, start_date: e.target.value })} />
            <Input label="Selesai" type="date" value={schedForm.end_date} onChange={e => setSchedForm({ ...schedForm, end_date: e.target.value })} />
          </div>
          <Input label="Lokasi" value={schedForm.location} onChange={e => setSchedForm({ ...schedForm, location: e.target.value })} />
          <Input label="Deskripsi" value={schedForm.description} onChange={e => setSchedForm({ ...schedForm, description: e.target.value })} />
        </div>
      </Modal>
      <Modal isOpen={assignModal} onClose={() => setAssignModal(false)} title="Assign Peserta MPLS"
        footer={<div className="flex gap-2 justify-end"><Button variant="outline" onClick={() => setAssignModal(false)}>Batal</Button><Button loading={saving} onClick={handleAssign}>Simpan</Button></div>}>
        <div className="space-y-4">
          <Input label="ID Peserta" value={assignForm.applicant_id} onChange={e => setAssignForm({ ...assignForm, applicant_id: e.target.value })} placeholder="UUID applicant" />
          <Select label="Jadwal MPLS" value={assignForm.schedule_id} onChange={e => setAssignForm({ ...assignForm, schedule_id: e.target.value })} options={schedOptions} />
        </div>
      </Modal>
    </>
  )
}
