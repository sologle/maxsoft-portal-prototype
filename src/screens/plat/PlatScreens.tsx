import { useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Building2,
  CheckCircle2,
  ClipboardList,
  FileStack,
  ListChecks,
  RefreshCw,
  Settings2,
  Shapes,
} from 'lucide-react'
import { ARTICLES, AUDIT, COMPANIES, FIELD_SETTINGS, INTEGRATIONS } from '../../data/mock'
import type { AuditEntry, CompanyFieldSetting } from '../../data/types'
import { useDemo } from '../../demo/DemoContext'
import { Topbar } from '../../components/shell/Topbar'
import { MobilePage } from '../../components/shell/MobileShell'
import { Button, Card, Field, Input, Select, Switch } from '../../components/ui'
import { NotAvailable } from '../../components/overlays'

const KIND_LABEL: Record<AuditEntry['kind'], string> = {
  article: 'Статьи',
  company: 'Компании',
  user: 'Пользователи',
  access: 'Права и настройки',
  file: 'Файлы',
}

function Crumbs({ items }: { items: string[] }) {
  return (
    <nav className="mb-2 flex items-center gap-2 text-[13px] text-muted">
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <span>›</span>}
          <span className={i === items.length - 1 ? 'font-medium text-text' : ''}>{it}</span>
        </span>
      ))}
    </nav>
  )
}

