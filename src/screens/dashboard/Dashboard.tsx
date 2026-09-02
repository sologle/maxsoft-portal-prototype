import { useNavigate } from 'react-router-dom'
import {
  ArrowUpRight,
  BookOpen,
  CirclePlus,
  Clock3,
  FileText,
  Layers,
  LifeBuoy,
  Lock,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
  Upload,
  Users,
} from 'lucide-react'
import type { ReactNode } from 'react'
import type { Role } from '../../data/types'
import { PERSONA, useDemo } from '../../demo/DemoContext'
import { Card } from '../../components/ui'
import { MobilePage } from '../../components/shell/MobileShell'
import { Topbar } from '../../components/shell/Topbar'

interface Action {
  icon: ReactNode
  label: string
  path: string
  primary?: boolean
}

interface LinkRow {
  icon: ReactNode
  label: string
  path: string
}

function actionsFor(role: Role, base: string): Action[] {
  if (role === 'admin')
    return [
      { icon: <CirclePlus size={17} />, label: 'Добавить компанию', path: `${base}/companies?new=1`, primary: true },
      { icon: <ArrowUpRight size={17} />, label: 'Пригласить пользователя', path: `${base}/users?invite=1` },
      { icon: <ArrowUpRight size={17} />, label: 'Создать статью', path: `${base}/kb/editor` },
      { icon: <ArrowUpRight size={17} />, label: 'Настройки портала', path: `${base}/admin` },
    ]
  if (role === 'engineer')
    return [
      { icon: <CirclePlus size={17} />, label: 'Создать статью', path: `${base}/kb/editor`, primary: true },
      { icon: <ArrowUpRight size={17} />, label: 'Импорт DOCX', path: `${base}/kb/editor?import=1` },
      { icon: <ArrowUpRight size={17} />, label: 'Компании', path: `${base}/companies` },
      { icon: <ArrowUpRight size={17} />, label: 'Пригласить пользователя', path: `${base}/users?invite=1` },
    ]
  if (role === 'manager')
    return [
      { icon: <CirclePlus size={17} />, label: 'Компании', path: `${base}/companies`, primary: true },
      { icon: <ArrowUpRight size={17} />, label: 'Пользователи портала', path: `${base}/users` },
      { icon: <ArrowUpRight size={17} />, label: 'Открыть базу знаний', path: `${base}/kb` },
    ]
  if (role === 'client-admin')
    return [
      { icon: <CirclePlus size={17} />, label: 'Добавить сотрудника', path: `${base}/company/users?invite=1`, primary: true },
      { icon: <ArrowUpRight size={17} />, label: 'Открыть базу знаний', path: `${base}/kb` },
    ]
  return [{ icon: <BookOpen size={17} />, label: 'Открыть базу знаний', path: `${base}/kb`, primary: true }]
}

function linksFor(role: Role, base: string): LinkRow[] {
  switch (role) {
    case 'admin':
      return [
        { icon: <BookOpen size={17} className="text-primary" />, label: 'Новые компании', path: `${base}/companies` },
        { icon: <Layers size={17} className="text-primary" />, label: 'Управление доступом', path: `${base}/company-types` },
        { icon: <Clock3 size={17} className="text-primary" />, label: 'Журнал действий', path: `${base}/admin/audit` },
      ]
    case 'engineer':
      return [
        { icon: <FileText size={17} className="text-primary" />, label: 'Мои черновики', path: `${base}/kb` },
        { icon: <Users size={17} className="text-primary" />, label: 'Компании', path: `${base}/companies` },
        { icon: <Upload size={17} className="text-primary" />, label: 'Импорт DOCX', path: `${base}/kb/editor?import=1` },
      ]
    case 'manager':
      return [
        { icon: <Layers size={17} className="text-primary" />, label: 'Все компании', path: `${base}/companies` },
        { icon: <Users size={17} className="text-primary" />, label: 'Пользователи портала', path: `${base}/users` },
        { icon: <BookOpen size={17} className="text-primary" />, label: 'База знаний', path: `${base}/kb` },
      ]
    case 'client-admin':
      return [
        { icon: <Users size={17} className="text-primary" />, label: 'Сотрудники компании', path: `${base}/company/users` },
        { icon: <Layers size={17} className="text-primary" />, label: 'Доступ к продуктам', path: `${base}/kb` },
        { icon: <Clock3 size={17} className="text-primary" />, label: 'Материалы компании', path: `${base}/search` },
      ]
    default:
      return [
        { icon: <BookOpen size={17} className="text-primary" />, label: 'Рекомендованные статьи', path: `${base}/kb` },
        { icon: <Layers size={17} className="text-primary" />, label: 'Доступные продукты', path: `${base}/kb` },
        { icon: <Clock3 size={17} className="text-primary" />, label: 'Недавно просмотрено', path: `${base}/search` },
      ]
  }
}

function accessFor(role: Role): string {
  switch (role) {
    case 'admin':
      return 'Главная · База знаний · Компании · Пользователи портала · Администрирование'
    case 'engineer':
    case 'manager':
      return 'Главная · База знаний · Компании · Пользователи портала'
    case 'client-admin':
      return 'Главная · База знаний · Пользователи компании'
    default:
      return 'Главная · База знаний'
  }
}

