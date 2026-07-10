import { useState, useEffect } from 'react'
import { dashboardService } from '../../services/index'
import { useToast } from '../../components/Toast'
import { Users, GraduationCap, Clock, CheckCircle, CreditCard, FileText, BarChart3, Layers } from 'lucide-react'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    dashboardService.getStats().then(setStats).catch(() => toast('error', 'Gagal memuat')).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" /></div>

  const cards = stats ? [
    { label: 'Total Pendaftar', value: stats.total_applicants, icon: Users, color: 'bg-blue-500' },
    { label: 'Terdaftar', value: stats.registered, icon: Clock, color: 'bg-amber-500' },
    { label: 'Seleksi', value: stats.testing, icon: GraduationCap, color: 'bg-purple-500' },
    { label: 'Diterima', value: stats.accepted, icon: CheckCircle, color: 'bg-green-500' },
    { label: 'Pembayaran Pending', value: stats.pending_payments, icon: CreditCard, color: 'bg-orange-500' },
    { label: 'Dokumen Pending', value: stats.pending_documents, icon: FileText, color: 'bg-red-500' },
    { label: 'Periode', value: stats.total_periods, icon: BarChart3, color: 'bg-indigo-500' },
    { label: 'Gelombang', value: stats.total_waves, icon: Layers, color: 'bg-teal-500' },
  ] : []

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-[var(--font-heading)] text-2xl font-bold text-[var(--text)]">Dashboard</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Ringkasan data PPDB</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(c => (
          <div key={c.label} className="bg-white/60 backdrop-blur-sm rounded-2xl border border-[var(--border)] p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl ${c.color} flex items-center justify-center`}><c.icon className="w-5 h-5 text-white" /></div>
              <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">{c.label}</span>
            </div>
            <p className="text-3xl font-bold text-[var(--text)] font-[var(--font-heading)]">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
