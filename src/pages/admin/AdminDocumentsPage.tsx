import { useState, useEffect } from 'react'
import { Button, Card, Spinner, Badge, Modal, Select, Input } from '../../components/ui'
import { documentService } from '../../services/index'
import { useToast } from '../../components/Toast'
import { CheckCircle, XCircle, Eye, FileText, User, Clock } from 'lucide-react'
import { API_BASE } from '../../api/client'

const STATUS_OPTIONS = [
  { value: 'uploaded', label: 'Menunggu Review' },
  { value: 'verified', label: 'Terverifikasi' },
  { value: 'rejected', label: 'Ditolak' },
]

const STATUS_BADGE: Record<string, 'warning' | 'success' | 'danger'> = {
  uploaded: 'warning',
  verified: 'success',
  rejected: 'danger',
}
const STATUS_LABEL: Record<string, string> = {
  uploaded: 'Menunggu',
  verified: 'Terverifikasi',
  rejected: 'Ditolak',
}

export default function AdminDocumentsPage() {
  const [data, setData] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [filterStatus, setFilterStatus] = useState('uploaded')
  const [loading, setLoading] = useState(true)
  const [reviewModal, setReviewModal] = useState<any>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const PER_PAGE = 20

  useEffect(() => { load() }, [page, filterStatus])

  async function load() {
    setLoading(true)
    try {
      const res = await documentService.getReviewQueue({ status: filterStatus, page, perPage: PER_PAGE })
      setData(res.data || [])
      setTotal(res.total || 0)
    } catch { toast('error', 'Gagal memuat data') }
    finally { setLoading(false) }
  }

  async function handleReview(action: 'verified' | 'rejected') {
    const doc = reviewModal
    if (!doc) return
    if (action === 'rejected' && !rejectReason.trim()) return toast('warning', 'Alasan penolakan wajib diisi')
    setSaving(true)
    try {
      await documentService.reviewDocument(doc.id, { status: action, rejection_reason: action === 'rejected' ? rejectReason : null })
      toast('success', action === 'verified' ? 'Dokumen diverifikasi' : 'Dokumen ditolak')
      setReviewModal(null)
      setRejectReason('')
      load()
    } catch (e: any) { toast('error', e.message) }
    finally { setSaving(false) }
  }

  const totalPages = Math.ceil(total / PER_PAGE)

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="font-[var(--font-heading)] text-2xl font-bold text-[var(--text)]">Verifikasi Dokumen</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Review dokumen pendaftar</p>
      </div>

      <div className="flex justify-between items-center gap-3">
        <Select
          value={filterStatus}
          onChange={e => { setFilterStatus(e.target.value); setPage(1) }}
          options={STATUS_OPTIONS}
          className="w-48"
        />
      </div>

      {data.length === 0 ? (
        <Card className="p-12 text-center text-[var(--text-muted)]">
          <FileText className="w-12 h-12 mx-auto mb-3 text-[var(--border)]" />
          <p>Tidak ada dokumen dengan status "{STATUS_LABEL[filterStatus]}"</p>
        </Card>
      ) : (
        <>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-[var(--border)] overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[var(--accent-subtle)] border-b border-[var(--border)]">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold text-[var(--text-secondary)]">Pendaftar</th>
                  <th className="text-left px-5 py-3 font-semibold text-[var(--text-secondary)]">No. Pendaftaran</th>
                  <th className="text-left px-5 py-3 font-semibold text-[var(--text-secondary)]">Dokumen</th>
                  <th className="text-left px-5 py-3 font-semibold text-[var(--text-secondary)]">Status</th>
                  <th className="text-left px-5 py-3 font-semibold text-[var(--text-secondary)]">Upload</th>
                  <th className="text-right px-5 py-3 font-semibold text-[var(--text-secondary)]">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map((doc: any) => (
                  <tr key={doc.id} className="border-b border-[var(--border)] hover:bg-white/40 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[var(--accent-subtle)] flex items-center justify-center text-xs font-bold text-[var(--accent)]">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-medium">{doc.profile?.full_name || '—'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[var(--text-muted)] text-xs font-mono">{doc.applicant?.registration_number || '—'}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                        <span>{doc.requirement?.name || '—'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={STATUS_BADGE[doc.status]}>{STATUS_LABEL[doc.status]}</Badge>
                    </td>
                    <td className="px-5 py-3 text-[var(--text-muted)] text-xs">
                      <div className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(doc.created_at).toLocaleDateString('id-ID')}</div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Button size="sm" variant="outline" onClick={() => { setReviewModal(doc); setRejectReason('') }}>
                        <Eye className="w-4 h-4" /> Review
                      </Button>
                    </td>
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

      <Modal isOpen={!!reviewModal} onClose={() => { setReviewModal(null); setRejectReason('') }} title="Review Dokumen" size="lg"
        footer={
          reviewModal?.status === 'uploaded' ? (
            <div className="flex gap-2 justify-between w-full">
              <div className="flex gap-2">
                <Button variant="danger" loading={saving} onClick={() => handleReview('rejected')}><XCircle className="w-4 h-4" /> Tolak</Button>
              </div>
              <Button loading={saving} onClick={() => handleReview('verified')}><CheckCircle className="w-4 h-4" /> Verifikasi</Button>
            </div>
          ) : (
            <Button variant="outline" onClick={() => { setReviewModal(null); setRejectReason('') }}>Tutup</Button>
          )
        }>
        {reviewModal && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <label className="text-xs font-medium text-[var(--text-muted)] uppercase">Pendaftar</label>
                <p className="font-medium">{reviewModal.profile?.full_name || '—'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--text-muted)] uppercase">No. Pendaftaran</label>
                <p className="font-mono text-xs">{reviewModal.applicant?.registration_number || '—'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--text-muted)] uppercase">Dokumen</label>
                <p>{reviewModal.requirement?.name || '—'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--text-muted)] uppercase">Format</label>
                <p className="text-xs">{reviewModal.requirement?.file_type || '—'} · Max {reviewModal.requirement?.max_size_mb || '—'}MB</p>
              </div>
            </div>

            {reviewModal.file_url && (
              <div>
                <label className="text-xs font-medium text-[var(--text-muted)] uppercase mb-1 block">Pratinjau</label>
                <div className="border border-[var(--border)] rounded-xl overflow-hidden bg-gray-50">
                  {reviewModal.file_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    <img src={`${API_BASE}${reviewModal.file_url}`} alt="Preview" className="max-h-96 mx-auto object-contain" />
                  ) : (
                    <div className="flex flex-col items-center py-12 text-[var(--text-muted)]">
                      <FileText className="w-10 h-10 mb-2" />
                      <p className="text-sm">Dokumen tidak bisa ditampilkan</p>
                      <a href={`${API_BASE}${reviewModal.file_url}`} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] text-sm mt-1 hover:underline">
                        Buka di tab baru
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {reviewModal.status === 'uploaded' && (
              <Input label="Alasan Penolakan (opsional)" value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Isi jika akan menolak dokumen" />
            )}

            {reviewModal.rejection_reason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
                <label className="text-xs font-semibold text-red-700 uppercase">Alasan Ditolak</label>
                <p className="text-red-600 mt-0.5">{reviewModal.rejection_reason}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
