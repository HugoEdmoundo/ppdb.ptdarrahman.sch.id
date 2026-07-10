import { useState, useEffect, useRef } from 'react'
import { Button, Card, Spinner, Badge, Modal, Input } from '../../components/ui'
import { paymentService } from '../../services/index'
import { useToast } from '../../components/Toast'
import { Upload, Receipt, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

const INV_BADGE: Record<string, { variant: 'warning' | 'success' | 'danger' | 'default'; label: string; icon: any }> = {
  unpaid: { variant: 'warning', label: 'Belum Bayar', icon: AlertTriangle },
  partial: { variant: 'warning', label: 'Cicilan', icon: Clock },
  paid: { variant: 'success', label: 'Lunas', icon: CheckCircle },
  cancelled: { variant: 'danger', label: 'Dibatalkan', icon: XCircle },
  overdue: { variant: 'danger', label: 'Jatuh Tempo', icon: AlertTriangle },
}

export default function ApplicantPaymentsPage() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [payModal, setPayModal] = useState<any>(null)
  const [payAmount, setPayAmount] = useState('')
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try { setInvoices(await paymentService.getMyInvoices()) }
    catch { toast('error', 'Gagal memuat invoice') }
    finally { setLoading(false) }
  }

  function openPay(invoice: any) {
    setPayModal(invoice)
    setPayAmount(String(invoice.total_amount || invoice.amount || 0))
  }

  async function handlePay() {
    const file = fileRef.current?.files?.[0]
    if (!file) return toast('warning', 'Pilih file bukti pembayaran')
    const amount = Number(payAmount)
    if (!amount || amount <= 0) return toast('warning', 'Jumlah tidak valid')
    setSaving(true)
    try {
      await paymentService.submitPayment(payModal.id, amount, file)
      toast('success', 'Pembayaran dikirim. Menunggu verifikasi.')
      setPayModal(null); load()
    } catch (e: any) { toast('error', e.message) }
    finally { setSaving(false) }
  }

  const totalInvoice = invoices.reduce((sum, inv) => sum + (Number(inv.total_amount) || Number(inv.amount) || 0), 0)
  const paidInvoice = invoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + (Number(inv.total_amount) || Number(inv.amount) || 0), 0)

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="font-[var(--font-heading)] text-xl font-bold text-[var(--text)]">Pembayaran</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Kelola invoice dan pembayaran PPDB</p>
      </div>

      {invoices.length === 0 ? (
        <Card className="p-12 text-center text-[var(--text-muted)]">
          <Receipt className="w-12 h-12 mx-auto mb-3 text-[var(--border)]" />
          <p>Belum ada invoice.</p>
          <p className="text-xs mt-1">Invoice akan dibuat setelah admin mengkonfigurasi pembayaran.</p>
        </Card>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Card className="p-4 text-center">
              <p className="text-xs text-[var(--text-muted)]">Total Tagihan</p>
              <p className="text-xl font-bold text-[var(--text)]">Rp {totalInvoice.toLocaleString('id-ID')}</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-xs text-[var(--text-muted)]">Sudah Dibayar</p>
              <p className="text-xl font-bold text-green-600">Rp {paidInvoice.toLocaleString('id-ID')}</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-xs text-[var(--text-muted)]">Sisa</p>
              <p className="text-xl font-bold text-red-600">Rp {(totalInvoice - paidInvoice).toLocaleString('id-ID')}</p>
            </Card>
          </div>

          {/* Invoice List */}
          <div className="space-y-3">
            {invoices.map((inv: any) => {
              const cfg = INV_BADGE[inv.status] || INV_BADGE.unpaid
              const StatusIcon = cfg.icon
              return (
                <Card key={inv.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Receipt className="w-4 h-4 text-[var(--text-muted)]" />
                        <span className="font-mono text-xs text-[var(--text-muted)]">{inv.invoice_number}</span>
                        <Badge variant={cfg.variant}><StatusIcon className="w-3 h-3 inline mr-0.5" />{cfg.label}</Badge>
                      </div>
                      <p className="text-sm text-[var(--text-secondary)]">{inv.stage?.name || 'Tahap Pembayaran'}</p>
                      <p className="text-lg font-bold mt-1">Rp {Number(inv.total_amount || inv.amount).toLocaleString('id-ID')}</p>
                      {inv.due_date && (
                        <p className="text-xs text-[var(--text-muted)] mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Jatuh tempo: {new Date(inv.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      )}
                      {inv.transactions?.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {inv.transactions.map((txn: any) => {
                            const tst = txn.status === 'verified' ? { variant: 'success' as const, label: 'Terverifikasi' } :
                              txn.status === 'rejected' ? { variant: 'danger' as const, label: 'Ditolak' } :
                              { variant: 'warning' as const, label: 'Menunggu' }
                            return (
                              <div key={txn.id} className="flex items-center gap-2 text-xs">
                                <Badge variant={tst.variant}>{tst.label}</Badge>
                                <span className="text-[var(--text-muted)]">Rp {Number(txn.amount).toLocaleString('id-ID')} via {txn.payment_method}</span>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                    {inv.status !== 'paid' && inv.status !== 'cancelled' && (
                      <Button size="sm" onClick={() => openPay(inv)}><Upload className="w-4 h-4" /> Bayar</Button>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        </>
      )}

      <input ref={fileRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={() => {}} />

      <Modal isOpen={!!payModal} onClose={() => { setPayModal(null); setPayAmount('') }} title="Upload Pembayaran"
        footer={<div className="flex gap-2 justify-end"><Button variant="outline" onClick={() => { setPayModal(null); setPayAmount('') }}>Batal</Button><Button loading={saving} onClick={handlePay}><Upload className="w-4 h-4" /> Kirim</Button></div>}>
        {payModal && (
          <div className="space-y-4">
            <div className="bg-[var(--accent-subtle)] rounded-lg p-3 text-sm">
              <p className="font-medium">{payModal.stage?.name || payModal.invoice_number}</p>
              <p className="text-xs text-[var(--text-muted)]">Total tagihan: Rp {Number(payModal.total_amount || payModal.amount).toLocaleString('id-ID')}</p>
            </div>
            <Input label="Jumlah Pembayaran" type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bukti Pembayaran *</label>
              <button type="button" onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-[var(--border)] rounded-xl p-6 text-center text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Klik untuk memilih file</p>
                <p className="text-xs">PDF, JPG, PNG (maks. 5MB)</p>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
