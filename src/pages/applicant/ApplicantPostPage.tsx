import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { Button, Card, Spinner, Badge } from '../../components/ui'
import { postService } from '../../services/index'
import { useToast } from '../../components/Toast'
import { FileText, FileDown, ClipboardList, Calendar, CheckCircle, XCircle, Upload, Download, Clock, MapPin } from 'lucide-react'

type Tab = 'mou' | 'acceptance' | 're-registration' | 'mpls'

function tabFromPath(path: string): Tab {
  if (path.includes('/re-registration')) return 're-registration'
  if (path.includes('/mpls')) return 'mpls'
  if (path.includes('/acceptance')) return 'acceptance'
  return 'mou'
}

export default function ApplicantPostPage() {
  const location = useLocation()
  const [tab, setTab] = useState<Tab>(() => tabFromPath(location.pathname))

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="font-[var(--font-heading)] text-xl font-bold text-[var(--text)]">Informasi Pasca Seleksi</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">MOU, Surat Penerimaan, Daftar Ulang, MPLS</p>
      </div>
      <div className="flex gap-1 bg-white/50 rounded-xl p-1 border border-[var(--border)] w-fit flex-wrap">
        {[
          { key: 'mou', label: 'MOU', icon: FileText },
          { key: 'acceptance', label: 'Surat Penerimaan', icon: FileDown },
          { key: 're-registration', label: 'Daftar Ulang', icon: ClipboardList },
          { key: 'mpls', label: 'MPLS', icon: Calendar },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key as Tab)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === key ? 'bg-[var(--accent)] text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>
      {tab === 'mou' ? <MouTab /> : tab === 'acceptance' ? <AcceptanceTab /> : tab === 're-registration' ? <ReRegTab /> : <MplsTab />}
    </div>
  )
}

function MouTab() {
  const [mou, setMou] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    postService.getMyMou().then(setMou).catch(() => setMou(null)).finally(() => setLoading(false))
  }, [])

  async function handleUpload() {
    const file = fileRef.current?.files?.[0]
    if (!file) return toast('warning', 'Pilih file')
    setUploading(true)
    try { await postService.signMou(mou.id, file); toast('success', 'MOU diupload'); const m = await postService.getMyMou(); setMou(m) }
    catch (e: any) { toast('error', e.message) }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = '' }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <>
      <input ref={fileRef} type="file" className="hidden" accept=".pdf" onChange={handleUpload} />
      {!mou ? (
        <Card className="p-12 text-center text-[var(--text-muted)]">MOU belum tersedia. Admin akan membuatnya setelah kelulusan.</Card>
      ) : (
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-[var(--accent)]" />
                <h2 className="font-semibold text-sm">Memorandum of Understanding</h2>
              </div>
              <div className="text-xs text-[var(--text-muted)] space-y-1">
                <p>Status: {
                  mou.status === 'approved' ? <Badge variant="success">Disetujui</Badge> :
                  mou.status === 'rejected' ? <Badge variant="danger">Ditolak</Badge> :
                  mou.signed_file_url ? <Badge variant="warning">Menunggu Review</Badge> :
                  <Badge variant="default">Generated</Badge>
                }</p>
                {mou.generated_file_url && <a href={mou.generated_file_url} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline"><Download className="w-3 h-3 inline" /> Download MOU</a>}
              </div>
            </div>
            {mou.status !== 'approved' && (
              <Button onClick={() => fileRef.current?.click()} loading={uploading} size="sm"><Upload className="w-4 h-4" /> Upload TTD</Button>
            )}
          </div>
        </Card>
      )}
    </>
  )
}

function AcceptanceTab() {
  const [letter, setLetter] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    postService.getMyAcceptanceLetter().then(setLetter).catch(() => setLetter(null)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <>
      {!letter ? (
        <Card className="p-12 text-center text-[var(--text-muted)]">Surat penerimaan belum tersedia.</Card>
      ) : (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <FileDown className="w-5 h-5 text-[var(--accent)]" />
            <h2 className="font-semibold text-sm">Surat Penerimaan</h2>
          </div>
          <div className="text-xs text-[var(--text-muted)] space-y-1">
            <p>No. Dokumen: <span className="font-mono">{letter.document_number || '—'}</span></p>
            <p>Tanggal: {new Date(letter.created_at).toLocaleDateString('id-ID')}</p>
          </div>
          {letter.file_url && <a href={letter.file_url} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] text-sm mt-2 inline-flex items-center gap-1 hover:underline"><Download className="w-3 h-3" /> Download</a>}
        </Card>
      )}
    </>
  )
}

function ReRegTab() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    postService.getMyReRegistration().then(setData).catch(() => setData(null)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <>
      {!data ? (
        <Card className="p-12 text-center text-[var(--text-muted)]">Belum ada jadwal daftar ulang.</Card>
      ) : (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <ClipboardList className="w-5 h-5 text-[var(--accent)]" />
            <h2 className="font-semibold text-sm">Daftar Ulang</h2>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-[var(--text-muted)]" />
              <span>{data.schedule_date?.slice(0, 10) ? new Date(data.schedule_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}</span>
            </div>
            {data.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-[var(--text-muted)]" />
                <span>{data.location}</span>
              </div>
            )}
            <div className="pt-2">
              {data.status === 'attended' ? <Badge variant="success"><CheckCircle className="w-3 h-3 inline" /> Sudah Hadir</Badge> :
               data.status === 'missed' ? <Badge variant="danger"><XCircle className="w-3 h-3 inline" /> Tidak Hadir</Badge> :
               <Badge variant="warning">Terjadwal</Badge>}
            </div>
          </div>
        </Card>
      )}
    </>
  )
}

function MplsTab() {
  const [mpls, setMpls] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    postService.getMyMpls().then(setMpls).catch(() => setMpls([])).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <>
      {mpls.length === 0 ? (
        <Card className="p-12 text-center text-[var(--text-muted)]">Belum di-assign ke jadwal MPLS.</Card>
      ) : (
        <div className="space-y-3">
          {mpls.map((m: any, idx: number) => (
            <Card key={m.id || idx} className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-[var(--accent-subtle)]">
                  <Calendar className="w-5 h-5 text-[var(--accent)]" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{m.schedule?.title || m.title || 'MPLS'}</h3>
                  <div className="text-xs text-[var(--text-muted)] mt-1 space-y-0.5">
                    <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> {m.schedule?.start_date?.slice(0, 10) || m.start_date?.slice(0, 10)} – {m.schedule?.end_date?.slice(0, 10) || m.end_date?.slice(0, 10)}</div>
                    {(m.schedule?.location || m.location) && <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {m.schedule?.location || m.location}</div>}
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
