import { Select } from '../ui/Select'
import type { SelectHTMLAttributes } from 'react'

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export function FormSelect({ label, error, options, placeholder, ...props }: FormSelectProps) {
  return <Select label={label} error={error} options={options} placeholder={placeholder} {...props} />
}
