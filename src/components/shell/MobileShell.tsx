import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronRight, FileText, Folder, LogOut, Search, UserRound, X } from 'lucide-react'
import { PERSONA, useDemo } from '../../demo/DemoContext'
import { Avatar } from '../ui'
import type { ReactNode } from 'react'

export function MobileHeader({ title, showSearch = false, onBack }: { title?: string; showSearch?: boolean; onBack?: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border/70 bg-surface px-4">
        {onBack ? (
          <button onClick={onBack} aria-label="Назад" className="-ml-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-text hover:bg-surface-2">
            <ChevronRight size={22} className="rotate-180" />
          </button>
        ) : (
          <Link to="/m/dashboard" className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
              <span className="h-3.5 w-3.5 rounded-(--radius-sm) bg-white/95" />
            </span>
            <span className="font-(--font-heading) text-[15px] font-bold">MaxSoft</span>
          </Link>
        )}
        {title && <p className="absolute left-1/2 -translate-x-1/2 truncate text-[15px] font-semibold">{title}</p>}
        <div className="flex items-center gap-1">
          {showSearch && (
            <button onClick={() => navigate('/m/search')} aria-label="Поиск" className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-text hover:bg-surface-2">
              <Search size={20} />
            </button>
          )}
          <button onClick={() => setMenuOpen(true)} aria-label="Меню" className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-text hover:bg-surface-2">
            <span className="flex flex-col gap-[4.5px]">
              <span className="block h-[2px] w-[18px] rounded bg-text" />
              <span className="block h-[2px] w-[18px] rounded bg-text" />
              <span className="block h-[2px] w-[18px] rounded bg-text" />
            </span>
          </button>
        </div>
      </header>
      {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}
    </>
  )
}

function MobileMenu({ onClose }: { onClose: () => void }) {
  const { role, logout } = useDemo()
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const persona = PERSONA[role as Exclude<typeof role, 'guest'>]
  const sections = navFor(role)

  function navFor(r: string): { label: string; path: string; icon: 'home' | 'kb' | 'org' | 'users' | 'admin' | 'company-users' }[] {
    const list: { label: string; path: string; icon: 'home' | 'kb' | 'org' | 'users' | 'admin' | 'company-users' }[] = [
      { label: 'Главная', path: '/m/dashboard', icon: 'home' },
      { label: 'База знаний', path: '/m/kb', icon: 'kb' },
    ]
    if (r === 'admin' || r === 'engineer' || r === 'manager') {
      list.push({ label: 'Компании', path: '/m/companies', icon: 'org' })
      list.push({ label: 'Пользователи портала', path: '/m/users', icon: 'users' })
    }
    if (r === 'client-admin') list.push({ label: 'Пользователи компании', path: '/m/company/users', icon: 'company-users' })
    if (r === 'admin') list.push({ label: 'Администрирование', path: '/m/admin', icon: 'admin' })
    return list
  }

  const iconFor: Record<string, ReactNode> = {
    home: <UserRound size={18} className="text-muted" />,
    kb: <Folder size={18} className="text-muted" />,
    org: <Folder size={18} className="text-muted" />,
    users: <FileText size={18} className="text-muted" />,
    'company-users': <FileText size={18} className="text-muted" />,
    admin: <ChevronRight size={18} className="text-muted" />,
  }

  const go = (path: string) => {
    onClose()
    navigate(path)
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 animate-(--animate-fade-in) bg-[#10161d]/45" onClick={onClose} />
      <aside ref={ref} className="absolute top-0 right-0 flex h-full w-[86%] max-w-[340px] animate-(--animate-slide-left) flex-col bg-surface shadow-(--shadow-pop)">
        <div className="flex items-center justify-between border-b border-border/70 px-4 py-4">
          <div className="flex items-center gap-3">
            <Avatar initials={persona.initials} size={40} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{persona.name}</p>
              <p className="truncate text-xs text-muted">{persona.subtitle}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Закрыть меню" className="cursor-pointer rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-text">
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 overflow-auto p-2">
          {sections.map((s) => (
            <button
              key={s.path}
              onClick={() => go(s.path)}
              className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-text transition-colors hover:bg-surface-2"
            >
              {iconFor[s.icon]}
              {s.label}
              <ChevronDown size={15} className="-rotate-90 text-muted" />
            </button>
          ))}
          {role === 'admin' || role === 'engineer' || role === 'manager' ? (
            <div className="mt-2 border-t border-border/70 pt-2">
              <p className="px-3 py-2 text-xs font-semibold tracking-wide text-muted uppercase">База знаний</p>
              {[
                ['Все разделы', '/m/kb'],
                ['НАВИСА · Установка', '/m/kb/node/n-navisa-install'],
                ['НАВИСА · Настройка', '/m/kb/node/n-navisa-setup'],
                ['Кейсы внедрения', '/m/kb/node/n-cases'],
              ].map(([label, path]) => (
                <button
                  key={path}
                  onClick={() => go(path)}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-text transition-colors hover:bg-surface-2"
                >
                  <FileText size={16} className="text-muted" />
                  {label}
                </button>
              ))}
            </div>
          ) : null}
        </nav>
        <div className="border-t border-border/70 p-2">
          <button
            onClick={() => {
              onClose()
              logout()
              navigate('/m')
            }}
            className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-danger transition-colors hover:bg-[#fbe4e4]"
          >
            <LogOut size={18} /> Выйти
          </button>
        </div>
      </aside>
    </div>
  )
}

/** Страница мобильной оболочки: заголовок + контент */
export function MobilePage({ title, showSearch, onBack, children, className = '' }: { title?: string; showSearch?: boolean; onBack?: () => void; children: ReactNode; className?: string }) {
  return (
    <div className={`flex min-h-full flex-col ${className}`}>
      <MobileHeader title={title} showSearch={showSearch} onBack={onBack} />
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  )
}
