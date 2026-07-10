import { useState, useEffect } from 'react'
import { Card, Spinner, Button } from '../../components/ui'
import { dashboardService } from '../../services/index'
import { useToast } from '../../components/Toast'
import { Download, Users, CreditCard, GraduationCap, FileCheck, TrendingUp } from 'lucide-react'

const REPORT_TYPES = [
  { key: 'applicants', label: 'Daftar Pendaftar', icon: Users, desc: 'Laporan data pendaftar per periode/gelombang' },
  { key: 'payments', label: 'Rekap Pembayaran', icon: CreditCard, desc: 'Ringkasan pembayaran & status invoice' },
  { key: 'selection', label: 'Hasil Seleksi', icon: GraduationCap, desc: 'Hasil tes & kelulusan' },
  { key: 'documents', label: 'Status Dokumen', icon: FileCheck, desc: 'Kelengkapan dokumen pendaftar' },
  { key: 'summary', label: 'Ringkasan PPDB', icon: TrendingUp, desc: 'Statistik keseluruhan PPDB' },
]

export default function AdminReportsPage() {
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    dashboardService.getReportsSummary()
      .then(setSummary)
      .catch(() => toast('error', 'Gagal memuat ringkasan'))
      .finally(() => setLoading(false))
  }, [])

  function handleExport(type: string) {
    setGenerating(type)
    setTimeout(() => {
      setGenerating(null)
      toast('warning', 'Export belum tersedia. API endpoint perlu ditambahkan.')
    }, 1000)
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="font-[var(--font-heading)] text-2xl font-bold text-[var(--text)]">Laporan</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Ekspor laporan PPDB</p>
      </div>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="p-4 text-center">
            <p className="text-xs text-[var(--text-muted)]">Total Pendaftar</p>
            <p className="text-2xl font-bold text-[var(--text)]">{summary.total_applicants || '—'}</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-xs text-[var(--text-muted)]">Lulus</p>
            <p className="text-2xl font-bold text-green-600">{summary.graduated || '—'}</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-xs text-[var(--text-muted)]">Pembayaran Lunas</p>
            <p className="text-2xl font-bold text-blue-600">{summary.paid_invoices || '—'}</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-xs text-[var(--text-muted)]">Dokumen Lengkap</p>
            <p className="text-2xl font-bold text-amber-600">{summary.verified_documents || '—'}</p>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {REPORT_TYPES.map((r) => {
          const Icon = r.icon
          return (
            <Card key={r.key} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-[var(--accent-subtle)]">
                    <Icon className="w-5 h-5 text-[var(--accent)]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{r.label}</h3>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{r.desc}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" loading={generating === r.key} onClick={() => handleExport(r.key)}>
                  <Download className="w-3 h-3" /> Export
                </Button>
              </div>
            </Card>
          )
        })}
      </div>

      <Card className="p-6 text-center">
        <TrendingUp className="w-12 h-12 mx-auto mb-3 text-[var(--border)]" />
        <p className="text-sm text-[var(--text-muted)]">Export tersedia dalam format CSV. Buka dengan Excel atau Google Sheets.</p>
      </Card>
    </div>
  )
}
