import { useState, useEffect } from 'react'
import { Card, Spinner, Badge, Select } from '../../components/ui'
import { applicantService } from '../../services/index'
import { User, FileText, CreditCard, GraduationCap, CheckCircle2, Circle, ChevronDown } from 'lucide-react'
import { APPLICANT_STATUS_LABELS } from '../../utils/constants'
import { usePermission } from '../../contexts/AuthContext'

export default function ApplicantDashboard() {
  const [applicant, setApplicant] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { isAdmin } = usePermission()
  
  // For Admin Viewer
  const [applicantsList, setApplicantsList] = useState<any[]>([])
  const [selectedApplicantId, setSelectedApplicantId] = useState<string>('')
  const [expandedStages, setExpandedStages] = useState<Record<string, boolean>>({})

  const toggleStage = (id: string) => {
    setExpandedStages(prev => ({ ...prev, [id]: !prev[id] }))
  }

  useEffect(() => {
    if (isAdmin()) {
      applicantService.getApplicants().then((res: any) => {
        const data = res?.data || []
        setApplicantsList(data)
        if (data.length > 0) {
          loadApplicant(data[0].id)
          setSelectedApplicantId(data[0].id)
        } else {
          setLoading(false)
        }
      }).catch(() => setLoading(false))
    } else {
      applicantService.getMyApplication()
        .then(setApplicant)
        .catch((e: any) => setError(e.message === '404' ? 'Anda belum mendaftar PPDB.' : 'Gagal memuat'))
        .finally(() => setLoading(false))
    }
  }, [isAdmin])

  const loadApplicant = (id: string) => {
    setLoading(true)
    applicantService.getApplicantDetail(id)
      .then(setApplicant)
      .catch(() => setError('Gagal memuat detail pendaftar'))
      .finally(() => setLoading(false))
  }

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value
    setSelectedApplicantId(id)
    loadApplicant(id)
  }

  if (loading && !applicant) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  
  if (error && !isAdmin()) return <div className="max-w-xl mx-auto py-12"><Card><p className="text-sm text-gray-500 text-center py-8">{error}</p></Card></div>

  const stages = [
    { id: 'profile', label: 'Profil & Data Diri', icon: User, status: 'completed' },
    { id: 'payment1', label: 'Pembayaran Pendaftaran', icon: CreditCard, status: 'completed' },
    { id: 'document', label: 'Upload Dokumen', icon: FileText, status: 'current' },
    { id: 'test', label: 'Seleksi & Tes', icon: GraduationCap, status: 'pending' },
  ]

  return (
    <div className="space-y-8 animate-fadeIn max-w-3xl mx-auto">
      {isAdmin() && (
        <Card className="p-5 border-l-4 border-l-[var(--accent)] bg-white/50 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Melihat Dashboard Sebagai:</label>
              <Select 
                value={selectedApplicantId} 
                onChange={handleSelectChange}
                options={applicantsList.map(a => ({ value: a.id, label: `${a.registration_number} - ${a.profile?.full_name || 'Tanpa Nama'}` }))}
                className="w-full"
              />
            </div>
            {loading && <Spinner size="sm" />}
          </div>
        </Card>
      )}

      {applicant ? (
        <>
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
            <div>
              <h1 className="text-2xl font-bold font-[var(--font-heading)]">Tahapan Seleksi PPDB</h1>
              <p className="text-sm text-gray-500 mt-1">No: {applicant.registration_number}</p>
            </div>
            <Badge variant="info">{APPLICANT_STATUS_LABELS[applicant.current_status] || applicant.current_status}</Badge>
          </div>

          <div className="relative border-l-2 border-[var(--border)] ml-4 space-y-8 pb-4">
            {stages.map((stage) => {
              const isCompleted = stage.status === 'completed'
              const isCurrent = stage.status === 'current'
              const isExpanded = expandedStages[stage.id] || isCurrent
              return (
                <div key={stage.id} className="relative pl-8">
                  <div className={`absolute -left-[11px] top-1 p-1 rounded-full bg-[var(--bg)] 
                    ${isCompleted ? 'text-green-500' : isCurrent ? 'text-[var(--accent)]' : 'text-gray-300'}`}>
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Circle className={`w-4 h-4 ${isCurrent ? 'fill-current' : ''}`} />}
                  </div>
                  
                  <Card className={`overflow-hidden transition-all duration-200 ${isCurrent ? 'ring-1 ring-[var(--accent)] shadow-md' : 'opacity-80'}`}>
                    <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-black/5" onClick={() => toggleStage(stage.id)}>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isCompleted ? 'bg-green-100 text-green-600' : isCurrent ? 'bg-[var(--accent-subtle)] text-[var(--accent)]' : 'bg-gray-100 text-gray-500'}`}>
                          <stage.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className={`font-semibold ${!isCompleted && !isCurrent ? 'text-gray-500' : ''}`}>{stage.label}</h3>
                          <p className="text-xs text-gray-500">{isCompleted ? 'Sudah Selesai' : isCurrent ? 'Sedang Berjalan' : 'Belum Mulai'}</p>
                        </div>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-gray-400 ${isExpanded ? 'rotate-180' : ''} transition-transform`} />
                    </div>
                    {isExpanded && isCurrent && (
                      <div className="p-4 bg-gray-50 border-t border-[var(--border)] text-sm animate-fadeIn">
                        <p className="text-gray-600 mb-3">Silakan selesaikan tahapan ini untuk melanjutkan ke tahap berikutnya.</p>
                        <button className="px-4 py-2 bg-[var(--accent)] text-white text-xs font-semibold rounded-lg hover:bg-[var(--accent-hover)] transition-all">Lengkapi Sekarang</button>
                      </div>
                    )}
                    {isExpanded && isCompleted && (
                      <div className="p-4 bg-gray-50 border-t border-[var(--border)] text-sm text-gray-600 animate-fadeIn">
                        Detail hasil {stage.label.toLowerCase()} dapat dilihat di sini.
                      </div>
                    )}
                  </Card>
                </div>
              )
            })}
          </div>
        </>
      ) : (
        !loading && <Card className="p-8 text-center text-gray-500">Pilih pendaftar untuk melihat dashboard.</Card>
      )}
    </div>
  )
}
