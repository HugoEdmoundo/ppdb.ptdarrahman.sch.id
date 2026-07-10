import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, Spinner, Badge } from '../../components/ui'
import { applicantService } from '../../services/index'
import { User, FileText, CreditCard, GraduationCap } from 'lucide-react'
import { APPLICANT_STATUS_LABELS } from '../../utils/constants'

export default function ApplicantDashboard() {
  const [applicant, setApplicant] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    applicantService.getMyApplication().then(setApplicant).catch((e: any) => setError(e.message === '404' ? 'Anda belum mendaftar PPDB.' : 'Gagal memuat')).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  if (error) return <div className="max-w-xl mx-auto py-12"><Card><p className="text-sm text-gray-500 text-center py-8">{error}</p><div className="text-center pb-4"><Link to="/register" className="text-[var(--accent)] font-medium text-sm hover:underline">Daftar PPDB</Link></div></Card></div>
  if (!applicant) return null

  const status = applicant.current_status
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-semibold">Dashboard Pendaftar</h1><p className="text-sm text-gray-500">No: {applicant.registration_number}</p></div>
        <Badge variant="info">{APPLICANT_STATUS_LABELS[status] || status}</Badge>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Profil', href: '/applicant/profile', icon: User },
          { label: 'Dokumen', href: '/applicant/documents', icon: FileText },
          { label: 'Pembayaran', href: '/applicant/payments', icon: CreditCard },
          { label: 'Tes', href: '/applicant/tests', icon: GraduationCap },
        ].map(i => (
          <Link key={i.href} to={i.href}><Card className="p-4 text-center hover:border-[var(--accent)] transition-colors cursor-pointer"><i.icon className="w-6 h-6 mx-auto text-gray-500 mb-2" /><span className="text-sm font-medium">{i.label}</span></Card></Link>
        ))}
      </div>
    </div>
  )
}
