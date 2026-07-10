export const APP_NAME = 'PPDB Ar-Rahman'
export const APP_VERSION = '1.0.0'
export const ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN_PPDB: 'admin_ppdb',
  ADMIN_KEUANGAN: 'admin_keuangan',
  PENGUJI: 'penguji',
  ORANG_TUA: 'orang_tua',
  CALON_MURID: 'calon_murid',
} as const

export const APPLICANT_STATUS = {
  REGISTERED: 'registered',
  PAYMENT_PENDING: 'payment_pending',
  DOCUMENT_PENDING: 'document_pending',
  TESTING: 'testing',
  GRADUATED: 'graduated',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  WAITING_LIST: 'waiting_list',
} as const

export const APPLICANT_STATUS_LABELS: Record<string, string> = {
  registered: 'Terdaftar',
  payment_pending: 'Menunggu Pembayaran',
  document_pending: 'Menunggu Dokumen',
  testing: 'Seleksi',
  graduated: 'Lulus',
  accepted: 'Diterima',
  rejected: 'Ditolak',
  waiting_list: 'Waiting List',
}

export const APPLICANT_STATUS_COLORS: Record<string, string> = {
  registered: 'bg-blue-100 text-blue-800',
  payment_pending: 'bg-yellow-100 text-yellow-800',
  document_pending: 'bg-orange-100 text-orange-800',
  testing: 'bg-purple-100 text-purple-800',
  graduated: 'bg-emerald-100 text-emerald-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  waiting_list: 'bg-gray-100 text-gray-800',
}