function StageStubCard({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-surface-2/50 px-4 py-3.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface text-muted border border-border">{icon}</span>
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 text-[13px] font-semibold text-muted">
          {title}
          <Lock size={11} className="text-muted" />
        </p>
        <p className="truncate text-xs text-muted/80">{text}</p>
      </div>
    </div>
  )
}

function StageStubs() {
  return (
    <div>
      <p className="mb-2.5 text-[11px] font-bold tracking-widest text-muted uppercase">Скоро на портале</p>
      <div className="grid grid-cols-3 gap-3">
        <StageStubCard icon={<LifeBuoy size={16} />} title="Этап 2 · Helpdesk" text="Запросы в поддержку" />
        <StageStubCard icon={<MessagesSquare size={16} />} title="Этап 2 · Консультации" text="Переписка по запросам" />
        <StageStubCard icon={<Sparkles size={16} />} title="Этап 3 · ИИ-помощник" text="Ответы с источниками" />
      </div>
    </div>
  )
}

function QuickAction({ action, grid }: { action: Action; grid: boolean }) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(action.path)}
      className={`flex cursor-pointer items-start gap-3 rounded-xl border bg-surface p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-(--shadow-card) active:translate-y-0 ${
        action.primary ? 'border-primary/60 bg-secondary' : 'border-border/70'
      } ${grid ? '' : 'w-full'}`}
    >
      <span className={action.primary ? 'text-primary' : 'text-muted'}>{action.icon}</span>
      <span className="text-sm font-semibold">{action.label}</span>
    </button>
  )
}

function DashboardBody({ role, mobile = false }: { role: Exclude<Role, 'guest'>; mobile?: boolean }) {
  const navigate = useNavigate()
  const persona = PERSONA[role]
  const actions = actionsFor(role, mobile ? '/m' : '')
  const links = linksFor(role, mobile ? '/m' : '')
  const gridCols = actions.length <= 2 ? (mobile ? 'grid-cols-1' : 'grid-cols-2') : mobile ? 'grid-cols-1' : 'grid-cols-4'
  return (
    <div className="flex flex-1 flex-col bg-bg">
      <div className={`mx-auto w-full ${mobile ? 'px-4 pt-5' : 'max-w-[1320px] px-8 pt-8'}`}>
        <div className="flex items-start justify-between">
          <div>
            <h1 className={mobile ? 'text-[24px] font-extrabold' : 'text-[32px] font-extrabold'}>Добрый день, {persona.name}!</h1>
            <p className="mt-0.5 text-sm font-medium text-primary">{persona.subtitle}</p>
          </div>
          {!mobile && <span className="rounded-full border border-border bg-surface px-3 py-1.5 text-[11px] font-bold tracking-widest text-muted">STAGE 1</span>}
        </div>

        <p className={mobile ? 'mt-5 mb-2.5 text-[15px] font-bold' : 'mt-6 mb-3 text-[15px] font-bold'}>Быстрые действия</p>
        <div className={`grid gap-3 ${gridCols}`}>
          {actions.map((a) => (
            <QuickAction key={a.label} action={a} grid={!mobile} />
          ))}
        </div>

        <div className={`grid gap-4 ${mobile ? 'mt-5' : 'mt-6 grid-cols-[1fr_360px] items-start'}`}>
          <Card className="p-5">
            <p className="mb-1 text-[17px] font-bold">Продолжить работу</p>
            <div>
              {links.map((l, i) => (
                <button
                  key={l.label}
                  onClick={() => navigate(l.path)}
                  className={`flex w-full cursor-pointer items-center justify-between gap-3 py-4 text-left transition-colors hover:text-primary ${i > 0 ? 'border-t border-border/60' : ''}`}
                >
                  <span className="flex items-center gap-3 text-sm font-medium">
                    {l.icon}
                    {l.label}
                  </span>
                  <span className="text-muted">›</span>
                </button>
              ))}
            </div>
          </Card>
          {!mobile && (
            <div className="flex flex-col gap-4">
              <Card className="p-5">
                <p className="mb-2 text-[17px] font-bold">Доступ роли</p>
                <p className="text-[13px] leading-relaxed text-muted">{accessFor(role)}</p>
              </Card>
              <Card className="bg-[#f6f9f7] p-5">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <ShieldCheck size={16} className="text-success" />
                  Только Stage 1
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted">В прототипе показаны только функции Stage 1.</p>
              </Card>
            </div>
          )}
        </div>

        {!mobile && (
          <div className="mt-6 mb-10">
            <StageStubs />
          </div>
        )}
        {mobile && (
          <div className="mt-4 mb-8">
            <StageStubCard icon={<LifeBuoy size={16} />} title="Этап 2 · Helpdesk и ИИ-помощник" text="Появятся на следующих этапах" />
          </div>
        )}
      </div>
    </div>
  )
}

export function DashboardD() {
  const { role } = useDemo()
  if (role === 'guest') return null
  return (
    <div className="flex min-h-full flex-col">
      <Topbar searchContext />
      <DashboardBody role={role} />
    </div>
  )
}

export function DashboardM() {
  const { role } = useDemo()
  if (role === 'guest') return null
  return (
    <MobilePage showSearch>
      <DashboardBody role={role} mobile />
    </MobilePage>
  )
}
