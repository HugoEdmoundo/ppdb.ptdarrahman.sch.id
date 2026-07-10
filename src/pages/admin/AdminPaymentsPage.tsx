import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Button, Card, Spinner, Badge, Modal, Input, Select } from '../../components/ui'
import { paymentService } from '../../services/index'
import { useToast } from '../../components/Toast'
import { Plus, Pencil, Trash2, CreditCard, Receipt, TicketPercent, CheckCircle, XCircle, Eye } from 'lucide-react'
import { API_BASE } from '../../api/client'

type Tab = 'transactions' | 'invoices' | 'discounts'

function tabFromPath(path: string): Tab {
  if (path.includes('/invoices')) return 'invoices'
  if (path.includes('/discounts')) return 'discounts'
  return 'transactions'
}

const TXN_STATUS: Record<string, { variant: 'warning' | 'success' | 'danger'; label: string }> = {
  pending: { variant: 'warning', label: 'Pending' },
  verified: { variant: 'success', label: 'Terverifikasi' },
  rejected: { variant: 'danger', label: 'Ditolak' },
}

const DISC_TYPES = [
  { value: 'percentage', label: 'Persentase (%)' },
  { value: 'fixed', label: 'Nominal (Rp)' },
]

export default function AdminPaymentsPage() {
  const location = useLocation()
  const [tab, setTab] = useState<Tab>(() => tabFromPath(location.pathname))

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="font-[var(--font-heading)] text-2xl font-bold text-[var(--text)]">Manajemen Pembayaran</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Verifikasi transaksi, kelola invoice & diskon</p>
      </div>
      <div className="flex gap-1 bg-white/50 rounded-xl p-1 border border-[var(--border)] w-fit">
        {[
          { key: 'transactions', label: 'Transaksi', icon: CreditCard },
          { key: 'invoices', label: 'Invoice', icon: Receipt },
          { key: 'discounts', label: 'Diskon', icon: TicketPercent },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key as Tab)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === key ? 'bg-[var(--accent)] text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>
      {tab === 'transactions' ? <TransactionTab /> : tab === 'invoices' ? <InvoiceTab /> : <DiscountTab />}
    </div>
  )
}

