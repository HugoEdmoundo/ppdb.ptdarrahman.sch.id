import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
      <div className="text-center"><h1 className="text-6xl font-bold text-gray-300">403</h1><h2 className="mt-4 text-xl font-semibold">Akses Ditolak</h2><p className="mt-2 text-gray-500">Anda tidak memiliki izin.</p><Link to="/" className="mt-6 inline-block"><Button>Kembali</Button></Link></div>
    </div>
  )
}
