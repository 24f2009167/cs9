import type { InputHTMLAttributes } from 'react'
import { Input as HuiInput } from '@headlessui/react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string
}

function Input({ className = '', ...props }: InputProps) {
  return (
    <HuiInput
      className={`h-11 w-full rounded-lg border border-border bg-bg-card px-4 text-[13px] shadow-sm outline-none transition placeholder:text-text-muted focus:border-text-primary focus:ring-1 focus:ring-text-primary disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    />
  )
}

export default Input
