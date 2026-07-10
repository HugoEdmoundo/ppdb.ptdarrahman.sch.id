import { useState, useEffect, useRef } from 'react'
import { Card, Button, Spinner, Badge } from '../../components/ui'
import { documentService } from '../../services/index'
import { useToast } from '../../components/Toast'
import { CheckCircle, Clock, Upload, XCircle, AlertTriangle } from 'lucide-react'

const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
  uploaded: { icon: Clock, color: 'text-yellow-500 bg-yellow-50', label: 'Menunggu Review' },
  verified: { icon: CheckCircle, color: 'text-green-500 bg-green-50', label: 'Terverifikasi' },
  rejected: { icon: XCircle, color: 'text-red-500 bg-red-50', label: 'Ditolak' },
  pending: { icon: AlertTriangle, color: 'text-gray-400 bg-gray-50', label: 'Belum Upload' },
}

export default function ApplicantDocumentsPage() {
  const [checklist, setChecklist] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [activeReqId, setActiveReqId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => { documentService.getChecklist().then(setChecklist).catch(() => toast('error', 'Gagal memuat')).finally(() => setLoading(false)) }, [])

  async function handleUpload() {
    const file = fileRef.current?.files?.[0]; if (!file || !activeReqId) return
    setUploading(activeReqId)
    try { await documentService.uploadDocument(activeReqId, file); toast('success', 'Dokumen diupload'); setChecklist(await documentService.getChecklist()) }
    catch (e: any) { toast('error', e.message) }
    finally { setUploading(null); setActiveReqId(null); if (fileRef.current) fileRef.current.value = '' }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Dokumen Pendaftaran</h1>
      <input ref={fileRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleUpload} />
      {checklist?.summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[{ l: 'Wajib', v: checklist.summary.total_required, c: 'text-blue-700' }, { l: 'Terupload', v: checklist.summary.uploaded, c: 'text-yellow-700' }, { l: 'Terverifikasi', v: checklist.summary.verified, c: 'text-green-700' }, { l: 'Ditolak', v: checklist.summary.rejected, c: 'text-red-700' }].map(s => (<Card key={s.l} className="p-4 text-center"><p className={`text-2xl font-bold ${s.c}`}>{s.v}</p><p className="text-xs text-gray-500">{s.l}</p></Card>))}
        </div>
      )}
      {checklist?.data.map((item: any) => {
        const doc = item.document; const st = doc ? (doc.status === 'uploaded' ? 'uploaded' : doc.status) : 'pending'
        const cfg = statusConfig[st]; const Icon = cfg.icon
        return (
          <Card key={item.requirement.id} className="p-4 mb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${cfg.color}`}><Icon className="w-5 h-5" /></div>
                <div><h3 className="font-medium text-sm">{item.requirement.name}</h3><p className="text-xs text-gray-400">Format: {item.requirement.file_type} · Maks: {item.requirement.max_size_mb}MB</p>{doc?.rejection_reason && <p className="text-xs text-red-600 mt-1">Alasan: {doc.rejection_reason}</p>}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={st === 'verified' ? 'success' : st === 'rejected' ? 'danger' : st === 'uploaded' ? 'warning' : 'default'}>{cfg.label}</Badge>
                {(st === 'pending' || st === 'rejected') && <Button size="sm" variant="outline" loading={uploading === item.requirement.id} onClick={() => { setActiveReqId(item.requirement.id); fileRef.current?.click() }}><Upload className="w-4 h-4" /> Upload</Button>}
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
