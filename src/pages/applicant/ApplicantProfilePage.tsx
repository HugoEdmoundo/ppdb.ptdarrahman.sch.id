import { useState, useEffect } from 'react'
import { Button, Card, Spinner, Badge, Input, Select } from '../../components/ui'
import { applicantService } from '../../services/index'
import { useToast } from '../../components/Toast'
import { Pencil, Save, X, User, GraduationCap } from 'lucide-react'
import { APPLICANT_STATUS_LABELS } from '../../utils/constants'

const GENDER_OPTIONS = [{ value: 'male', label: 'Laki-laki' }, { value: 'female', label: 'Perempuan' }]

export default function ApplicantProfilePage() {
  const [applicant, setApplicant] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<any>({})
  const { toast } = useToast()

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const app = await applicantService.getMyApplication()
      setApplicant(app)
      const p = app.profile || {}
      setForm({ full_name: p.full_name || '', nickname: p.nickname || '', gender: p.gender || '', birth_place: p.birth_place || '', birth_date: p.birth_date?.slice(0, 10) || '', religion: p.religion || '', nationality: p.nationality || '', nik: p.nik || '', nisn: p.nisn || '', phone: p.phone || '', email: p.email || '', address: p.address || '', province: p.province || '', city: p.city || '', district: p.district || '', village: p.village || '', postal_code: p.postal_code || '', previous_school: p.previous_school || '' })
    } catch { toast('error', 'Gagal memuat data') }
    finally { setLoading(false) }
  }

  function startEdit() { setEditing(true) }
  function cancelEdit() { const p = applicant?.profile || {}; setForm({ full_name: p.full_name || '', nickname: p.nickname || '', gender: p.gender || '', birth_place: p.birth_place || '', birth_date: p.birth_date?.slice(0, 10) || '', religion: p.religion || '', nationality: p.nationality || '', nik: p.nik || '', nisn: p.nisn || '', phone: p.phone || '', email: p.email || '', address: p.address || '', province: p.province || '', city: p.city || '', district: p.district || '', village: p.village || '', postal_code: p.postal_code || '', previous_school: p.previous_school || '' }); setEditing(false) }

  async function handleSave() {
    if (!form.full_name) return toast('warning', 'Nama lengkap wajib diisi')
    setSaving(true)
    try {
      await applicantService.updateProfile(form)
      toast('success', 'Profil diperbarui')
      setEditing(false)
      load()
    } catch (e: any) { toast('error', e.message) }
    finally { setSaving(false) }
  }

  const locked = applicant && !['registered', 'document_pending', 'payment_pending'].includes(applicant.current_status)

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  if (!applicant) return <Card className="p-12 text-center text-[var(--text-muted)]">Data tidak ditemukan</Card>

  const profile = applicant.profile
  const Field = ({ label, value }: { label: string; value: any }) => (
    <div>
      <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">{label}</label>
      <p className="text-sm text-[var(--text)] mt-0.5">{value || '—'}</p>
    </div>
  )

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[var(--font-heading)] text-xl font-bold text-[var(--text)]">Profil Pendaftar</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">No: {applicant.registration_number} · <Badge variant="info">{APPLICANT_STATUS_LABELS[applicant.current_status] || applicant.current_status}</Badge></p>
        </div>
        {!locked && !editing && <Button onClick={startEdit} variant="outline"><Pencil className="w-4 h-4" /> Edit</Button>}
      </div>

      {editing ? (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <User className="w-5 h-5 text-[var(--accent)]" />
            <h2 className="font-semibold text-sm">Edit Data Pribadi</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Nama Lengkap *" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
            <Input label="Nama Panggilan" value={form.nickname} onChange={e => setForm({ ...form, nickname: e.target.value })} />
            <Select label="Jenis Kelamin" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} options={GENDER_OPTIONS} />
            <Input label="Agama" value={form.religion} onChange={e => setForm({ ...form, religion: e.target.value })} />
            <Input label="Tempat Lahir" value={form.birth_place} onChange={e => setForm({ ...form, birth_place: e.target.value })} />
            <Input label="Tanggal Lahir" type="date" value={form.birth_date} onChange={e => setForm({ ...form, birth_date: e.target.value })} />
            <Input label="Kebangsaan" value={form.nationality} onChange={e => setForm({ ...form, nationality: e.target.value })} />
            <Input label="NIK" value={form.nik} onChange={e => setForm({ ...form, nik: e.target.value })} />
            <Input label="NISN" value={form.nisn} onChange={e => setForm({ ...form, nisn: e.target.value })} />
            <Input label="Telepon" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            <Input label="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="mt-6 pt-4 border-t border-[var(--border)]">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="w-5 h-5 text-[var(--accent)]" />
              <h2 className="font-semibold text-sm">Data Akademik & Alamat</h2>
            </div>
            <div className="space-y-4">
              <Input label="Alamat *" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Provinsi" value={form.province} onChange={e => setForm({ ...form, province: e.target.value })} />
                <Input label="Kota/Kab" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
                <Input label="Kecamatan" value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} />
                <Input label="Desa/Kel" value={form.village} onChange={e => setForm({ ...form, village: e.target.value })} />
                <Input label="Kode Pos" value={form.postal_code} onChange={e => setForm({ ...form, postal_code: e.target.value })} />
                <Input label="Asal Sekolah" value={form.previous_school} onChange={e => setForm({ ...form, previous_school: e.target.value })} />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-[var(--border)]">
            <Button variant="outline" onClick={cancelEdit}><X className="w-4 h-4" /> Batal</Button>
            <Button loading={saving} onClick={handleSave}><Save className="w-4 h-4" /> Simpan</Button>
          </div>
        </Card>
      ) : (
        <>
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-[var(--accent)]" />
              <h2 className="font-semibold text-sm">Data Pribadi</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <Field label="Nama Lengkap" value={profile?.full_name} />
              <Field label="Nama Panggilan" value={profile?.nickname} />
              <Field label="Jenis Kelamin" value={profile?.gender === 'male' ? 'Laki-laki' : profile?.gender === 'female' ? 'Perempuan' : profile?.gender} />
              <Field label="Agama" value={profile?.religion} />
              <Field label="Tempat Lahir" value={profile?.birth_place} />
              <Field label="Tanggal Lahir" value={profile?.birth_date?.slice(0, 10)} />
              <Field label="Kebangsaan" value={profile?.nationality} />
              <Field label="NIK" value={profile?.nik} />
              <Field label="NISN" value={profile?.nisn} />
              <Field label="Telepon" value={profile?.phone} />
              <Field label="Email" value={profile?.email} />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="w-5 h-5 text-[var(--accent)]" />
              <h2 className="font-semibold text-sm">Data Akademik & Alamat</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Field label="Alamat" value={profile?.address} />
              <Field label="Provinsi" value={profile?.province} />
              <Field label="Kota/Kabupaten" value={profile?.city} />
              <Field label="Kecamatan" value={profile?.district} />
              <Field label="Desa/Kelurahan" value={profile?.village} />
              <Field label="Kode Pos" value={profile?.postal_code} />
              <Field label="Asal Sekolah" value={profile?.previous_school} />
            </div>
          </Card>
          {applicant.level && <Card className="p-6"><div className="flex items-center gap-2 mb-4"><GraduationCap className="w-5 h-5 text-[var(--accent)]" /><h2 className="font-semibold text-sm">Pilihan PPDB</h2></div><div className="grid grid-cols-2 md:grid-cols-4 gap-4"><Field label="Periode" value={applicant.period?.name} /><Field label="Gelombang" value={applicant.wave?.name} /><Field label="Jenjang" value={applicant.level?.name} /><Field label="Kategori" value={applicant.category?.name} /></div></Card>}
          {locked && <p className="text-xs text-[var(--text-muted)] text-center">Profil tidak dapat diubah karena status pendaftaran sudah di tahap lanjut.</p>}
        </>
      )}
    </div>
  )
}
