import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useDemo } from '../../demo/DemoContext'
import { Logo } from '../../components/ui'

/** Шапка гостевых страниц: логотип + «Войти» / «Зарегистрироваться» */
export function GuestHeader({ mobile = false }: { mobile?: boolean }) {
  const base = mobile ? '/m' : ''
  return (
    <header className={mobile ? 'flex items-center justify-between px-4 py-4' : 'flex items-center justify-between px-8 py-4'}>
      <Link to={`${base}`} className="flex items-center">
        <Logo />
      </Link>
      <div className="flex items-center gap-2">
        <Link
          to={`${base}/login`}
          className="inline-flex h-10 items-center rounded-lg border border-border bg-surface px-4 text-sm font-medium shadow-sm transition-colors hover:bg-surface-2"
        >
          Войти
        </Link>
        <Link
          to={`${base}/register`}
          className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-strong"
        >
          Зарегистрироваться
        </Link>
      </div>
    </header>
  )
}

/** Центрированная сцена авторизации: карточка на фоне */
export function AuthScene({ children, mobile = false }: { children: ReactNode; mobile?: boolean }) {
  return (
    <div className={`flex min-h-full flex-col ${mobile ? 'items-center' : 'items-center'}`}>
      <div className={`w-full ${mobile ? '' : 'shrink-0'}`}>
        <GuestHeader mobile={mobile} />
      </div>
      <div className={`flex w-full flex-1 flex-col items-center justify-center ${mobile ? 'px-4 py-8' : 'px-6 pb-12'}`}>{children}</div>
    </div>
  )
}

export function AuthCard({ children, wide = false, mobile = false }: { children: ReactNode; wide?: boolean; mobile?: boolean }) {
  return (
    <div
      className={`w-full animate-(--animate-fade-up) rounded-2xl border border-border/60 bg-surface shadow-(--shadow-card) ${
        mobile ? 'px-5 py-6' : wide ? 'max-w-[560px] px-8 py-8' : 'max-w-[420px] px-8 py-8'
      }`}
    >
      {children}
    </div>
  )
}

/** Итоговая карточка регистрации/восстановления (успех, ручная проверка, письмо) */
export function ResultCard({
  tone,
  icon,
  title,
  text,
  meta,
  action,
}: {
  tone: 'green' | 'blue'
  icon: ReactNode
  title: string
  text?: string
  meta?: string
  action?: ReactNode
}) {
  return (
    <div className={`w-full animate-(--animate-fade-up) rounded-xl border bg-surface p-5 shadow-(--shadow-card) ${tone === 'green' ? 'border-[#9fd4b8]' : 'border-primary/30'}`}>
      <div className="flex items-start gap-3.5">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${tone === 'green' ? 'bg-[#e2f3ea] text-success' : 'bg-secondary text-primary'}`}>
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-[15px] font-bold leading-snug">{title}</p>
          {text && <p className="mt-1 text-[13px] leading-relaxed text-muted">{text}</p>}
        </div>
      </div>
      {meta && <p className="mt-3 text-xs text-muted">{meta}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

/** Подсказка прототипа: как вызвать нужный результат демо (не часть продукта) */
export function DemoHint({ children }: { children: ReactNode }) {
  return (
    <div className="mt-4 rounded-lg border border-dashed border-[#b8c2cd] bg-[#f7f9fb] px-3.5 py-2.5 text-[12px] leading-relaxed text-[#53606d]">
      <span className="font-semibold text-[#3d4854]">Демо-подсказка. </span>
      {children}
    </div>
  )
}

/** Ссылка возврата к гостевой главной */
export function BackHome({ mobile = false }: { mobile?: boolean }) {
  const { role } = useDemo()
  if (role !== 'guest') return null
  return (
    <Link to={mobile ? '/m' : '/'} className="mt-6 text-sm text-link transition-colors hover:underline">
      На главную
    </Link>
  )
}
