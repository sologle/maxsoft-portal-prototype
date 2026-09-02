import { createContext, useContext, useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { useDemo } from '../demo/DemoContext'

/** Контейнер текущей сцены: модалки/тосты рендерятся внутрь него (в мобильной рамке не выпадают наружу) */
const OverlayRootContext = createContext<HTMLElement | null>(null)

export function OverlayRootProvider({ root, children }: { root: HTMLElement | null; children: ReactNode }) {
  return <OverlayRootContext.Provider value={root}>{children}</OverlayRootContext.Provider>
}

function useOverlayRoot(): HTMLElement {
  return useContext(OverlayRootContext) ?? document.body
}

function useLockBody(active: boolean) {
  useEffect(() => {
    if (!active) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [active])
}

function useEscape(onClose?: () => void) {
  const ref = useRef(onClose)
  ref.current = onClose
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') ref.current?.()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])
}

interface ModalProps {
  open: boolean
  onClose?: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  width?: number
  /** Мобильный формат: нижний лист */
  sheet?: boolean
}

export function Modal({ open, onClose, title, children, footer, width = 560, sheet }: ModalProps) {
  useLockBody(open)
  useEscape(onClose)
  const overlayRoot = useOverlayRoot()
  if (!open) return null
  return createPortal(
    <div className={`absolute inset-0 z-40 flex ${sheet ? 'items-end' : 'items-center justify-center p-6'}`}>
      <div className="absolute inset-0 animate-(--animate-fade-in) bg-[#10161d]/45 backdrop-blur-[2px]" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={sheet ? undefined : { width, maxWidth: 'calc(100vw - 48px)' }}
        className={`relative max-h-[92%] overflow-auto rounded-2xl bg-surface shadow-(--shadow-pop) ${
          sheet ? 'w-full animate-(--animate-slide-up) rounded-b-none rounded-t-2xl' : 'animate-(--animate-scale-in)'
        }`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border/70 px-6 py-4">
          <h3 className="text-[17px] font-bold">{title}</h3>
          {onClose && (
            <button onClick={onClose} aria-label="Закрыть" className="-m-1 cursor-pointer rounded-lg p-1 text-muted transition-colors hover:bg-surface-2 hover:text-text">
              <X size={18} />
            </button>
          )}
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-border/70 px-6 py-4">{footer}</div>}
      </div>
    </div>,
    overlayRoot,
  )
}

interface DrawerProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  width?: number
}

export function Drawer({ open, onClose, title, children, width = 440 }: DrawerProps) {
  useLockBody(open)
  useEscape(onClose)
  const overlayRoot = useOverlayRoot()
  if (!open) return null
  return createPortal(
    <div className="absolute inset-0 z-40">
      <div className="absolute inset-0 animate-(--animate-fade-in) bg-[#10161d]/45 backdrop-blur-[2px]" onClick={onClose} />
      <aside
        style={{ width }}
        className="absolute top-0 right-0 flex h-full animate-(--animate-slide-left) flex-col bg-surface shadow-(--shadow-pop)"
      >
        <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
          <h3 className="text-[16px] font-bold">{title}</h3>
          <button onClick={onClose} aria-label="Закрыть" className="cursor-pointer rounded-lg p-1 text-muted transition-colors hover:bg-surface-2 hover:text-text">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-auto px-5 py-4">{children}</div>
      </aside>
    </div>,
    overlayRoot,
  )
}

export function Toasts() {
  const { toasts, dismissToast } = useDemo()
  const overlayRoot = useOverlayRoot()
  if (toasts.length === 0) return null
  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[60] flex flex-col items-center gap-2 px-4 sm:right-6 sm:left-auto sm:items-end">
      {toasts.map((t) => {
        const Icon = t.kind === 'success' ? CheckCircle2 : t.kind === 'error' ? AlertCircle : Info
        const color = t.kind === 'success' ? 'text-success' : t.kind === 'error' ? 'text-danger' : 'text-info'
        return (
          <div
            key={t.id}
            className="pointer-events-auto flex w-full max-w-sm animate-(--animate-toast-in) items-start gap-2.5 rounded-xl border border-border bg-surface px-4 py-3 shadow-(--shadow-pop)"
          >
            <Icon size={18} className={`mt-0.5 shrink-0 ${color}`} />
            <p className="flex-1 text-sm text-text">{t.text}</p>
            <button onClick={() => dismissToast(t.id)} aria-label="Закрыть" className="cursor-pointer text-muted hover:text-text">
              <X size={15} />
            </button>
          </div>
        )
      })}
    </div>,
    overlayRoot,
  )
}

/** Универсальный экран APP_RESOURCE_NOT_AVAILABLE — не раскрывает существование закрытого материала */
export function NotAvailable({ onBack, backLabel = 'Вернуться' }: { onBack: () => void; backLabel?: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-2">
        <AlertCircle size={30} className="text-muted" />
      </div>
      <h1 className="mb-2 text-[22px] font-bold">Ресурс недоступен</h1>
      <p className="mb-6 max-w-sm text-sm leading-relaxed text-muted">
        Ресурс недоступен или у вас нет прав на его просмотр. Если считаете, что это ошибка, обратитесь к администратору портала.
        <span className="mt-1 block font-(--font-caption) text-xs tracking-wide text-[#9aa4b0]">APP_RESOURCE_NOT_AVAILABLE</span>
      </p>
      <button
        onClick={onBack}
        className="h-10 cursor-pointer rounded-lg bg-primary px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-strong"
      >
        {backLabel}
      </button>
    </div>
  )
}
