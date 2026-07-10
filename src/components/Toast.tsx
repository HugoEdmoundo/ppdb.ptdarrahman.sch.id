import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning'
interface Toast { id: number; type: ToastType; message: string }
interface ToastCtx { toast: (type: ToastType, message: string) => void }
const ToastContext = createContext<ToastCtx>({ toast: () => {} })
let nextId = 0

const icons = { success: <CheckCircle className="w-5 h-5 text-green-500" />, error: <XCircle className="w-5 h-5 text-red-500" />, warning: <AlertTriangle className="w-5 h-5 text-amber-500" /> }
const borders = { success: 'border-l-green-500', error: 'border-l-red-500', warning: 'border-l-amber-500' }

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const add = useCallback((type: ToastType, message: string) => {
    const id = nextId++; setToasts(p => [...p, { id, type, message }]); setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000)
  }, [])
  return (
    <ToastContext.Provider value={{ toast: add }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 max-w-sm">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-start gap-3 bg-white/90 backdrop-blur-md border border-[var(--border)] border-l-4 ${borders[t.type]} rounded-xl px-4 py-3 shadow-lg animate-slideUp`}>
            <span className="mt-0.5 shrink-0">{icons[t.type]}</span>
            <p className="text-sm text-[var(--text)] flex-1">{t.message}</p>
            <button onClick={() => setToasts(p => p.filter(x => x.id !== t.id))} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
export function useToast() { return useContext(ToastContext) }
