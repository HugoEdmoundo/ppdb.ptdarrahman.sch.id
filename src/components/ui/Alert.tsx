import { type ReactNode } from 'react'
import { cn } from '../../utils/cn'
import {
  CheckCircle,
  AlertTriangle,
  Info,
  XCircle,
} from 'lucide-react'
import type { AlertType } from '../../types/common.types'

interface AlertProps {
  type?: AlertType
  title?: string
  children: ReactNode
  className?: string
}

const config: Record<AlertType, { icon: React.FC<React.ComponentProps<'svg'>>; bg: string; text: string; border: string }> = {
  info: { icon: Info, bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
  success: { icon: CheckCircle, bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-200' },
  warning: { icon: AlertTriangle, bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-200' },
  error: { icon: XCircle, bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200' },
}

export function Alert({ type = 'info', title, children, className }: AlertProps) {
  const { icon: Icon, bg, text, border } = config[type]
  return (
    <div className={cn('flex gap-3 p-4 rounded-xl border', bg, text, border, className)}>
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div>
        {title && <p className="font-semibold text-sm">{title}</p>}
        <div className="text-sm">{children}</div>
      </div>
    </div>
  )
}
