import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Button, Card, Spinner, Badge, Modal, Input, Select } from '../../components/ui'
import { notifService } from '../../services/index'
import { useToast } from '../../components/Toast'
import { Plus, Send, Bell, Calendar, Clock, Mail } from 'lucide-react'

type Tab = 'templates' | 'send' | 'history' | 'calendar'

function tabFromPath(path: string): Tab {
  if (path.includes('/calendar')) return 'calendar'
  return 'templates'
}

const CHANNEL_OPTIONS = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'Email' },
  { value: 'in_app', label: 'In-App' },
]

const EVENT_TYPES = [
  { value: 'academic', label: 'Akademik' },
  { value: 'registration', label: 'Pendaftaran' },
  { value: 'holiday', label: 'Libur' },
  { value: 'exam', label: 'Ujian' },
  { value: 'event', label: 'Acara' },
  { value: 'other', label: 'Lainnya' },
]

export default function AdminNotificationsPage() {
  const location = useLocation()
  const [tab, setTab] = useState<Tab>(() => tabFromPath(location.pathname))

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="font-[var(--font-heading)] text-2xl font-bold text-[var(--text)]">Notifikasi & Kalender</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Kelola template, kirim notifikasi, dan kalender akademik</p>
      </div>
      <div className="flex gap-1 bg-white/50 rounded-xl p-1 border border-[var(--border)] w-fit flex-wrap">
        {[
          { key: 'templates', label: 'Template', icon: Mail },
          { key: 'send', label: 'Kirim', icon: Send },
          { key: 'history', label: 'Riwayat', icon: Bell },
          { key: 'calendar', label: 'Kalender', icon: Calendar },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key as Tab)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === key ? 'bg-[var(--accent)] text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>
      {tab === 'templates' ? <TemplateTab /> : tab === 'send' ? <SendTab /> : tab === 'history' ? <HistoryTab /> : <CalendarTab />}
    </div>
  )
}

