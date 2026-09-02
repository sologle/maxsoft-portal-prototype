import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown, FileText, Folder, List, LogOut, Search, UserRound } from 'lucide-react'
import { PERSONA, useDemo } from '../../demo/DemoContext'
import { Avatar, Logo } from '../ui'
import { useFormatBase } from '../nav'

interface NavItem {
  label: string
  path: string
  match: string[]
  kbMenu?: boolean
}

function navItemsFor(role: string): NavItem[] {
  const items: NavItem[] = [{ label: 'Главная', path: '/dashboard', match: ['/dashboard'] }]
  if (role === 'admin' || role === 'engineer' || role === 'manager' || role === 'client-admin' || role === 'client-user') {
    items.push({ label: 'База знаний', path: '/kb', match: ['/kb', '/search', '/article'], kbMenu: true })
  }
  if (role === 'admin' || role === 'engineer' || role === 'manager') {
    items.push({ label: 'Компании', path: '/companies', match: ['/companies', '/company-types'] })
    items.push({ label: 'Пользователи портала', path: '/users', match: ['/users'] })
  }
  if (role === 'client-admin') {
    items.push({ label: 'Пользователи компании', path: '/company/users', match: ['/company/users'] })
  }
  if (role === 'admin') {
    items.push({ label: 'Администрирование', path: '/admin', match: ['/admin'] })
  }
  return items
}

function KbMenu({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])
  const link = 'flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text transition-colors hover:bg-surface-2'
  return (
    <div
      ref={ref}
      className="absolute top-12 left-0 z-30 w-[340px] animate-(--animate-scale-in) rounded-xl border border-border bg-surface p-2 shadow-(--shadow-pop)"
    >
      <p className="px-3 pt-1.5 pb-2 text-[13px] font-bold">База знаний</p>
      <Link to="/kb" onClick={onClose} className={link}>
        <List size={17} className="text-muted" /> Все разделы
      </Link>
      <Link to="/kb/node/n-products" onClick={onClose} className={link}>
        <Folder size={17} className="text-muted" /> Продукты
      </Link>
      <div className="ml-4">
        <Link to="/kb/node/n-navisa" onClick={onClose} className={link}>
          <Folder size={17} className="text-muted" /> НАВИСА
        </Link>
        <div className="ml-4">
          <Link to="/kb/node/n-navisa-install" onClick={onClose} className={link}>
            <FileText size={17} className="text-muted" /> Установка
          </Link>
          <Link to="/kb/node/n-navisa-setup" onClick={onClose} className={`${link} bg-secondary text-primary-strong`}>
            <FileText size={17} className="text-primary" /> Настройка
          </Link>
          <Link to="/kb/node/n-navisa-update" onClick={onClose} className={link}>
            <FileText size={17} className="text-muted" /> Обновление
          </Link>
        </div>
      </div>
      <Link to="/kb/node/n-cases" onClick={onClose} className={link}>
        <ChevronDown size={14} className="-rotate-90 text-muted" />
        <Folder size={17} className="text-muted" /> Кейсы внедрения
      </Link>
      <Link to="/kb/node/n-admin" onClick={onClose} className={link}>
        <ChevronDown size={14} className="-rotate-90 text-muted" />
        <Folder size={17} className="text-muted" /> Администрирование
      </Link>
    </div>
  )
}

function ProfileMenu({ onClose }: { onClose: () => void }) {
  const { role, logout } = useDemo()
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const base = useFormatBase()
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])
  const persona = PERSONA[role as Exclude<typeof role, 'guest'>]
  const item = 'flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-text transition-colors hover:bg-surface-2'
  return (
    <div ref={ref} className="absolute top-[52px] right-0 z-30 w-[280px] animate-(--animate-scale-in) rounded-xl border border-border bg-surface p-2 shadow-(--shadow-pop)">
      <div className="flex items-center gap-3 rounded-lg px-3 py-3">
        <Avatar initials={persona.initials} size={40} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{persona.name}</p>
          <p className="truncate text-xs text-muted">{persona.subtitle}</p>
        </div>
      </div>
      <div className="my-1 h-px bg-border/70" />
      <button
        className={item}
        onClick={() => {
          onClose()
          navigate(`${base}/dashboard`)
        }}
      >
        <UserRound size={16} className="text-muted" /> Личный кабинет
      </button>
      <button
        className={`${item} text-danger`}
        onClick={() => {
          onClose()
          logout()
          navigate(base || '/')
        }}
      >
        <LogOut size={16} /> Выйти
      </button>
    </div>
  )
}

export function Topbar({ searchContext = false }: { searchContext?: boolean }) {
  const { role } = useDemo()
  const navigate = useNavigate()
  const base = useFormatBase()
  const [kbOpen, setKbOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [query, setQuery] = useState('')
  const items = navItemsFor(role)
  const persona = PERSONA[role as Exclude<typeof role, 'guest'>] ?? {
    name: 'Гость',
    initials: 'Г',
    subtitle: 'Гость',
  }
  const current = location.hash.slice(1) || '/'

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(`${base}/search?q=${encodeURIComponent(query)}`)
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-6 border-b border-border/70 bg-surface px-6">
      <Link to={`${base}/dashboard`} className="flex shrink-0 items-center gap-8">
        <Logo />
      </Link>
      <nav className="flex items-center gap-1">
        {items.map((item) => {
          const active = item.match.some((m) => current.startsWith(m))
          return (
            <div key={item.path} className="relative">
              <Link
                to={`${base}${item.path}`}
                onClick={() => (item.kbMenu ? setKbOpen((v) => !v) : undefined)}
                className={`inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium transition-colors ${
                  active ? 'bg-secondary text-primary-strong' : 'text-text hover:bg-surface-2'
                }`}
              >
                {item.label}
              </Link>
              {item.kbMenu && kbOpen && <KbMenu onClose={() => setKbOpen(false)} />}
            </div>
          )
        })}
      </nav>
      <div className="flex flex-1 justify-center px-2">
        {searchContext && (
          <form onSubmit={submitSearch} className="w-full max-w-md">
            <div className="relative">
              <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск по базе знаний..."
                className="h-10 w-full rounded-lg border border-border bg-surface pr-3 pl-9 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
              />
            </div>
          </form>
        )}
      </div>
      <div className="relative shrink-0">
        <button
          onClick={() => setProfileOpen((v) => !v)}
          className="flex cursor-pointer items-center gap-2.5 rounded-lg py-1.5 pr-2 pl-1.5 transition-colors hover:bg-surface-2"
        >
          <Avatar initials={persona.initials} />
          <span className="text-left leading-tight">
            <span className="block text-[13px] font-semibold">{persona.name}</span>
            <span className="block text-xs text-muted">{persona.subtitle}</span>
          </span>
          <ChevronDown size={15} className="text-muted" />
        </button>
        {profileOpen && <ProfileMenu onClose={() => setProfileOpen(false)} />}
      </div>
    </header>
  )
}
