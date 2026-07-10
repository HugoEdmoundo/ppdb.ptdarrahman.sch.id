import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Spinner, Badge } from '../../components/ui'
import { dashboardService } from '../../services/index'
import { useToast } from '../../components/Toast'
import { ArrowLeft } from 'lucide-react'

const ACTION_LABEL: Record<string, { variant: 'default' | 'info' | 'success' | 'warning' | 'danger'; label: string }> = {
  create: { variant: 'success', label: 'Create' },
  update: { variant: 'info', label: 'Update' },
  delete: { variant: 'danger', label: 'Delete' },
  login: { variant: 'info', label: 'Login' },
  logout: { variant: 'default', label: 'Logout' },
  view: { variant: 'default', label: 'View' },
  approve: { variant: 'success', label: 'Approve' },
  reject: { variant: 'danger', label: 'Reject' },
}

export default function AdminAuditLogPage() {
  const [data, setData] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { toast } = useToast()
  const PER_PAGE = 20

  useEffect(() => { load() }, [page])

  async function load() {
    setLoading(true)
    try {
      const r = await dashboardService.getAuditLogs({ page, perPage: PER_PAGE })
      setData((r as any).data || r || [])
      setTotal((r as any).total || 0)
    } catch { toast('error', 'Gagal memuat') }
    finally { setLoading(false) }
  }

  const totalPages = Math.ceil(total / PER_PAGE)

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}><ArrowLeft className="w-4 h-4" /></Button>
        <div>
          <h1 className="font-[var(--font-heading)] text-2xl font-bold text-[var(--text)]">Audit Log</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Riwayat aktivitas sistem</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : data.length === 0 ? (
        <Card className="p-12 text-center text-[var(--text-muted)]">Belum ada aktivitas tercatat.</Card>
      ) : (
        <>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-[var(--border)] overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[var(--accent-subtle)] border-b">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold">Waktu</th>
                  <th className="text-left px-5 py-3 font-semibold">User</th>
                  <th className="text-left px-5 py-3 font-semibold">Aksi</th>
                  <th className="text-left px-5 py-3 font-semibold">Entitas</th>
                  <th className="text-left px-5 py-3 font-semibold">Detail</th>
                </tr>
              </thead>
              <tbody>
                {data.map((log: any) => {
                  const act = ACTION_LABEL[log.action] || { variant: 'default' as const, label: log.action || '—' }
                  return (
                    <tr key={log.id} className="border-b hover:bg-white/40">
                      <td className="px-5 py-3 text-xs text-[var(--text-muted)]">{log.created_at ? new Date(log.created_at).toLocaleString('id-ID') : '—'}</td>
                      <td className="px-5 py-3 text-xs font-medium">{log.username || log.user_id || '—'}</td>
                      <td className="px-5 py-3"><Badge variant={act.variant}>{act.label}</Badge></td>
                      <td className="px-5 py-3 text-xs">{log.entity_type || '—'}{log.entity_id ? <span className="text-[var(--text-muted)] ml-1">#{log.entity_id.slice(0, 8)}</span> : ''}</td>
                      <td className="px-5 py-3 text-xs text-[var(--text-muted)] max-w-[200px] truncate">{log.details ? (typeof log.details === 'string' ? log.details : JSON.stringify(log.details)) : '—'}</td>
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
    </div>
  )
}
