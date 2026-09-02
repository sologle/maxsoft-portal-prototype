import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Box, ExternalLink, FileText, Globe, Plus, X } from 'lucide-react'
import { COMPANIES, COMPANY_TYPES, PORTAL_USERS } from '../../data/mock'
import { useDemo } from '../../demo/DemoContext'
import { Topbar } from '../../components/shell/Topbar'
import { MobilePage } from '../../components/shell/MobileShell'
import { Avatar, Button, Card, Field, Input, Select } from '../../components/ui'
import { NotAvailable } from '../../components/overlays'
import { StatusBadge } from './Companies'

function canSeeInternalType(role: string): boolean {
  return role === 'admin' || role === 'engineer' || role === 'manager'
}

function GeneralTab({ companyId, editing, onCloseEdit }: { companyId: string; editing: boolean; onCloseEdit: () => void }) {
  const { toast, role } = useDemo()
  const c = COMPANIES.find((x) => x.id === companyId)!
  const [domains, setDomains] = useState<string[]>(c.domains)
  const [newDomain, setNewDomain] = useState('')
  const [domainError, setDomainError] = useState('')
  const showType = canSeeInternalType(role)

  const addDomain = () => {
    const d = newDomain.trim().toLowerCase()
    if (!d) return
    if (!d.includes('.')) {
      setDomainError('Введите домен вида company.ru')
      return
    }
    if (COMPANIES.some((x) => x.id !== c.id && x.domains.includes(d))) {
      setDomainError(`Домен уже используется: ${COMPANIES.find((x) => x.domains.includes(d))?.fullName}`)
      return
    }
    setDomainError('')
    setDomains((p) => [...p, d])
    setNewDomain('')
    toast(`Домен «${d}» добавлен`)
  }

  const rows: { label: string; value: string }[] = [
    { label: 'Полное наименование', value: c.fullName },
    { label: 'Сокращённое наименование', value: c.shortName },
    { label: 'ИНН', value: c.inn },
    { label: 'КПП', value: c.kpp },
    ...(showType ? [{ label: 'Тип компании', value: COMPANY_TYPES.find((t) => t.id === c.typeId)?.name ?? '—' }] : []),
    { label: 'Юридический адрес', value: c.address },
    { label: 'Основной email', value: c.email },
    { label: 'Телефон', value: c.phone },
    { label: 'Договор / основание', value: c.contract },
    { label: 'Проект', value: c.project },
  ]

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_420px]">
      <Card className="p-6">
        <p className="text-[17px] font-bold">Данные компании</p>
        <p className="mt-0.5 text-xs text-muted">Карточка юридического лица</p>
        {editing ? (
          <div className="mt-5 flex flex-col gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Полное наименование" required>
                <Input defaultValue={c.fullName} />
              </Field>
              <Field label="Сокращённое наименование">
                <Input defaultValue={c.shortName} />
              </Field>
              <Field label="ИНН" required hint="Поле уникально и недоступно после создания">
                <Input defaultValue={c.inn} disabled />
              </Field>
              <Field label="КПП">
                <Input defaultValue={c.kpp} />
              </Field>
              {showType && (
                <Field label="Тип компании">
                  <Select defaultValue={c.typeId}>
                    {COMPANY_TYPES.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </Select>
                </Field>
              )}
              <Field label="Основной email" required>
                <Input defaultValue={c.email} />
              </Field>
              <Field label="Телефон">
                <Input defaultValue={c.phone} />
              </Field>
              <Field label="Проект">
                <Input defaultValue={c.project} />
              </Field>
              <Field label="Статус">
                <Select defaultValue={c.status}>
                  <option>Активна</option>
                  <option>Истекает</option>
                  <option>Приостановлена</option>
                </Select>
              </Field>
              <Field label="Срок действия статуса">
                <Input defaultValue={c.statusUntil} />
              </Field>
            </div>
            <div className="flex justify-end gap-2 border-t border-border/60 pt-4">
              <Button variant="secondary" onClick={onCloseEdit}>Отмена</Button>
              <Button
                onClick={() => {
                  toast('Изменения сохранены')
                  onCloseEdit()
                }}
              >
                Сохранить
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-4 divide-y divide-border/50">
              {rows.map((r) => (
                <div key={r.label} className="grid grid-cols-2 gap-3 py-2.5">
                  <span className="text-[11px] font-semibold tracking-wider text-muted uppercase">{r.label}</span>
                  <span className="text-sm font-medium">{r.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-border/60 pt-4">
              <p className="text-[15px] font-bold">Рабочие домены</p>
              <p className="mt-0.5 text-xs text-muted">Пользователи с корпоративной почтой автоматически связываются с компанией.</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {domains.map((d) => (
                  <span key={d} className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-secondary px-3 py-1.5 text-[13px] font-medium text-primary-strong">
                    <Globe size={13} />
                    {d}
                    {editing && (
                      <button
                        onClick={() => {
                          setDomains((p) => p.filter((x) => x !== d))
                          toast(`Домен «${d}» удалён`, 'info')
                        }}
                        aria-label="Удалить домен"
                        className="cursor-pointer hover:text-danger"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </span>
                ))}
                {editing && (
                  <span className="flex flex-col">
                    <span className="flex gap-2">
                      <Input className="h-9 w-44" placeholder="новый.домен.ru" value={newDomain} onChange={(e) => setNewDomain(e.target.value)} invalid={!!domainError} />
                      <Button variant="secondary" size="sm" onClick={addDomain} icon={<Plus size={14} />}>
                        Добавить
                      </Button>
                    </span>
                    {domainError && <span className="mt-1 text-xs text-danger">{domainError}</span>}
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </Card>

      <Card className="h-fit p-6">
        <p className="text-[17px] font-bold">Связи и доступ</p>
        <div className="mt-4 flex flex-col divide-y divide-border/50">
          <div className="flex gap-3 border-l-[3px] border-primary py-1 pl-3.5">
            <FileText size={17} className="mt-4 shrink-0 text-primary" />
            <div className="flex-1">
              <p className="text-xs text-muted">Договор</p>
              <p className="mt-0.5 text-sm font-semibold">{c.contract}</p>
              <p className="mt-0.5 text-xs text-muted">Статус: {c.status} · до {c.statusUntil}</p>
            </div>
          </div>
          <div className="mt-4 flex gap-3 border-l-[3px] border-success py-1 pl-3.5">
            <Box size={17} className="mt-4 shrink-0 text-success" />
            <div className="flex-1">
              <p className="text-xs text-muted">Основной проект</p>
              <p className="mt-0.5 text-sm font-semibold">{c.project}</p>
              <p className="mt-0.5 text-xs text-muted">Проект компании</p>
            </div>
          </div>
          <div className="mt-4 flex gap-3 border-l-[3px] border-[#8b5cf6] py-1 pl-3.5">
            <ExternalLink size={17} className="mt-4 shrink-0 text-[#8b5cf6]" />
            <div className="flex-1">
              <p className="text-xs text-muted">Битрикс24</p>
              <a href={c.bitrix} onClick={(e) => e.preventDefault()} className="mt-0.5 block text-sm font-semibold text-link hover:underline">
                Открыть карточку в Битрикс24 ↗
              </a>
              <p className="mt-0.5 text-xs text-muted">Внешняя ссылка на связанную карточку</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

function UsersTab({ companyId }: { companyId: string }) {
  const users = PORTAL_USERS.filter((u) => u.companyId === companyId)
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
        <p className="text-[17px] font-bold">Пользователи компании</p>
        <span className="text-[13px] text-muted">{users.length} чел.</span>
      </div>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border/60 bg-surface-2/50 text-[11px] tracking-wider text-muted uppercase">
            <th className="px-6 py-3 font-semibold">Пользователь</th>
            <th className="px-3 py-3 font-semibold">Роль в компании</th>
            <th className="px-3 py-3 font-semibold">Статус</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b border-border/40 last:border-b-0 hover:bg-bg/60">
              <td className="px-6 py-3">
                <span className="flex items-center gap-3">
                  <Avatar initials={u.name.split(' ').map((w) => w[0]).join('')} size={32} tone="gray" />
                  <span>
                    <span className="block font-semibold">{u.name}</span>
                    <span className="block text-xs text-muted">{u.email}</span>
                  </span>
                </span>
              </td>
              <td className="px-3 py-3">{u.companyRole === 'admin' ? 'Администратор компании' : 'Сотрудник'}</td>
              <td className="px-3 py-3">
                <span className={u.status === 'Заблокирован' ? 'text-danger' : 'text-success'}>{u.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}

export function CompanyCardD() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const { role } = useDemo()
  const company = COMPANIES.find((c) => c.id === id)
  const [editing, setEditing] = useState(false)
  const tab = params.get('tab') === 'users' ? 'users' : 'general'

  if (!company) return <Shell><NotAvailable onBack={() => navigate('/companies')} backLabel="К списку компаний" /></Shell>
  if (role === 'client-admin' || role === 'client-user')
    return <Shell><NotAvailable onBack={() => navigate('/dashboard')} backLabel="На главную" /></Shell>

  return (
    <Shell>
      <main className="mx-auto w-full max-w-[1320px] flex-1 px-8 pt-6 pb-10">
        <nav className="mb-2 flex items-center gap-2 text-[13px] text-muted">
          <button onClick={() => navigate('/companies')} className="cursor-pointer hover:text-text">Компании</button>
          <span>›</span>
          <span className="font-medium text-text">{company.shortName}</span>
        </nav>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-[28px] font-extrabold">{company.fullName}</h1>
            <StatusBadge status={company.status} />
          </div>
          {!editing && <Button variant="secondary" onClick={() => setEditing(true)}>Редактировать</Button>}
        </div>
        <div className="mb-5 flex gap-1 border-b border-border">
          {[
            { id: 'general', label: 'Общее' },
            { id: 'users', label: `Пользователи (${company.usersCount})` },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setParams(t.id === 'general' ? {} : { tab: 'users' })}
              className={`-mb-px cursor-pointer border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                tab === t.id ? 'border-primary text-primary-strong' : 'border-transparent text-muted hover:text-text'
              }`}
            >
              {t.label}
            </button>
          ))}
          <span className="-mb-px cursor-not-allowed border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-muted/50 select-none" title="Появится на этапе 2">
            Запросы · Этап 2
          </span>
        </div>
        {tab === 'general' ? <GeneralTab companyId={company.id} editing={editing} onCloseEdit={() => setEditing(false)} /> : <UsersTab companyId={company.id} />}
      </main>
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <Topbar />
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  )
}

export function CompanyCardM() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const { role } = useDemo()
  const company = COMPANIES.find((c) => c.id === id)
  const [editing, setEditing] = useState(false)
  const tab = params.get('tab') === 'users' ? 'users' : 'general'

  if (!company || role === 'client-admin' || role === 'client-user')
    return (
      <MobilePage title="Компания" onBack={() => navigate('/m/companies')}>
        <NotAvailable onBack={() => navigate('/m/dashboard')} backLabel="На главную" />
      </MobilePage>
    )

  return (
    <MobilePage title={company.shortName} onBack={() => navigate('/m/companies')}>
      <div className="flex flex-1 flex-col px-4 pt-4 pb-10">
        <div className="mb-4 flex items-center justify-between gap-2">
          <StatusBadge status={company.status} />
          <Button variant="secondary" size="sm" onClick={() => setEditing((v) => !v)}>
            {editing ? 'Закрыть' : 'Редактировать'}
          </Button>
        </div>
        <div className="mb-4 flex gap-4 border-b border-border text-sm">
          {[
            { id: 'general', label: 'Общее' },
            { id: 'users', label: `Пользователи (${company.usersCount})` },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setParams(t.id === 'general' ? {} : { tab: 'users' })}
              className={`-mb-px cursor-pointer border-b-2 px-1 pb-2.5 font-medium transition-colors ${
                tab === t.id ? 'border-primary text-primary-strong' : 'border-transparent text-muted'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="scale-100">
          {tab === 'general' ? <GeneralTab companyId={company.id} editing={editing} onCloseEdit={() => setEditing(false)} /> : <UsersTab companyId={company.id} />}
        </div>
      </div>
    </MobilePage>
  )
}
