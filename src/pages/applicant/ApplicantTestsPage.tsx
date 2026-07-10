import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Card, Spinner, Badge } from '../../components/ui'
import { selectionService } from '../../services/index'
import { useToast } from '../../components/Toast'
import { Calendar, Clock, MapPin, Trophy, BarChart3 } from 'lucide-react'

type Tab = 'sessions' | 'results'

function tabFromPath(path: string): Tab {
  if (path.includes('/results')) return 'results'
  return 'sessions'
}

export default function ApplicantTestsPage() {
  const location = useLocation()
  const [tab, setTab] = useState<Tab>(() => tabFromPath(location.pathname))

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="font-[var(--font-heading)] text-xl font-bold text-[var(--text)]">Tes & Hasil</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Jadwal tes dan hasil seleksi</p>
      </div>
      <div className="flex gap-1 bg-white/50 rounded-xl p-1 border border-[var(--border)] w-fit">
        {[
          { key: 'sessions', label: 'Jadwal', icon: Calendar },
          { key: 'results', label: 'Hasil', icon: Trophy },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key as Tab)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === key ? 'bg-[var(--accent)] text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>
      {tab === 'sessions' ? <SessionsTab /> : <ResultsTab />}
    </div>
  )
}

function SessionsTab() {
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    selectionService.getMySessions().then(setSessions).catch(() => toast('error', 'Gagal memuat'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <>
      {sessions.length === 0 ? (
        <Card className="p-12 text-center text-[var(--text-muted)]">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-[var(--border)]" />
          <p>Belum ada jadwal tes.</p>
          <p className="text-xs mt-1">Admin akan menjadwalkan tes setelah verifikasi dokumen.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {sessions.map((s: any) => (
            <Card key={s.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-[var(--accent-subtle)]">
                  <Calendar className="w-5 h-5 text-[var(--accent)]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{s.session?.session_name || 'Sesi Tes'}</h3>
                  <p className="text-xs text-[var(--accent)] font-medium mt-0.5">{s.test_type?.name || '—'}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 text-xs text-[var(--text-muted)]">
                    <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{s.session?.test_date?.slice(0, 10)} · {s.session?.start_time} – {s.session?.end_time}</div>
                    <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{s.session?.location || '—'}</div>
                    <div className="flex items-center gap-1.5"><Badge variant={s.session?.status === 'completed' ? 'success' : 'warning'}>{s.session?.status === 'completed' ? 'Selesai' : 'Terjadwal'}</Badge></div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}

function ResultsTab() {
  const [results, setResults] = useState<any[]>([])
  const [graduation, setGraduation] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    Promise.all([
      selectionService.getMyResults().catch(() => []),
      selectionService.getMyGraduation().catch(() => null),
    ]).then(([r, g]) => { setResults(r); setGraduation(g) })
      .catch(() => toast('error', 'Gagal memuat'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="space-y-4">
      {graduation && (
        <Card className="p-4 border-[var(--accent)] bg-[var(--accent-subtle)]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white">
              <Trophy className="w-6 h-6 text-[var(--accent)]" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Status Kelulusan</h3>
              <Badge variant={graduation.is_graduated ? 'success' : 'danger'} className="mt-1">
                {graduation.is_graduated ? 'Lulus' : 'Tidak Lulus'}
              </Badge>
              {graduation.total_score && <span className="text-xs text-[var(--text-muted)] ml-2">Skor: {graduation.total_score}</span>}
              {graduation.graduation_rank && <span className="text-xs text-[var(--text-muted)] ml-2">Rank: #{graduation.graduation_rank}</span>}
            </div>
          </div>
          {graduation.notes && <p className="text-xs text-[var(--text-muted)] mt-2">{graduation.notes}</p>}
        </Card>
      )}

      {results.length === 0 ? (
        <Card className="p-12 text-center text-[var(--text-muted)]">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 text-[var(--border)]" />
          <p>Belum ada hasil tes.</p>
          <p className="text-xs mt-1">Hasil akan muncul setelah tes selesai dinilai.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {results.map((r: any) => (
            <Card key={r.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-[var(--accent-subtle)]">
                  <BarChart3 className="w-5 h-5 text-[var(--accent)]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">Hasil Tes</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-lg font-bold text-[var(--text)]">{r.total_score ?? '—'}</span>
                    <Badge variant={r.is_passed ? 'success' : 'danger'}>
                      {r.is_passed ? 'Lulus' : 'Tidak Lulus'}
                    </Badge>
                  </div>
                  {r.notes && <p className="text-xs text-[var(--text-muted)] mt-1">{r.notes}</p>}
                  {r.scores && r.scores.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {r.scores.map((s: any) => (
                        <div key={s.parameter_id} className="flex items-center justify-between text-xs">
                          <span className="text-[var(--text-muted)]">{s.parameter?.name || s.parameter_id}</span>
                          <span className="font-medium">{s.score}/{s.parameter?.max_score || 100}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
