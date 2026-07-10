import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronDown, ClipboardList, Upload, FileCheck, BookOpen, Laptop, Users } from 'lucide-react'
import SectionTitle from '../../components/shared/SectionTitle'
import VerseStrip from '../../components/shared/VerseStrip'

const steps = [
  { num: '01', icon: ClipboardList, title: 'Registrasi Online', desc: 'Buat akun dan isi formulir pendaftaran secara online melalui portal PPDB.' },
  { num: '02', icon: Upload, title: 'Upload Dokumen', desc: 'Lengkapi dokumen persyaratan dan lakukan pembayaran biaya pendaftaran.' },
  { num: '03', icon: FileCheck, title: 'Seleksi & Pengumuman', desc: 'Ikuti tes seleksi dan tunggu pengumuman hasil penerimaan.' },
]

const programs = [
  { icon: BookOpen, title: 'Program Tahfidz', desc: 'Fokus pada hafalan Al-Quran dengan target 5-15 juz selama masa studi.' },
  { icon: Laptop, title: 'Teknologi Digital', desc: 'Kurikulum teknologi digital modern termasuk coding dan AI.' },
  { icon: Users, title: 'Kepemimpinan', desc: 'Pengembangan karakter dan jiwa kepemimpinan Islami.' },
]

export default function LandingPage() {
  const decorRef1 = useRef<HTMLDivElement>(null)
  const decorRef2 = useRef<HTMLDivElement>(null)

  return (
    <div>
      {/* ── Hero Section ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-[#F7F5F0] via-white to-[#F0EDE4]">
        <div className="absolute inset-0 bg-pattern-dots opacity-[0.15] pointer-events-none" />
        <div ref={decorRef1} className="absolute top-0 right-0 w-1/2 h-full opacity-[0.04] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, var(--color-emerald) 0%, transparent 70%)' }}
        />
        <div ref={decorRef2} className="absolute bottom-0 left-0 w-1/3 h-1/2 opacity-[0.03] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, var(--color-gold) 0%, transparent 70%)' }}
        />
        <div className="absolute top-0 left-0 right-0 verse-strip" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full pt-20 sm:pt-28 pb-16 sm:pb-20">
          <div className="grid lg:grid-cols-12 gap-8 md:gap-12 items-center">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 flex-wrap">
                <span className="w-6 sm:w-8 h-[2px] bg-[var(--accent-gold)]" />
                <span className="text-[10px] sm:text-xs font-[var(--font-heading)] font-semibold uppercase tracking-[0.12em] sm:tracking-[0.15em] text-[var(--accent-gold)]">
                  TAHUN AJARAN 2026/2027
                </span>
                <span className="w-1 h-1 rounded-full bg-[var(--accent-gold)] hidden sm:inline-block" />
                <span className="text-[10px] sm:text-xs font-[var(--font-heading)] font-medium uppercase tracking-[0.08em] sm:tracking-[0.1em] text-[var(--text-muted)] hidden sm:inline">
                  BEKASI, JAWA BARAT
                </span>
              </div>

              <div className="arabic-quote text-lg sm:text-xl md:text-2xl text-[var(--accent-gold)] mb-2 sm:mb-3 opacity-60">
                «رَبِّ زِدْنِي عِلْمًا»
              </div>
              <p className="text-xs sm:text-sm italic text-[var(--text-muted)] mb-4 sm:mb-6">
                "Ya Allah, tambahkanlah aku ilmu" — Thaha 20:114
              </p>

              <h1 className="font-[var(--font-display)] text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-[var(--text)] leading-[1.05] sm:leading-[0.92] mb-4 sm:mb-6 tracking-[-0.04em]">
                Penerimaan<br />
                Peserta Didik<br />
                <span className="text-[var(--accent)]">Baru</span>
              </h1>

              <p className="text-sm sm:text-base md:text-lg text-[var(--text-secondary)] max-w-xl mb-6 sm:mb-8 leading-relaxed">
                Bergabunglah dengan Pesantren Tahfidz Qur'an dan Digital Ar-Rahman. Tempat Al-Quran dan teknologi modern berjalan beriringan.
              </p>

              <div className="flex flex-wrap gap-3 sm:gap-4 mb-8 sm:mb-10">
                <Link to="/auth/register" className="btn-primary gap-2 shadow-md hover:shadow-lg text-xs sm:text-sm px-5 sm:px-8 py-2.5 sm:py-3.5">
                  Daftar Sekarang
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Link>
                <Link to="/info" className="btn-ghost text-xs sm:text-sm px-5 sm:px-8 py-2.5 sm:py-3.5">
                  Informasi PPDB
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 hidden lg:block">
              <div className="relative pl-8">
                <div className="relative">
                  <div className="rounded-2xl overflow-hidden shadow-xl border border-white/60"
                    style={{ transform: 'perspective(1000px) rotateY(-4deg) rotateX(2deg)' }}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1523050854058-8df90110c7f1?q=80&w=2071&auto=format&fit=crop"
                      alt="Students"
                      className="w-full aspect-[4/3] object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center mt-10 sm:mt-16 animate-bounce">
            <span className="text-[10px] sm:text-xs font-[var(--font-heading)] uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[var(--text-muted)] mb-1 sm:mb-2">
              Scroll untuk Info
            </span>
            <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--text-muted)]" />
          </div>
        </div>
      </section>

      <div className="verse-divider" />

      {/* ── Alur Pendaftaran ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
        <SectionTitle
          badge="Alur Pendaftaran"
          title="Langkah Mudah Mendaftar"
          subtitle="Ikuti 3 langkah sederhana untuk menjadi bagian dari keluarga besar Ar-Rahman."
          center
        />
        <div className="grid sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <div key={step.num} className="glass-card p-8 text-center group">
                <div className="w-14 h-14 rounded-2xl bg-[var(--accent-subtle)] flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                  <Icon className="w-7 h-7 text-[var(--accent)]" />
                </div>
                <span className="text-[10px] font-[var(--font-heading)] font-bold uppercase tracking-[0.15em] text-[var(--accent-gold)]">{step.num}</span>
                <h3 className="font-[var(--font-display)] text-xl font-bold text-[var(--text)] mt-2 mb-3">{step.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{step.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      <div className="verse-divider" />

      {/* ── Program ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
        <SectionTitle
          badge="Program Unggulan"
          title="Program Pilihan Kami"
          subtitle="Tiga program unggulan yang akan membentuk generasi hafizh yang melek teknologi."
          center
        />
        <div className="grid sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {programs.map((p) => {
            const Icon = p.icon
            return (
              <div key={p.title} className="solid-card text-center">
                <div className="w-14 h-14 rounded-2xl bg-[var(--accent-subtle)] flex items-center justify-center mx-auto mb-5">
                  <Icon className="w-7 h-7 text-[var(--accent)]" />
                </div>
                <h3 className="font-[var(--font-display)] text-xl font-bold text-[var(--text)] mb-3">{p.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{p.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      <div className="verse-divider" />

      {/* ── CTA ── */}
      <section className="relative overflow-hidden py-20 sm:py-28"
        style={{ background: 'linear-gradient(135deg, var(--color-emerald) 0%, #15803D 100%)' }}
      >
        <div className="absolute inset-0 bg-pattern-dots-gold opacity-[0.08] pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)' }}
        />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="arabic-quote text-xl sm:text-2xl md:text-3xl text-[var(--color-gold-light)] mb-4 opacity-80">
            «وَقُل رَّبِّ زِدْنِي عِلْمًا»
          </div>
          <p className="text-xs sm:text-sm italic text-emerald-200 mb-6">"Dan katakanlah, Ya Allah tambahkanlah ilmu kepadaku"</p>

          <h2 className="font-[var(--font-display)] text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-[1.1] mb-4">
            Siap Bergabung?
          </h2>
          <p className="text-emerald-100 text-sm sm:text-base max-w-lg mx-auto mb-8 leading-relaxed">
            Daftarkan diri Anda sekarang dan mulailah perjalanan menuju generasi hafizh yang melek teknologi.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/auth/register" className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-white text-[var(--accent)] font-bold text-sm rounded-full hover:shadow-xl hover:-translate-y-0.5 transition-all">
              Daftar Sekarang
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/info" className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 border-2 border-white/30 text-white font-semibold text-sm rounded-full hover:bg-white/10 hover:border-white/50 transition-all">
              Pelajari Dulu
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
