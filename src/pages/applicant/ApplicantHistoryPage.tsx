import { useState, useEffect } from 'react'
import { Card, Spinner } from '../../components/ui'
import { applicantService } from '../../services/index'
import { useToast } from '../../components/Toast'
import { Clock, ArrowRight } from 'lucide-react'
import { APPLICANT_STATUS_LABELS, APPLICANT_STATUS_COLORS } from '../../utils/constants'

export default function ApplicantHistoryPage() {
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try { setHistory(await applicantService.getStatusHistory()) }
    catch { toast('error', 'Gagal memuat riwayat') }
    finally { setLoading(false) }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="font-[var(--font-heading)] text-xl font-bold text-[var(--text)]">Riwayat Status</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Perubahan status pendaftaran</p>
      </div>

      {history.length === 0 ? (
        <Card className="p-12 text-center text-[var(--text-muted)]">Belum ada riwayat perubahan status.</Card>
      ) : (
        <div className="relative pl-8 border-l-2 border-[var(--border)] ml-4 space-y-6">
          {history.map((h: any, idx: number) => (
            <div key={h.id || idx} className="relative">
              <div className="absolute -left-[2.05rem] top-1 w-3.5 h-3.5 rounded-full border-2 border-white bg-[var(--accent)] shadow-sm" />
              <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-[var(--border)] p-4">
                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-2">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(h.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {h.old_status && (
                    <>
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${APPLICANT_STATUS_COLORS[h.old_status] || 'bg-gray-100 text-gray-700'}`}>
                        {APPLICANT_STATUS_LABELS[h.old_status] || h.old_status}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    </>
                  )}
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${APPLICANT_STATUS_COLORS[h.new_status] || 'bg-gray-100 text-gray-700'}`}>
                    {APPLICANT_STATUS_LABELS[h.new_status] || h.new_status}
                  </span>
                </div>
                {h.notes && <p className="text-sm text-[var(--text-secondary)] mt-2 bg-[var(--accent-subtle)] rounded-lg px-3 py-2">{h.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