function AdminHomeBody({ mobile = false }: { mobile?: boolean }) {
  const navigate = useNavigate()
  const base = mobile ? '/m' : ''
  const cards: { border: string; icon: ReactNode; title: string; text: string; link?: ReactNode; onClick: () => void }[] = [
    {
      border: 'border-[#1478bd]',
      icon: <Building2 size={20} />,
      title: 'Компании и пользователи',
      text: 'Компании клиентов и их сотрудники',
      link: (
        <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary">
          {COMPANIES_COUNT} компаний <ArrowRight size={14} />
        </span>
      ),
      onClick: () => navigate(`${base}/companies`),
    },
    {
      border: 'border-[#8b5cf6]',
      icon: <Shapes size={20} />,
      title: 'Типы компаний',
      text: 'Доступ к статьям по типам',
      link: (
        <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary">
          3 типа <ArrowRight size={14} />
        </span>
      ),
      onClick: () => navigate(`${base}/company-types`),
    },
    {
      border: 'border-[#1e9e67]',
      icon: <BookOpen size={20} />,
      title: 'База знаний',
      text: 'Структура, теги, файлы',
      link: (
        <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary">
          {ARTICLES.length} статей <ArrowRight size={14} />
        </span>
      ),
      onClick: () => navigate(`${base}/kb`),
    },
    {
      border: 'border-[#c98612]',
      icon: <Settings2 size={20} />,
      title: 'Интеграции',
      text: 'Почта и Битрикс24',
      link: (
        <span className="mt-2 flex flex-col gap-1 text-[13px]">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-success" /> Почта подключена
          </span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-success" /> Битрикс24 подключён
          </span>
        </span>
      ),
      onClick: () => navigate(`${base}/admin/integrations`),
    },
    {
      border: 'border-[#1478bd]',
      icon: <ClipboardList size={20} />,
      title: 'Журнал действий',
      text: 'Что делали сотрудники',
      link: (
        <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary">
          Открыть журнал <ArrowRight size={14} />
        </span>
      ),
      onClick: () => navigate(`${base}/admin/audit`),
    },
    {
      border: 'border-[#c98612]',
      icon: <ListChecks size={20} />,
      title: 'Поля компании',
      text: 'Формы, обязательность и уникальность',
      link: (
        <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary">
          Настроить <ArrowRight size={14} />
        </span>
      ),
      onClick: () => navigate(`${base}/admin/company-fields`),
    },
  ]

  return (
    <>
      <div className="h-1 w-full bg-gradient-to-r from-primary via-[#8b5cf6] to-success" />
      <main className={mobile ? 'flex flex-1 flex-col px-4 pt-5 pb-10' : 'mx-auto w-full max-w-[1320px] flex-1 px-8 pt-8 pb-12'}>
        <span className="mb-3 block h-1 w-11 rounded bg-primary" />
        <h1 className={mobile ? 'text-[26px] font-extrabold' : 'text-[34px] font-extrabold'}>Администрирование</h1>
        <div className={`mt-6 grid gap-4 ${mobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
          {cards.map((c) => (
            <button
              key={c.title}
              onClick={c.onClick}
              className={`cursor-pointer rounded-xl border-2 bg-surface p-6 text-left shadow-(--shadow-card) transition-all duration-200 hover:-translate-y-1 hover:shadow-(--shadow-pop) ${c.border}`}
            >
              <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-white">{c.icon}</span>
              <p className="text-[17px] font-bold">{c.title}</p>
              <p className="mt-0.5 text-[13px] text-muted">{c.text}</p>
              <div className="mt-3">{c.link}</div>
            </button>
          ))}
        </div>
      </main>
    </>
  )
}

const COMPANIES_COUNT = COMPANIES.length

export function AdminHomeD() {
  return (
    <div className="flex min-h-full flex-col">
      <Topbar />
      <AdminHomeBody />
    </div>
  )
}

export function AdminHomeM() {
  return (
    <MobilePage title="Администрирование">
      <AdminHomeBody mobile />
    </MobilePage>
  )
}

export function AdminDeniedD() {
  const navigate = useNavigate()
  const { role } = useDemo()
  return (
    <div className="flex min-h-full flex-col">
      {role !== 'guest' && <Topbar />}
      <NotAvailable onBack={() => navigate(role === 'guest' ? '/' : '/dashboard')} backLabel="На главную" />
    </div>
  )
}

export function AdminDeniedM() {
  const navigate = useNavigate()
  const { role } = useDemo()
  return (
    <MobilePage title="Администрирование">
      <NotAvailable onBack={() => navigate(role === 'guest' ? '/m' : '/m/dashboard')} backLabel="На главную" />
    </MobilePage>
  )
}

function IntegrationsBody({ mobile = false, errorVariant = false }: { mobile?: boolean; errorVariant?: boolean }) {
  const { toast } = useDemo()
  const [, setParams] = useSearchParams()
  const [smtp, setSmtp] = useState(INTEGRATIONS.smtp)
  const [bxUrl, setBxUrl] = useState(INTEGRATIONS.bitrix.url)
  const smtpError = errorVariant

  return (
    <div className={`grid gap-4 ${mobile ? 'grid-cols-1' : 'grid-cols-2 items-start'}`}>
      <Card className={smtpError ? 'border-2 border-danger/50 p-6' : 'p-6'}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[17px] font-bold">Почтовый сервер (SMTP)</p>
            <p className="mt-0.5 text-[13px] text-muted">Уведомления о приглашениях, публикациях и запросах</p>
          </div>
          {smtpError ? (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-danger/40 bg-[#fbe4e4] px-2.5 py-1 text-xs font-semibold text-[#a12f2f]">
              <AlertTriangle size={13} /> Ошибка подключения
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-[#bfe3d0] bg-[#e2f3ea] px-2.5 py-1 text-xs font-semibold text-[#17724b]">
              <CheckCircle2 size={13} /> Подключено
            </span>
          )}
        </div>
        {smtpError && (
          <p className="mt-3 rounded-lg bg-[#fbe4e4] px-3.5 py-2.5 text-[13px] leading-relaxed text-[#a12f2f]">
            Последняя проверка не удалась: сервер не отвечает (тайм-аут 10 с). Проверьте хост, порт и доступность сети.
            <span className="mt-0.5 block font-(--font-caption) text-xs text-[#a12f2f]/70">APP_SMTP_UNREACHABLE</span>
          </p>
        )}
        <div className={`mt-4 grid gap-3 ${mobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
          <Field label="Хост">
            <Input value={smtp.host} onChange={(e) => setSmtp((s) => ({ ...s, host: e.target.value }))} />
          </Field>
          <Field label="Порт">
            <Input value={smtp.port} onChange={(e) => setSmtp((s) => ({ ...s, port: e.target.value }))} inputMode="numeric" />
          </Field>
          <Field label="Шифрование">
            <Select defaultValue={smtp.security}>
              <option>STARTTLS</option>
              <option>SSL/TLS</option>
              <option>Нет</option>
            </Select>
          </Field>
          <Field label="Отправитель">
            <Input defaultValue={smtp.sender} />
          </Field>
          <Field label="Логин">
            <Input defaultValue={smtp.login} />
          </Field>
          <Field label="Пароль" hint="Хранится в зашифрованном виде">
            <Input type="password" defaultValue="••••••••••" />
          </Field>
        </div>
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-border/60 pt-4">
          <Button
            variant="secondary"
            icon={<RefreshCw size={14} />}
            onClick={() =>
              smtpError
                ? toast('Проверка не пройдена: сервер недоступен', 'error')
                : toast('Тестовое письмо отправлено на ' + smtp.sender)
            }
          >
            Проверить подключение
          </Button>
          <Button onClick={() => toast('Настройки почты сохранены')}>Сохранить</Button>
        </div>
        <button
          onClick={() => setParams(smtpError ? {} : { 'smtp-error': '1' })}
          className="mt-3 cursor-pointer rounded-lg border border-dashed border-[#b8c2cd] bg-[#f7f9fb] px-3 py-2 text-left text-[12px] text-[#53606d] transition-colors hover:border-primary/40"
        >
          <span className="font-semibold text-[#3d4854]">Демо: </span>
          {smtpError ? 'вернуть состояние «подключено»' : 'показать состояние «ошибка подключения»'}
        </button>
      </Card>

      <Card className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[17px] font-bold">Битрикс24</p>
            <p className="mt-0.5 text-[13px] text-muted">Связь карточек компаний с CRM через входящий вебхук</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-[#bfe3d0] bg-[#e2f3ea] px-2.5 py-1 text-xs font-semibold text-[#17724b]">
            <CheckCircle2 size={13} /> Подключён
          </span>
        </div>
        <div className="mt-4 flex flex-col gap-3">
          <Field label="URL входящего вебхука" hint="Формат: https://портал/rest/пользователь/ключ/">
            <Input value={bxUrl} onChange={(e) => setBxUrl(e.target.value)} />
          </Field>
          <p className="rounded-lg bg-surface-2 px-3.5 py-2.5 text-xs leading-relaxed text-muted">
            Последняя синхронизация: {INTEGRATIONS.bitrix.lastSync}. В этапе 1 используется только ссылка на карточку компании.
          </p>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-4">
          <Button variant="secondary" icon={<RefreshCw size={14} />} onClick={() => toast('Соединение с Битрикс24 в порядке')}>
            Проверить
          </Button>
          <Button onClick={() => toast('Вебхук Битрикс24 сохранён')}>Сохранить</Button>
        </div>
      </Card>
    </div>
  )
}

export function IntegrationsD() {
  const [params] = useSearchParams()
  return (
    <div className="flex min-h-full flex-col">
      <Topbar />
      <main className="mx-auto w-full max-w-[1320px] flex-1 px-8 pt-6 pb-10">
        <Crumbs items={['Администрирование', 'Интеграции']} />
        <h1 className="mb-5 text-[28px] font-extrabold">Интеграции</h1>
        <IntegrationsBody errorVariant={params.get('smtp-error') === '1'} />
      </main>
    </div>
  )
}

export function IntegrationsM() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  return (
    <MobilePage title="Интеграции" onBack={() => navigate('/m/admin')}>
      <div className="flex flex-1 flex-col px-4 pt-4 pb-10">
        <IntegrationsBody mobile errorVariant={params.get('smtp-error') === '1'} />
      </div>
    </MobilePage>
  )
}

function AuditBody({ mobile = false }: { mobile?: boolean }) {
  const [kind, setKind] = useState<string>('all')
  const [query, setQuery] = useState('')
  const filtered = AUDIT.filter(
    (l) => (kind === 'all' || l.kind === kind) && (query.trim() === '' || (l.user + l.action + l.target).toLowerCase().includes(query.toLowerCase())),
  )
  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1 md:max-w-xs">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по журналу..."
            className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <select value={kind} onChange={(e) => setKind(e.target.value)} className="h-10 cursor-pointer rounded-lg border border-border bg-surface px-3 text-[13px] focus:outline-none">
          <option value="all">Все действия</option>
          {Object.entries(KIND_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>
      <Card className="overflow-hidden">
        {mobile ? (
          <div className="divide-y divide-border/40">
            {filtered.map((l) => (
              <div key={l.id} className="px-4 py-3.5">
                <p className="text-sm font-semibold">{l.action}</p>
                <p className="mt-0.5 text-[13px] text-muted">{l.target}</p>
                <p className="mt-1.5 text-xs text-muted">
                  {l.user} · {l.date}, {l.time}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-surface-2/50 text-[11px] tracking-wider text-muted uppercase">
                <th className="px-5 py-3 font-semibold">Дата и время</th>
                <th className="px-3 py-3 font-semibold">Пользователь</th>
                <th className="px-3 py-3 font-semibold">Действие</th>
                <th className="px-3 py-3 font-semibold">Объект</th>
                <th className="px-3 py-3 font-semibold">Категория</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.id} className="border-b border-border/40 last:border-b-0 hover:bg-bg/60">
                  <td className="px-5 py-3 whitespace-nowrap text-muted">
                    {l.date}, {l.time}
                  </td>
                  <td className="px-3 py-3 font-medium">{l.user}</td>
                  <td className="px-3 py-3">{l.action}</td>
                  <td className="px-3 py-3 text-muted">{l.target}</td>
                  <td className="px-3 py-3">
                    <span className="rounded-md border border-border bg-surface-2 px-2 py-0.5 text-xs font-medium text-muted">{KIND_LABEL[l.kind]}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="border-t border-border/60 px-5 py-3">
          <p className="text-[13px] text-muted">Показано {filtered.length} из {AUDIT.length} · журнал хранится 12 месяцев</p>
        </div>
      </Card>
    </>
  )
}

export function AuditD() {
  return (
    <div className="flex min-h-full flex-col">
      <Topbar />
      <main className="mx-auto w-full max-w-[1320px] flex-1 px-8 pt-6 pb-10">
        <Crumbs items={['Администрирование', 'Журнал действий']} />
        <h1 className="mb-1 text-[28px] font-extrabold">Журнал действий</h1>
        <p className="mb-5 text-sm text-muted">Действия сотрудников по статьям, компаниям, пользователям и правам</p>
        <AuditBody />
      </main>
    </div>
  )
}

export function AuditM() {
  const navigate = useNavigate()
  return (
    <MobilePage title="Журнал действий" onBack={() => navigate('/m/admin')}>
      <div className="flex flex-1 flex-col px-4 pt-4 pb-10">
        <AuditBody mobile />
      </div>
    </MobilePage>
  )
}

const FIELD_COLUMNS: { key: keyof CompanyFieldSetting; label: string }[] = [
  { key: 'show', label: 'В форме' },
  { key: 'required', label: 'Обязательное' },
  { key: 'unique', label: 'Уникальное' },
  { key: 'managerAccess', label: 'Менеджеру' },
  { key: 'onRegister', label: 'Регистрация' },
  { key: 'onCreate', label: 'Создание' },
  { key: 'onEdit', label: 'Редактирование' },
]

function FieldsBody({ mobile = false }: { mobile?: boolean }) {
  const { toast } = useDemo()
  const [settings, setSettings] = useState<CompanyFieldSetting[]>(FIELD_SETTINGS)
  const toggle = (id: string, key: keyof CompanyFieldSetting) =>
    setSettings((prev) => prev.map((s) => (s.id === id ? { ...s, [key]: !s[key] } : s)))

  return (
    <>
      <div className="mb-4 flex items-start gap-3 rounded-xl border border-primary/25 bg-secondary px-4 py-3.5">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary-strong">
          <FileStack size={14} />
        </span>
        <p className="text-[13px] leading-relaxed text-primary-strong">
          <b>Предварительная конфигурация.</b> Состав обязательных и уникальных полей нужно подтвердить у заказчика. Уникальность домена включена: при
          совпадении нескольких компаний регистрация направляется на ручную проверку.
        </p>
      </div>

      {mobile ? (
        <div className="flex flex-col gap-3">
          {settings.map((s) => (
            <Card key={s.id} className="p-4">
              <p className="text-sm font-bold">{s.name}</p>
              <div className="mt-3 grid grid-cols-2 gap-2.5">
                {FIELD_COLUMNS.map((c) => (
                  <div key={c.key} className="flex items-center justify-between gap-2 rounded-lg bg-surface-2/60 px-2.5 py-2">
                    <span className="text-xs text-muted">{c.label}</span>
                    <Switch checked={Boolean(s[c.key])} onChange={() => toggle(s.id, c.key)} label={c.label} />
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-surface-2/60 text-[11px] tracking-wider text-muted uppercase">
                <th className="px-5 py-3 font-semibold">Поле</th>
                {FIELD_COLUMNS.map((c) => (
                  <th key={c.key} className="px-3 py-3 text-center font-semibold">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {settings.map((s) => (
                <tr key={s.id} className="border-b border-border/40 last:border-b-0 hover:bg-bg/60">
                  <td className="px-5 py-2.5 font-semibold">{s.name}</td>
                  {FIELD_COLUMNS.map((c) => (
                    <td key={c.key} className="px-3 py-2.5">
                      <span className="flex justify-center">
                        <Switch checked={Boolean(s[c.key])} onChange={() => toggle(s.id, c.key)} label={`${s.name}: ${c.label}`} />
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <div className="mt-5 flex justify-end">
        <Button size="lg" onClick={() => toast('Схема полей компании сохранена')}>
          Сохранить
        </Button>
      </div>
    </>
  )
}

export function CompanyFieldsD() {
  return (
    <div className="flex min-h-full flex-col">
      <Topbar />
      <main className="mx-auto w-full max-w-[1320px] flex-1 px-8 pt-6 pb-10">
        <Crumbs items={['Администрирование', 'Настройка полей компании']} />
        <div className="mb-1 flex flex-wrap items-end justify-between gap-3">
          <h1 className="text-[28px] font-extrabold">Настройка полей компании</h1>
        </div>
        <p className="mb-5 text-sm text-muted">Единая схема полей для регистрации, ручного создания и редактирования компаний</p>
        <FieldsBody />
      </main>
    </div>
  )
}

export function CompanyFieldsM() {
  const navigate = useNavigate()
  return (
    <MobilePage title="Поля компании" onBack={() => navigate('/m/admin')}>
      <div className="flex flex-1 flex-col px-4 pt-4 pb-10">
        <FieldsBody mobile />
      </div>
    </MobilePage>
  )
}
