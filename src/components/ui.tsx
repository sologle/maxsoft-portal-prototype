import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'link'
type Size = 'sm' | 'md' | 'lg'

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-strong active:translate-y-px shadow-sm disabled:bg-[#a9c8de] disabled:shadow-none',
  secondary:
    'bg-surface text-text border border-border hover:bg-secondary hover:border-primary/40 active:translate-y-px disabled:text-[#53606d] disabled:bg-[#e8edf2] disabled:border-transparent',
  ghost: 'text-text hover:bg-surface-2 active:bg-border/60 disabled:text-[#53606d] disabled:hover:bg-transparent',
  danger: 'bg-danger text-white hover:bg-danger-strong active:translate-y-px shadow-sm disabled:bg-[#ecb4b4]',
  link: 'text-link hover:underline underline-offset-2 px-0',
}

const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px] rounded-lg gap-1.5',
  md: 'h-10 px-4 text-sm rounded-lg gap-2',
  lg: 'h-12 px-5 text-[15px] rounded-xl gap-2',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  icon?: ReactNode
  iconRight?: ReactNode
}

export function Button({ variant = 'primary', size = 'md', icon, iconRight, className = '', children, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      className={`inline-flex cursor-pointer items-center justify-center font-medium whitespace-nowrap transition-all duration-150 select-none disabled:cursor-not-allowed disabled:opacity-80 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
    >
      {icon}
      {children}
      {iconRight}
    </button>
  )
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  children: ReactNode
}

export function IconButton({ label, children, className = '', ...rest }: IconButtonProps) {
  return (
    <button
      {...rest}
      aria-label={label}
      title={label}
      className={`inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-text ${className}`}
    >
      {children}
    </button>
  )
}

export function Field({ label, required, error, hint, children }: { label: string; required?: boolean; error?: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-text">
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </span>
      {children}
      {error ? (
        <span className="mt-1 flex items-center gap-1 text-xs text-danger">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-muted">{hint}</span>
      ) : null}
    </label>
  )
}

const inputBase =
  'w-full rounded-lg border bg-surface px-3 text-sm text-text transition-colors placeholder:text-[#8a94a1] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 disabled:bg-[#e8edf2] disabled:text-[#53606d]'

export function Input({ invalid, className = '', ...rest }: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return <input {...rest} className={`${inputBase} h-10 ${invalid ? 'border-danger' : 'border-border'} ${className}`} />
}

export function Textarea({ className = '', ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...rest} className={`${inputBase} min-h-24 border-border py-2.5 ${className}`} />
}

export function Select({ className = '', children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select {...rest} className={`${inputBase} h-10 cursor-pointer appearance-none border-border pr-9 ${className}`}>
        {children}
      </select>
      <ChevronDown size={15} className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted" />
    </div>
  )
}

export function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-text select-none">
      <span
        onClick={(e) => {
          e.preventDefault()
          onChange(!checked)
        }}
        className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-(--radius-sm) border transition-all ${
          checked ? 'border-primary bg-primary text-white' : 'border-border bg-surface'
        }`}
      >
        {checked && (
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path d="M2 6.2L4.6 8.8L10 3.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  )
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2.5 select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label ?? 'Переключатель'}
        onClick={() => onChange(!checked)}
        className={`relative h-[22px] w-[38px] shrink-0 cursor-pointer rounded-full transition-colors duration-200 ${checked ? 'bg-primary' : 'bg-[#c3ccd6]'}`}
      >
        <span
          className={`absolute top-[3px] h-4 w-4 rounded-full bg-white shadow transition-all duration-200 ${checked ? 'left-[19px]' : 'left-[3px]'}`}
        />
      </button>
      {label && <span className="text-sm text-text">{label}</span>}
    </label>
  )
}

export function Card({ children, className = '', onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border border-border/70 bg-surface shadow-(--shadow-card) ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  )
}

export function Chip({ children, tone = 'neutral', onClick }: { children: ReactNode; tone?: 'neutral' | 'blue' | 'green' | 'amber' | 'red' | 'violet'; onClick?: () => void }) {
  const tones = {
    neutral: 'bg-surface-2 text-muted border-border/60',
    blue: 'bg-secondary text-primary-strong border-primary/20',
    green: 'bg-[#e2f3ea] text-[#17724b] border-[#bfe3d0]',
    amber: 'bg-[#faf0dc] text-[#8a5c0d] border-[#ecd9b0]',
    red: 'bg-[#fbe4e4] text-[#a12f2f] border-[#f0c4c4]',
    violet: 'bg-[#efeafb] text-[#5b3fa8] border-[#d9cdf2]',
  }
  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${tones[tone]} ${onClick ? 'cursor-pointer' : ''}`}
    >
      {children}
    </span>
  )
}

export function DraftBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-2 px-2 py-0.5 text-xs font-medium text-muted">
      <span className="h-1.5 w-1.5 rounded-full bg-muted" />
      Черновик
    </span>
  )
}

export function Avatar({ initials, tone = 'blue', size = 32 }: { initials: string; tone?: 'blue' | 'gray'; size?: number }) {
  return (
    <span
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold ${
        tone === 'blue' ? 'bg-primary text-white' : 'bg-surface-2 text-muted border border-border'
      }`}
    >
      {initials}
    </span>
  )
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-[17px] font-bold">{children}</h2>
      {right}
    </div>
  )
}

export function Pagination({ page, pages }: { page: number; pages: number[] }) {
  return (
    <div className="flex items-center justify-end gap-1.5 px-5 py-3.5">
      <button className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface text-muted transition-colors hover:bg-surface-2">
        ‹
      </button>
      {pages.map((p) => (
        <button
          key={p}
          className={`h-9 min-w-9 cursor-pointer rounded-lg border px-2 text-sm font-medium transition-colors ${
            p === page ? 'border-primary bg-primary text-white' : 'border-border bg-surface text-text hover:bg-surface-2'
          }`}
        >
          {p}
        </button>
      ))}
      <span className="px-1 text-muted">…</span>
      <button className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface text-muted transition-colors hover:bg-surface-2">
        ›
      </button>
    </div>
  )
}

export function Logo({ compact }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
        <span className="h-3.5 w-3.5 rounded-(--radius-sm) bg-white/95" />
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className="block font-(--font-heading) text-[15px] font-bold">MaxSoft</span>
        </span>
      )}
    </span>
  )
}
