import { forwardRef, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> { label?: string; error?: string; helperText?: string }

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className = '', label, error, helperText, id, ...props }, ref) => (
  <div className="w-full">
    {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <input ref={ref} id={id} className={`input-field ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''} ${className}`} {...props} />
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    {helperText && !error && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
  </div>
))
Input.displayName = 'Input'
