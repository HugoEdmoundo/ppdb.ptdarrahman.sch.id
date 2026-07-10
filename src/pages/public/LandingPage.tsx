import { Link } from 'react-router-dom'
import { APP_NAME } from '../../utils/constants'

export default function LandingPage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-b from-[var(--accent)] to-emerald-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-28 text-center">
          <h1 className="font-[var(--font-heading)] text-4xl md:text-5xl font-bold tracking-tight">Penerimaan Peserta Didik Baru</h1>
          <p className="mt-4 text-lg md:text-xl text-emerald-100 font-[var(--font-display)]">{APP_NAME}</p>
          <p className="mt-2 text-emerald-200 text-sm">Tahun Ajaran 2026/2027</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/auth/register" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-[var(--accent)] font-semibold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.97]">Daftar Sekarang</Link>
            <Link to="/info" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/30 text-white font-semibold text-sm hover:bg-white/10 transition-all active:scale-[0.97]">Informasi PPDB</Link>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[var(--bg)] to-transparent" />
      </section>
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="font-[var(--font-heading)] text-2xl font-bold text-center text-[var(--text)] mb-8">Alur Pendaftaran</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[{ s: '1', t: 'Registrasi Online', d: 'Buat akun dan isi formulir pendaftaran' }, { s: '2', t: 'Upload Dokumen & Bayar', d: 'Lengkapi dokumen dan lakukan pembayaran' }, { s: '3', t: 'Seleksi & Pengumuman', d: 'Ikuti tes seleksi dan tunggu pengumuman' }].map(i => (
            <div key={i.s} className="bg-white/60 backdrop-blur-sm rounded-2xl border border-[var(--border)] p-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[var(--accent-subtle)] flex items-center justify-center mx-auto mb-4 text-[var(--accent)] font-bold text-lg">{i.s}</div>
              <h3 className="font-[var(--font-heading)] font-semibold text-[var(--text)] mb-2">{i.t}</h3>
              <p className="text-sm text-[var(--text-muted)]">{i.d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
