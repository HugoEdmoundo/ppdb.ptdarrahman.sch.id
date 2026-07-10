import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, GraduationCap, Clock, CheckCircle, CreditCard, FileText, BarChart3, Layers, ScrollText } from 'lucide-react'
import { dashboardService } from '../../services/index'
import { useToast } from '../../components/Toast'

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [stats, setStats] = useState<any>(null)
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      dashboardService.getStats(),
      dashboardService.getAuditLogs({ perPage: 10 }).then(r => (r as any).data || r || []).catch(() => []),
    ])
      .then(([s, logs]) => { setStats(s); setAuditLogs(logs) })
      .catch(() => toast('error', 'Gagal memuat data'))
      .finally(() => setLoading(false))
  }, [])

  const statCards = [
    { label: 'Total Pendaftar', value: stats?.total_applicants ?? '—', icon: Users, color: 'bg-blue-500' },
    { label: 'Terdaftar', value: stats?.registered ?? '—', icon: Clock, color: 'bg-amber-500' },
    { label: 'Seleksi', value: stats?.testing ?? '—', icon: GraduationCap, color: 'bg-purple-500' },
    { label: 'Diterima', value: stats?.accepted ?? '—', icon: CheckCircle, color: 'bg-green-500' },
    { label: 'Pembayaran Pending', value: stats?.pending_payments ?? '—', icon: CreditCard, color: 'bg-orange-500' },
    { label: 'Dokumen Pending', value: stats?.pending_documents ?? '—', icon: FileText, color: 'bg-red-500' },
    { label: 'Periode', value: stats?.total_periods ?? '—', icon: BarChart3, color: 'bg-indigo-500' },
    { label: 'Gelombang', value: stats?.total_waves ?? '—', icon: Layers, color: 'bg-teal-500' },
  ]

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="font-[var(--font-heading)] text-2xl font-bold text-[var(--text)]">Dashboard</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Ringkasan data PPDB</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="bg-white/60 rounded-2xl border border-[var(--border)] p-6 animate-pulse">
              <div className="h-4 bg-[var(--border)] rounded w-24 mb-3" />
              <div className="h-8 bg-[var(--border)] rounded w-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((card) => {
            const Icon = card.icon
            return (
              <div key={card.label} className="bg-white/60 backdrop-blur-sm rounded-2xl border border-[var(--border)] p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">{card.label}</span>
                </div>
                <p className="text-3xl font-bold text-[var(--text)] font-[var(--font-heading)]">{card.value}</p>
              </div>
            )
          })}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-[var(--border)] p-6">
          <h2 className="font-[var(--font-heading)] text-base font-bold text-[var(--text)] mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => navigate('/admin/applicants')} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:bg-[var(--accent-hover)] shadow-md active:scale-[0.97] transition-all">
              <Users className="w-4 h-4" /> Kelola Pendaftar
            </button>
            <button onClick={() => navigate('/admin/documents')} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] text-sm font-semibold hover:bg-[var(--accent-subtle)] active:scale-[0.97] transition-all">
              <FileText className="w-4 h-4" /> Verifikasi Dokumen
            </button>
            <button onClick={() => navigate('/admin/payments')} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] text-sm font-semibold hover:bg-[var(--accent-subtle)] active:scale-[0.97] transition-all">
              <CreditCard className="w-4 h-4" /> Pembayaran
            </button>
            <button onClick={() => navigate('/admin/periods')} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] text-sm font-semibold hover:bg-[var(--accent-subtle)] active:scale-[0.97] transition-all">
              <BarChart3 className="w-4 h-4" /> Periode PPDB
            </button>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-[var(--border)] p-6">
          <h2 className="font-[var(--font-heading)] text-base font-bold text-[var(--text)] mb-4 flex items-center gap-2">
            <ScrollText className="w-4 h-4 text-[var(--text-muted)]" /> Aktivitas Terbaru
          </h2>
          {auditLogs.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] text-center py-4">Belum ada aktivitas.</p>
          ) : (
            <div className="space-y-2">
              {auditLogs.map((log: any, idx: number) => (
                <div key={log.id || idx} className="flex items-center justify-between text-sm py-1.5 border-b border-[var(--border)] last:border-0">
                  <div>
                    <span className="font-medium">{log.user_username || log.user_id}</span>
                    <span className="text-[var(--text-muted)] mx-1.5">·</span>
                    <span className="text-[var(--text-muted)]">{log.action}</span>
                    <span className="text-[var(--text-muted)] mx-1.5">·</span>
                    <span className="text-xs text-[var(--text-muted)]">{log.entity_type}</span>
                  </div>
                  <span className="text-xs text-[var(--text-muted)]">{new Date(log.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              ))}
            </div>
          )}
          <div className="mt-3 text-right">
            <button onClick={() => navigate('/admin/audit-log')} className="text-xs text-[var(--accent)] hover:underline">Lihat selengkapnya →</button>
          </div>
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-[var(--border)] p-6">
        <h2 className="font-[var(--font-heading)] text-base font-bold text-[var(--text)] mb-4">System Info</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-[var(--text-muted)] font-medium">Backend API</span>
            <p className="text-[var(--text)] font-mono text-xs mt-1 break-all">https://backend-ptdarrahman.vercel.app</p>
          </div>
          <div>
            <span className="text-[var(--text-muted)] font-medium">Company Profile</span>
            <p className="text-[var(--text)] font-mono text-xs mt-1 break-all">https://ptdarrahman-sch-id.vercel.app</p>
          </div>
          <div>
            <span className="text-[var(--text-muted)] font-medium">API Docs (Swagger)</span>
            <p className="text-[var(--text)] font-mono text-xs mt-1 break-all">https://backend-ptdarrahman.vercel.app/ui</p>
          </div>
          <div>
            <span className="text-[var(--text-muted)] font-medium">API Docs (Scalar)</span>
            <p className="text-[var(--text)] font-mono text-xs mt-1 break-all">https://backend-ptdarrahman.vercel.app/scalar</p>
          </div>
        </div>
      </div>
    </div>
  )
}
