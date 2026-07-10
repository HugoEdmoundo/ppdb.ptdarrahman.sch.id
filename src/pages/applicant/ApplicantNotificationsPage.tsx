import { useState, useEffect } from 'react'
import { Button, Card, Spinner } from '../../components/ui'
import { notifService } from '../../services/index'
import { useToast } from '../../components/Toast'
import { Bell, Clock, CheckCheck } from 'lucide-react'

export default function ApplicantNotificationsPage() {
  const [notifs, setNotifs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try { setNotifs(await notifService.getMyNotifications()) }
    catch { toast('error', 'Gagal memuat notifikasi') }
    finally { setLoading(false) }
  }

  async function handleMarkRead(id: string) {
    try { await notifService.markRead(id); setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n)) }
    catch { toast('error', 'Gagal') }
  }

  const unread = notifs.filter(n => !n.is_read).length

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[var(--font-heading)] text-xl font-bold text-[var(--text)]">Notifikasi</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">{unread > 0 ? `${unread} belum dibaca` : 'Semua sudah dibaca'}</p>
        </div>
        {unread > 0 && (
          <Button size="sm" variant="outline" onClick={() => notifs.forEach(n => !n.is_read && handleMarkRead(n.id))}>
            <CheckCheck className="w-4 h-4" /> Tandai Semua Dibaca
          </Button>
        )}
      </div>

      {notifs.length === 0 ? (
        <Card className="p-12 text-center text-[var(--text-muted)]">
          <Bell className="w-12 h-12 mx-auto mb-3 text-[var(--border)]" />
          <p>Belum ada notifikasi.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifs.map((n: any) => (
            <div key={n.id} className={`p-4 cursor-pointer transition-colors bg-white/60 backdrop-blur-sm rounded-xl border border-[var(--border)] ${n.is_read ? 'opacity-60' : 'hover:border-[var(--accent)]'}`}
              onClick={() => !n.is_read && handleMarkRead(n.id)}>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg shrink-0 ${n.is_read ? 'bg-gray-100' : 'bg-[var(--accent-subtle)]'}`}>
                  <Bell className={`w-4 h-4 ${n.is_read ? 'text-gray-400' : 'text-[var(--accent)]'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`text-sm ${n.is_read ? 'font-normal text-[var(--text-muted)]' : 'font-semibold'}`}>{n.title}</h3>
                    <span className="text-xs text-[var(--text-muted)] shrink-0 flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(n.created_at).toLocaleDateString('id-ID')}</span>
                  </div>
                  <p className={`text-xs mt-0.5 ${n.is_read ? 'text-[var(--text-muted)]' : 'text-[var(--text-secondary)]'}`}>{n.message}</p>
                </div>
                {!n.is_read && <div className="w-2 h-2 rounded-full bg-[var(--accent)] shrink-0 mt-1.5" />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
