import { cn } from '../../utils/cn'
import { APPLICANT_STATUS_LABELS, APPLICANT_STATUS_COLORS } from '../../utils/constants'

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', APPLICANT_STATUS_COLORS[status] || 'bg-gray-100 text-gray-700', className)}>
      {APPLICANT_STATUS_LABELS[status] || status}
    </span>
  )
}