function TransactionTab() {
  const [data, setData] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [filterStatus, setFilterStatus] = useState('pending')
  const [loading, setLoading] = useState(true)
  const [reviewModal, setReviewModal] = useState<any>(null)
  const [rejectNotes, setRejectNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const PER_PAGE = 20

  useEffect(() => { load() }, [page, filterStatus])

  async function load() {
    setLoading(true)
    try {
      const res = await paymentService.getTransactions({ status: filterStatus, page, perPage: PER_PAGE })
      setData(res.data || []); setTotal(res.total || 0)
    } catch { toast('error', 'Gagal memuat transaksi') }
    finally { setLoading(false) }
  }

  async function handleVerify(action: 'verified' | 'rejected') {
    if (!reviewModal) return
    setSaving(true)
    try {
      await paymentService.verifyTransaction(reviewModal.id, action, action === 'rejected' ? rejectNotes : undefined)
      toast('success', action === 'verified' ? 'Pembayaran diverifikasi' : 'Transaksi ditolak')
      setReviewModal(null); setRejectNotes(''); load()
    } catch (e: any) { toast('error', e.message) }
    finally { setSaving(false) }
  }

  const totalPages = Math.ceil(total / PER_PAGE)

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <>
      <div className="flex justify-between items-center gap-3">
        <Select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1) }}
          options={[{ value: '', label: 'Semua Status' }, ...Object.entries(TXN_STATUS).map(([v, l]) => ({ value: v, label: l.label }))]} className="w-48" />
      </div>
      {data.length === 0 ? (
        <Card className="p-12 text-center text-[var(--text-muted)]">Tidak ada transaksi.</Card>
      ) : (
        <>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-[var(--border)] overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[var(--accent-subtle)] border-b">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold">No. Transaksi</th>
                  <th className="text-left px-5 py-3 font-semibold">Jumlah</th>
                  <th className="text-left px-5 py-3 font-semibold">Metode</th>
                  <th className="text-left px-5 py-3 font-semibold">Status</th>
                  <th className="text-left px-5 py-3 font-semibold">Tanggal</th>
                  <th className="text-right px-5 py-3 font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map((t: any) => {
                  const st = TXN_STATUS[t.status] || TXN_STATUS.pending
                  return (
                    <tr key={t.id} className="border-b hover:bg-white/40">
                      <td className="px-5 py-3 font-mono text-xs">{t.transaction_number}</td>
                      <td className="px-5 py-3 font-medium">Rp {Number(t.amount).toLocaleString('id-ID')}</td>
                      <td className="px-5 py-3 text-[var(--text-muted)] text-xs">{t.payment_method}</td>
                      <td className="px-5 py-3"><Badge variant={st.variant}>{st.label}</Badge></td>
                      <td className="px-5 py-3 text-[var(--text-muted)] text-xs">{new Date(t.created_at).toLocaleDateString('id-ID')}</td>
                      <td className="px-5 py-3 text-right">
                        <Button size="sm" variant="outline" onClick={() => { setReviewModal(t); setRejectNotes('') }}>
                          <Eye className="w-4 h-4" /> Review
                        </Button>
                      </td>
                    </tr>
                  )
                })}
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
      <Modal isOpen={!!reviewModal} onClose={() => { setReviewModal(null); setRejectNotes('') }} title="Review Transaksi" size="lg"
        footer={
          reviewModal?.status === 'pending' ? (
            <div className="flex gap-2 justify-between w-full">
              <Button variant="danger" loading={saving} onClick={() => handleVerify('rejected')}><XCircle className="w-4 h-4" /> Tolak</Button>
              <Button loading={saving} onClick={() => handleVerify('verified')}><CheckCircle className="w-4 h-4" /> Verifikasi</Button>
            </div>
          ) : <Button variant="outline" onClick={() => { setReviewModal(null); setRejectNotes('') }}>Tutup</Button>
        }>
        {reviewModal && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><label className="text-xs font-medium text-[var(--text-muted)] uppercase">No. Transaksi</label><p className="font-mono">{reviewModal.transaction_number}</p></div>
              <div><label className="text-xs font-medium text-[var(--text-muted)] uppercase">Jumlah</label><p className="font-medium">Rp {Number(reviewModal.amount).toLocaleString('id-ID')}</p></div>
              <div><label className="text-xs font-medium text-[var(--text-muted)] uppercase">Metode</label><p>{reviewModal.payment_method}</p></div>
              <div><label className="text-xs font-medium text-[var(--text-muted)] uppercase">Status</label><Badge variant={TXN_STATUS[reviewModal.status]?.variant}>{TXN_STATUS[reviewModal.status]?.label}</Badge></div>
            </div>
            {reviewModal.payment_proof_url && (
              <div>
                <label className="text-xs font-medium text-[var(--text-muted)] uppercase mb-1 block">Bukti Pembayaran</label>
                <img src={`${API_BASE}${reviewModal.payment_proof_url}`} alt="Bukti" className="max-h-64 rounded-xl border mx-auto" />
              </div>
            )}
            {reviewModal.status === 'pending' && (
              <Input label="Catatan Penolakan (opsional)" value={rejectNotes} onChange={e => setRejectNotes(e.target.value)} placeholder="Isi jika menolak" />
            )}
            {reviewModal.notes && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
                <label className="text-xs font-semibold text-amber-700 uppercase">Catatan</label>
                <p className="text-amber-600 mt-0.5">{reviewModal.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  )
}

function InvoiceTab() {
  return (
    <Card className="p-12 text-center text-[var(--text-muted)]">
      <Receipt className="w-12 h-12 mx-auto mb-3 text-[var(--border)]" />
      <p>Fitur manajemen invoice admin akan tersedia.</p>
      <p className="text-xs mt-1">Generate invoice via applicant detail, pantau dari sini.</p>
    </Card>
  )
}

function DiscountTab() {
  const [discounts, setDiscounts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ code: '', name: '', discount_type: 'percentage', value: 0, is_active: true, valid_from: '', valid_until: '', max_usage: '' })
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => { load() }, [])
  async function load() { setLoading(true); try { setDiscounts(await paymentService.getDiscounts()) } catch { toast('error', 'Gagal memuat') } finally { setLoading(false) } }

  function openCreate() { setEditId(null); setForm({ code: '', name: '', discount_type: 'percentage', value: 0, is_active: true, valid_from: '', valid_until: '', max_usage: '' }); setModalOpen(true) }
  function openEdit(d: any) { setEditId(d.id); setForm({ code: d.code, name: d.name, discount_type: d.discount_type, value: d.value, is_active: !!d.is_active, valid_from: d.valid_from?.slice(0, 10) || '', valid_until: d.valid_until?.slice(0, 10) || '', max_usage: d.max_usage ?? '' }); setModalOpen(true) }

  async function handleSave() {
    if (!form.code || !form.name) return toast('warning', 'Kode dan nama wajib diisi')
    setSaving(true)
    const payload = { ...form, value: Number(form.value), max_usage: form.max_usage ? Number(form.max_usage) : null, valid_from: form.valid_from || null, valid_until: form.valid_until || null }
    try {
      if (editId) { await paymentService.updateDiscount(editId, payload); toast('success', 'Diskon diperbarui') }
      else { await paymentService.createDiscount(payload); toast('success', 'Diskon dibuat') }
      setModalOpen(false); load()
    } catch (e: any) { toast('error', e.message) } finally { setSaving(false) }
  }

  async function handleDelete(id: string) { if (!confirm('Hapus diskon ini?')) return; try { await paymentService.deleteDiscount(id); toast('success', 'Dihapus'); load() } catch (e: any) { toast('error', e.message) } }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <>
      <div className="flex justify-end"><Button onClick={openCreate}><Plus className="w-4 h-4" /> Tambah Diskon</Button></div>
      {discounts.length === 0 ? (
        <Card className="p-12 text-center text-[var(--text-muted)]">Belum ada diskon.</Card>
      ) : (
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-[var(--border)] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[var(--accent-subtle)] border-b">
              <tr><th className="text-left px-5 py-3 font-semibold">Kode</th><th className="text-left px-5 py-3 font-semibold">Nama</th><th className="text-left px-5 py-3 font-semibold">Tipe</th><th className="text-left px-5 py-3 font-semibold">Nilai</th><th className="text-left px-5 py-3 font-semibold">Status</th><th className="text-right px-5 py-3 font-semibold">Aksi</th></tr>
            </thead>
            <tbody>
              {discounts.map((d: any) => (
                <tr key={d.id} className="border-b hover:bg-white/40">
                  <td className="px-5 py-3 font-mono text-xs font-semibold">{d.code}</td>
                  <td className="px-5 py-3">{d.name}</td>
                  <td className="px-5 py-3 text-xs">{d.discount_type === 'percentage' ? 'Persentase' : 'Nominal'}</td>
                  <td className="px-5 py-3">{d.discount_type === 'percentage' ? `${d.value}%` : `Rp ${Number(d.value).toLocaleString('id-ID')}`}</td>
                  <td className="px-5 py-3"><Badge variant={d.is_active ? 'success' : 'default'}>{d.is_active ? 'Aktif' : 'Nonaktif'}</Badge></td>
                  <td className="px-5 py-3 text-right"><div className="flex justify-end gap-1"><Button size="sm" variant="ghost" onClick={() => openEdit(d)}><Pencil className="w-4 h-4" /></Button><Button size="sm" variant="ghost" onClick={() => handleDelete(d.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Diskon' : 'Tambah Diskon'}
        footer={<div className="flex gap-2 justify-end"><Button variant="outline" onClick={() => setModalOpen(false)}>Batal</Button><Button loading={saving} onClick={handleSave}>Simpan</Button></div>}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Kode" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="EARLYBIRD" />
            <Input label="Nama" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Early Bird" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Tipe Diskon" value={form.discount_type} onChange={e => setForm({ ...form, discount_type: e.target.value })} options={DISC_TYPES} />
            <Input label="Nilai" type="number" value={String(form.value)} onChange={e => setForm({ ...form, value: Number(e.target.value) })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Berlaku Dari" type="date" value={form.valid_from} onChange={e => setForm({ ...form, valid_from: e.target.value })} />
            <Input label="Berlaku Sampai" type="date" value={form.valid_until} onChange={e => setForm({ ...form, valid_until: e.target.value })} />
          </div>
          <Input label="Maks. Penggunaan" type="number" value={form.max_usage} onChange={e => setForm({ ...form, max_usage: e.target.value })} placeholder="Kosongkan untuk unlimited" />
        </div>
      </Modal>
    </>
  )
}