function TemplateTab() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ code: '', name: '', subject: '', body_template: '', channel: 'in_app' })
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => { load() }, [])
  async function load() { setLoading(true); try { setData(await notifService.getTemplates()) } catch { toast('error', 'Gagal memuat') } finally { setLoading(false) } }

  function openCreate() { setForm({ code: '', name: '', subject: '', body_template: '', channel: 'in_app' }); setModalOpen(true) }

  async function handleSave() {
    if (!form.code || !form.name || !form.subject || !form.body_template) return toast('warning', 'Lengkapi semua field')
    setSaving(true)
    try { await notifService.createTemplate(form); toast('success', 'Template dibuat'); setModalOpen(false); load() }
    catch (e: any) { toast('error', e.message) } finally { setSaving(false) }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <>
      <div className="flex justify-end"><Button onClick={openCreate}><Plus className="w-4 h-4" /> Tambah Template</Button></div>
      {data.length === 0 ? <Card className="p-12 text-center text-[var(--text-muted)]">Belum ada template.</Card> : (
        <div className="space-y-3">
          {data.map((t: any) => (
            <Card key={t.id} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-semibold text-[var(--accent)]">{t.code}</span>
                    <Badge variant="default">{t.channel || 'in_app'}</Badge>
                  </div>
                  <h3 className="font-semibold text-sm">{t.name}</h3>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{t.subject}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">{t.body_template}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Tambah Template"
        footer={<div className="flex gap-2 justify-end"><Button variant="outline" onClick={() => setModalOpen(false)}>Batal</Button><Button loading={saving} onClick={handleSave}>Simpan</Button></div>} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Kode" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="welcome" />
            <Select label="Channel" value={form.channel} onChange={e => setForm({ ...form, channel: e.target.value })} options={CHANNEL_OPTIONS} />
          </div>
          <Input label="Nama" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Selamat Datang" />
          <Input label="Subjek" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Body Template</label>
            <textarea value={form.body_template} onChange={e => setForm({ ...form, body_template: e.target.value })} rows={6}
              className="input-field resize-none" placeholder="Gunakan {{nama}}, {{status}} untuk variabel" />
          </div>
        </div>
      </Modal>
    </>
  )
}

function SendTab() {
  const [templates, setTemplates] = useState<any[]>([])
  const [form, setForm] = useState({ user_id: '', template_id: '', title: '', message: '', channel: 'in_app' })
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => { notifService.getTemplates().then(setTemplates).catch(() => {}) }, [])

  function selectTemplate(id: string) {
    const t = templates.find(t => t.id === id)
    if (t) setForm({ ...form, template_id: id, title: t.subject, message: t.body_template, channel: t.channel || 'in_app' })
    else setForm({ ...form, template_id: id })
  }

  async function handleSend() {
    if (!form.user_id || !form.title || !form.message) return toast('warning', 'User ID, judul, dan pesan wajib')
    setSaving(true)
    try { await notifService.sendNotification(form); toast('success', 'Notifikasi dikirim'); setForm({ user_id: '', template_id: '', title: '', message: '', channel: 'in_app' }) }
    catch (e: any) { toast('error', e.message) } finally { setSaving(false) }
  }

  const tplOptions = templates.map((t: any) => ({ value: t.id, label: `${t.code} - ${t.name}` }))

  return (
    <Card className="p-6">
      <div className="space-y-4 max-w-lg">
        <Input label="User ID *" value={form.user_id} onChange={e => setForm({ ...form, user_id: e.target.value })} placeholder="UUID user tujuan" />
        <Select label="Template (opsional)" value={form.template_id} onChange={e => selectTemplate(e.target.value)}
          options={[{ value: '', label: 'Manual' }, ...tplOptions]} />
        <Input label="Judul *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pesan *</label>
          <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={4}
            className="input-field resize-none" />
        </div>
        <Select label="Channel" value={form.channel} onChange={e => setForm({ ...form, channel: e.target.value })} options={CHANNEL_OPTIONS} />
        <Button onClick={handleSend} loading={saving}><Send className="w-4 h-4" /> Kirim Notifikasi</Button>
      </div>
    </Card>
  )
}

function HistoryTab() {
  const [data, setData] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const PER_PAGE = 20

  useEffect(() => { load() }, [page])
  async function load() {
    setLoading(true)
    try { const r = await notifService.getHistory({ page, perPage: PER_PAGE }); setData((r as any).data || r || []); setTotal((r as any).total || 0) }
    catch { toast('error', 'Gagal memuat') }
    finally { setLoading(false) }
  }

  const totalPages = Math.ceil(total / PER_PAGE)

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <>
      {data.length === 0 ? <Card className="p-12 text-center text-[var(--text-muted)]">Belum ada notifikasi.</Card> : (
        <div className="space-y-3">
          {data.map((n: any) => (
            <Card key={n.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${n.is_read ? 'bg-gray-100' : 'bg-[var(--accent-subtle)]'}`}>
                  <Bell className={`w-4 h-4 ${n.is_read ? 'text-gray-400' : 'text-[var(--accent)]'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`text-sm ${n.is_read ? 'font-normal text-[var(--text-muted)]' : 'font-semibold'}`}>{n.title}</h3>
                    <span className="text-xs text-[var(--text-muted)] shrink-0 flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(n.created_at).toLocaleDateString('id-ID')}</span>
                  </div>
                  <p className={`text-xs mt-0.5 ${n.is_read ? 'text-[var(--text-muted)]' : 'text-[var(--text-secondary)]'}`}>{n.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="default">{n.channel || 'in_app'}</Badge>
                    {n.is_read ? <span className="text-xs text-gray-400">Sudah dibaca</span> : <span className="text-xs text-[var(--accent)]">Belum dibaca</span>}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Sebelumnya</Button>
          <span className="text-sm text-[var(--text-muted)]">Halaman {page} dari {totalPages}</span>
          <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Berikutnya</Button>
        </div>
      )}
    </>
  )
}

function CalendarTab() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ period_id: '', title: '', description: '', event_date: '', event_type: 'academic' })
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => { load() }, [])
  async function load() { setLoading(true); try { setEvents(await notifService.getAdminCalendar()) } catch { toast('error', 'Gagal memuat') } finally { setLoading(false) } }

  function openCreate() { setForm({ period_id: '', title: '', description: '', event_date: '', event_type: 'academic' }); setModalOpen(true) }

  async function handleSave() {
    if (!form.title || !form.event_date || !form.period_id) return toast('warning', 'Lengkapi field')
    setSaving(true)
    try { await notifService.createCalendarEvent(form); toast('success', 'Event dibuat'); setModalOpen(false); load() }
    catch (e: any) { toast('error', e.message) } finally { setSaving(false) }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <>
      <div className="flex justify-end"><Button onClick={openCreate}><Plus className="w-4 h-4" /> Tambah Event</Button></div>
      {events.length === 0 ? <Card className="p-12 text-center text-[var(--text-muted)]">Belum ada event kalender.</Card> : (
        <div className="space-y-3">
          {events.map((e: any) => (
            <Card key={e.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="text-center shrink-0 min-w-[3rem]">
                  <p className="text-2xl font-bold text-[var(--accent)]">{new Date(e.event_date).getDate()}</p>
                  <p className="text-xs text-[var(--text-muted)]">{new Date(e.event_date).toLocaleDateString('id-ID', { month: 'short' })}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{e.title}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="default">{e.event_type}</Badge>
                    {e.is_public ? <Badge variant="success">Publik</Badge> : <Badge variant="default">Internal</Badge>}
                  </div>
                  {e.description && <p className="text-xs text-[var(--text-muted)] mt-1">{e.description}</p>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Tambah Event"
        footer={<div className="flex gap-2 justify-end"><Button variant="outline" onClick={() => setModalOpen(false)}>Batal</Button><Button loading={saving} onClick={handleSave}>Simpan</Button></div>}>
        <div className="space-y-4">
          <Input label="Period ID" value={form.period_id} onChange={e => setForm({ ...form, period_id: e.target.value })} placeholder="UUID periode" />
          <Input label="Judul" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <Input label="Tanggal" type="date" value={form.event_date} onChange={e => setForm({ ...form, event_date: e.target.value })} />
          <Select label="Tipe" value={form.event_type} onChange={e => setForm({ ...form, event_type: e.target.value })} options={EVENT_TYPES} />
          <Input label="Deskripsi" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        </div>
      </Modal>
    </>
  )
}
