import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { Format, Role } from '../data/types'
import { ROLES } from '../data/mock'

interface Toast {
  id: number
  kind: 'success' | 'error' | 'info'
  text: string
}

interface DemoState {
  role: Role
  format: Format
  /** URL ресурса, к которому гость шёл по закрытой ссылке */
  nextUrl: string | null
  /** Результат регистрации, показанный на экране успеха */
  toasts: Toast[]
  login: (role: Role, nextUrl?: string | null) => void
  logout: () => void
  setFormat: (f: Format) => void
  setNextUrl: (url: string | null) => void
  toast: (text: string, kind?: Toast['kind']) => void
  dismissToast: (id: number) => void
}

const DemoContext = createContext<DemoState | null>(null)

const SESSION_KEY = 'maxsoft-demo-role'

function detectFormat(): Format {
  return window.innerWidth < 768 ? 'mobile' : 'desktop'
}

export function DemoProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>(() => {
    const saved = sessionStorage.getItem(SESSION_KEY)
    return saved && ROLES.some((r) => r.id === saved) ? (saved as Role) : 'guest'
  })
  const [format, setFormatState] = useState<Format>(detectFormat)
  const [nextUrl, setNextUrl] = useState<string | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const toastSeq = useRef(0)

  useEffect(() => {
    if (role === 'guest') sessionStorage.removeItem(SESSION_KEY)
    else sessionStorage.setItem(SESSION_KEY, role)
  }, [role])

  const toast = useCallback((text: string, kind: Toast['kind'] = 'success') => {
    const id = ++toastSeq.current
    setToasts((prev) => [...prev, { id, kind, text }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3800)
  }, [])

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const login = useCallback((r: Role, next: string | null = null) => {
    setRole(r)
    setNextUrl(next)
  }, [])

  const logout = useCallback(() => {
    setRole('guest')
    setNextUrl(null)
  }, [])

  const setFormat = useCallback((f: Format) => setFormatState(f), [])

  const value = useMemo<DemoState>(
    () => ({
      role,
      format,
      nextUrl,
      toasts,
      login,
      logout,
      setFormat,
      setNextUrl,
      toast,
      dismissToast,
    }),
    [role, format, nextUrl, toasts, login, logout, setFormat, toast, dismissToast],
  )

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}

export function useDemo(): DemoState {
  const ctx = useContext(DemoContext)
  if (!ctx) throw new Error('APP_DEMO_CONTEXT_MISSING: useDemo вне DemoProvider')
  return ctx
}

const ROLE = {
  admin: new Set(['dashboard', 'kb', 'kb-staff', 'search', 'org', 'org-users', 'plat']),
  engineer: new Set(['dashboard', 'kb', 'kb-staff', 'search', 'org', 'org-users']),
  manager: new Set(['dashboard', 'kb', 'kb-staff', 'search', 'org', 'org-users']),
  'client-admin': new Set(['dashboard', 'kb', 'search', 'company-users']),
  'client-user': new Set(['dashboard', 'kb', 'search']),
  guest: new Set([] as string[]),
}

export function can(section: string, role: Role): boolean {
  return ROLE[role].has(section)
}

export function isStaff(role: Role): boolean {
  return role === 'admin' || role === 'engineer' || role === 'manager'
}

/** Персона тестового пользователя для каждой роли */
export const PERSONA: Record<Exclude<Role, 'guest'>, { name: string; initials: string; subtitle: string }> = {
  admin: { name: 'Алексей', initials: 'АС', subtitle: 'Администратор портала' },
  engineer: { name: 'Павел', initials: 'ПР', subtitle: 'Инженер ТП / автор' },
  manager: { name: 'Ольга', initials: 'ОБ', subtitle: 'Менеджер' },
  'client-admin': { name: 'Мария', initials: 'МО', subtitle: 'Администратор клиента' },
  'client-user': { name: 'Иван', initials: 'ИП', subtitle: 'Сотрудник клиента' },
}
