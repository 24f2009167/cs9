import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Button as HuiButton } from '@headlessui/react'
import { twMerge } from 'tailwind-merge'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  className?: string
  type?: 'button' | 'submit' | 'reset'
  children?: ReactNode
}

function Button({
  variant = 'primary',
  className = '',
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center font-medium transition focus:outline-none focus:ring-2 focus:ring-text-primary focus:ring-offset-2'
  const variants: Record<ButtonVariant, string> = {
    primary:
      'min-h-11 rounded-lg bg-black px-6 text-[14px] text-white hover:bg-[#2e3132] focus:ring-offset-white',
    secondary:
      'min-h-9 rounded-lg border border-border bg-bg-card px-5 text-[13px] text-text-secondary hover:border-text-primary hover:text-text-primary focus:ring-offset-[#f8f9fa]',
    ghost:
      'text-[13px] text-text-muted hover:text-text-primary focus:ring-offset-transparent',
  }

  return (
    <HuiButton type={type} className={twMerge(base, variants[variant], className)} {...props}>
      {children}
    </HuiButton>
  )
}

export default Button
