import { useState, useEffect } from 'react'
import { Button, Card, Spinner, Badge, Modal, Input, Select } from '../../components/ui'
import { applicantService, ppdbService } from '../../services/index'
import { useToast } from '../../components/Toast'
import { Eye, ArrowRight } from 'lucide-react'

const STATUS_LABEL: Record<string, { variant: 'warning' | 'success' | 'danger' | 'default'; label: string }> = {
  registered: { variant: 'warning', label: 'Terdaftar' },
  document_verified: { variant: 'success', label: 'Dokumen Terverifikasi' },
  test_scheduled: { variant: 'default', label: 'Tes Terjadwal' },
  test_completed: { variant: 'default', label: 'Tes Selesai' },
  graduated: { variant: 'success', label: 'Lulus' },
  not_graduated: { variant: 'danger', label: 'Tidak Lulus' },
  payment_verified: { variant: 'success', label: 'Pembayaran Terverifikasi' },
  accepted: { variant: 'success', label: 'Diterima' },
  rejected: { variant: 'danger', label: 'Ditolak' },
  waiting_list: { variant: 'warning', label: 'Daftar Tunggu' },
}

const STATUS_OPTIONS = Object.entries(STATUS_LABEL).map(([value, s]) => ({ value, label: s.label }))

export default function AdminApplicantsPage() {
  const [data, setData] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [periods, setPeriods] = useState<any[]>([])
  const [filterPeriod, setFilterPeriod] = useState('')
  const [detailOpen, setDetailOpen] = useState(false)
  const [detail, setDetail] = useState<any>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [statusNotes, setStatusNotes] = useState('')
  const [statusSubmitting, setStatusSubmitting] = useState(false)
  const { toast } = useToast()
  const PER_PAGE = 20

  useEffect(() => { ppdbService.getAllPeriods().then(setPeriods).catch(() => {}) }, [])
  useEffect(() => { load() }, [page, filterPeriod])

  async function load() {
    setLoading(true)
    try {
      const params: any = { page, perPage: PER_PAGE }
      if (search) params.search = search
      if (filterPeriod) params.period_id = filterPeriod
      const r = await applicantService.getApplicants(params)
      setData((r as any).data || r || [])
      setTotal((r as any).total || 0)
    } catch { toast('error', 'Gagal memuat') }
    finally { setLoading(false) }
  }

  async function openDetail(id: string) {
    setDetailLoading(true)
    setDetailOpen(true)
    try {
      const d = await applicantService.getApplicantDetail(id)
      setDetail(d)
      setNewStatus(d.status || '')
      setStatusNotes('')
    } catch { toast('error', 'Gagal memuat detail') }
    finally { setDetailLoading(false) }
  }

  function handleSearch() { setPage(1); load() }

  async function handleStatusChange() {
    if (!detail || !newStatus) return
    setStatusSubmitting(true)
    try {
      await applicantService.updateApplicantStatus(detail.id, { status: newStatus, notes: statusNotes })
      toast('success', 'Status berhasil diubah')
      setDetailOpen(false)
      setDetail(null)
      load()
    } catch { toast('error', 'Gagal mengubah status') }
    finally { setStatusSubmitting(false) }
  }

  const totalPages = Math.ceil(total / PER_PAGE)
  const periodOptions = periods.map((p: any) => ({ value: p.id, label: p.name }))

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="font-[var(--font-heading)] text-2xl font-bold text-[var(--text)]">Daftar Pendaftar</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Kelola semua pendaftar PPDB</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Input placeholder="Cari nama/email..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} className="max-w-xs" />
          <Button size="sm" onClick={handleSearch}>Cari</Button>
        </div>
        <Select value={filterPeriod} onChange={e => { setFilterPeriod(e.target.value); setPage(1) }} options={[{ value: '', label: 'Semua Periode' }, ...periodOptions]} className="w-48" />
        <span className="text-xs text-[var(--text-muted)]">{total} pendaftar</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : data.length === 0 ? (
        <Card className="p-12 text-center text-[var(--text-muted)]">Belum ada pendaftar.</Card>
      ) : (
        <>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-[var(--border)] overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[var(--accent-subtle)] border-b">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold">No. Pendaftaran</th>
                  <th className="text-left px-5 py-3 font-semibold">Nama</th>
                  <th className="text-left px-5 py-3 font-semibold">Jenjang</th>
                  <th className="text-left px-5 py-3 font-semibold">Gelombang</th>
                  <th className="text-left px-5 py-3 font-semibold">Status</th>
                  <th className="text-left px-5 py-3 font-semibold">Tanggal</th>
                  <th className="text-right px-5 py-3 font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map((a: any) => {
                  const st = STATUS_LABEL[a.status] || { variant: 'default' as const, label: a.status || '—' }
                  return (
                    <tr key={a.id} className="border-b hover:bg-white/40">
                      <td className="px-5 py-3 font-mono text-xs">{a.registration_number || '—'}</td>
                      <td className="px-5 py-3 font-medium">{a.profile?.full_name || a.user?.full_name || '—'}</td>
                      <td className="px-5 py-3 text-xs">{a.education_level?.name || '—'}</td>
                      <td className="px-5 py-3 text-xs">{a.wave?.name || '—'}</td>
                      <td className="px-5 py-3"><Badge variant={st.variant}>{st.label}</Badge></td>
                      <td className="px-5 py-3 text-xs text-[var(--text-muted)]">{a.created_at?.slice(0, 10)}</td>
                      <td className="px-5 py-3 text-right">
                        <Button size="sm" variant="ghost" onClick={() => openDetail(a.id)}><Eye className="w-4 h-4" /></Button>
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

      <Modal isOpen={detailOpen} onClose={() => { setDetailOpen(false); setDetail(null) }} title="Detail Pendaftar" size="lg">
        {detailLoading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : detail ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-[var(--text-muted)]">No. Pendaftaran</label><p className="font-mono text-sm">{detail.registration_number || '—'}</p></div>
              <div><label className="text-xs text-[var(--text-muted)]">Status</label><Badge variant={STATUS_LABEL[detail.status]?.variant || 'default'}>{STATUS_LABEL[detail.status]?.label || detail.status || '—'}</Badge></div>
              <div><label className="text-xs text-[var(--text-muted)]">Periode</label><p className="text-sm">{detail.period?.name || '—'}</p></div>
              <div><label className="text-xs text-[var(--text-muted)]">Gelombang</label><p className="text-sm">{detail.wave?.name || '—'}</p></div>
              <div><label className="text-xs text-[var(--text-muted)]">Jenjang</label><p className="text-sm">{detail.education_level?.name || '—'}</p></div>
              <div><label className="text-xs text-[var(--text-muted)]">Kategori</label><p className="text-sm">{detail.registration_category?.name || '—'}</p></div>
            </div>
            {detail.profile && (
              <div className="border-t pt-3">
                <h4 className="font-semibold text-sm mb-2">Data Pribadi</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs text-[var(--text-muted)]">Nama Lengkap</label><p className="text-sm">{detail.profile.full_name || '—'}</p></div>
                  <div><label className="text-xs text-[var(--text-muted)]">NIK</label><p className="text-sm">{detail.profile.nik || '—'}</p></div>
                  <div><label className="text-xs text-[var(--text-muted)]">Tempat, Tgl Lahir</label><p className="text-sm">{detail.profile.birth_place || '—'}, {detail.profile.birth_date?.slice(0, 10) || '—'}</p></div>
                  <div><label className="text-xs text-[var(--text-muted)]">Jenis Kelamin</label><p className="text-sm">{detail.profile.gender || '—'}</p></div>
                  <div><label className="text-xs text-[var(--text-muted)]">Alamat</label><p className="text-sm">{detail.profile.address || '—'}</p></div>
                  <div><label className="text-xs text-[var(--text-muted)]">Sekolah Asal</label><p className="text-sm">{detail.profile.previous_school || '—'}</p></div>
                </div>
              </div>
            )}
            {detail.status && (
              <div className="border-t pt-3 space-y-3">
                <h4 className="font-semibold text-sm flex items-center gap-2"><ArrowRight className="w-4 h-4" /> Ubah Status</h4>
                <Select value={newStatus} onChange={e => setNewStatus(e.target.value)} options={STATUS_OPTIONS} className="w-full" />
                <Input placeholder="Catatan (opsional)" value={statusNotes} onChange={e => setStatusNotes(e.target.value)} />
                <Button onClick={handleStatusChange} disabled={!newStatus || statusSubmitting || newStatus === detail.status}>
                  {statusSubmitting ? <><Spinner size="sm" /> Menyimpan...</> : 'Simpan Status'}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-[var(--text-muted)]">Gagal memuat data.</p>
        )}
      </Modal>
    </div>
  )
}
