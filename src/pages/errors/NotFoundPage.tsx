import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
      <div className="text-center"><h1 className="text-6xl font-bold text-gray-300">404</h1><h2 className="mt-4 text-xl font-semibold">Halaman Tidak Ditemukan</h2><p className="mt-2 text-gray-500">Halaman yang Anda cari tidak tersedia.</p><Link to="/" className="mt-6 inline-block"><Button>Kembali</Button></Link></div>
    </div>
  )
}
