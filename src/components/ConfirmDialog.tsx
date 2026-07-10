import { useState, useCallback } from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface ConfirmOptions { title?: string; message: string; confirmLabel?: string; cancelLabel?: string; danger?: boolean }

export function useConfirm() {
  const [state, setState] = useState<(ConfirmOptions & { resolve: (v: boolean) => void }) | null>(null)
  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => new Promise(resolve => setState({ ...opts, resolve })), [])
  const handleConfirm = () => { state?.resolve(true); setState(null) }
  const handleCancel = () => { state?.resolve(false); setState(null) }
  const handleClose = () => { state?.resolve(false); setState(null) }
  const dialog = state ? (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-modalIn">
        <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        <div className="flex flex-col items-center text-center mb-5">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${state.danger ? 'bg-red-50' : 'bg-amber-50'}`}>
            <AlertTriangle className={`w-6 h-6 ${state.danger ? 'text-red-500' : 'text-amber-500'}`} />
          </div>
          <h3 className="text-lg font-semibold text-[var(--text)] mb-1">{state.title || 'Konfirmasi'}</h3>
          <p className="text-sm text-[var(--text-secondary)]">{state.message}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleCancel} className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm font-medium hover:bg-gray-50 transition-colors">{state.cancelLabel || 'Batal'}</button>
          <button onClick={handleConfirm} className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-colors ${state.danger ? 'bg-red-500 hover:bg-red-600' : 'bg-[var(--accent)] hover:bg-[var(--accent-hover)]'}`}>{state.confirmLabel || 'Ya'}</button>
        </div>
      </div>
    </div>
  ) : null
  return { confirm, dialog }
}
