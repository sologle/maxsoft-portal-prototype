import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Building2, CheckCircle2, ChevronDown, MoreHorizontal, Plus, Search, Users, XCircle } from 'lucide-react'
import { COMPANIES, COMPANY_TYPES } from '../../data/mock'
import type { Company } from '../../data/types'
import { useDemo } from '../../demo/DemoContext'
import { Topbar } from '../../components/shell/Topbar'
import { useFormatNav } from '../../components/nav'
import { MobilePage } from '../../components/shell/MobileShell'
import { Button, Field, Input, Select } from '../../components/ui'
import { Modal } from '../../components/overlays'

export function StatusBadge({ status }: { status: Company['status'] }) {
  const map = {
    Активна: { cls: 'border-[#bfe3d0] bg-[#e2f3ea] text-[#17724b]', icon: <CheckCircle2 size={12} /> },
    Истекает: { cls: 'border-[#ecd9b0] bg-[#faf0dc] text-[#8a5c0d]', icon: <span className="inline-block h-2 w-2 rounded-full bg-warning" /> },
    Приостановлена: { cls: 'border-[#f0c4c4] bg-[#fbe4e4] text-[#a12f2f]', icon: <XCircle size={12} /> },
  }[status]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-semibold ${map.cls}`}>
      {map.icon}
      {status}
    </span>
  )
}

const EDGE: Record<Company['status'], string> = {
  Активна: 'border-l-[3px] border-l-success',
  Истекает: 'border-l-[3px] border-l-warning',
  Приостановлена: 'border-l-[3px] border-l-danger',
}

function AddCompanyDialog({ open, onClose, onCreated, onConflict }: { open: boolean; onClose: () => void; onCreated: () => void; onConflict: () => void }) {
  const { toast } = useDemo()
  const [name, setName] = useState('')
  const [inn, setInn] = useState('')
  const [domains, setDomains] = useState('')
  const [errors, setErrors] = useState<{ name?: string; inn?: string; domain?: string }>({})
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Новая компания"
      width={560}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Отмена</Button>
          <Button
            onClick={() => {
              const errs: typeof errors = {}
              if (!name.trim()) errs.name = 'Укажите наименование'
              if (!/^\d{10,12}$/.test(inn.trim())) errs.inn = 'ИНН — 10 или 12 цифр'
              setErrors(errs)
              if (Object.keys(errs).length > 0) return
              // Уникальность домена и ИНН: совпадение с существующей компанией — ручная проверка
              const domainList = domains.split(',').map((d) => d.trim().toLowerCase()).filter(Boolean)
              const domainConflict = domainList.some((d) => COMPANIES.some((c) => c.domains.includes(d)))
              const innConflict = COMPANIES.some((c) => c.inn === inn.trim())
              if (domainConflict || innConflict) {
                onClose()
                onConflict()
                return
              }
              toast(`Компания «${name.trim()}» добавлена`)
              onCreated()
            }}
          >
            Создать
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Полное наименование" required error={errors.name}>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="ООО «Пример»" autoFocus />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="ИНН" required error={errors.inn} hint="Проверяется на уникальность">
            <Input value={inn} onChange={(e) => setInn(e.target.value)} placeholder="1234567890" inputMode="numeric" invalid={!!errors.inn} />
          </Field>
          <Field label="Тип компании" required>
            <Select defaultValue="t-basic">
              {COMPANY_TYPES.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Рабочие домены" hint="Через запятую. Домен проверяется на уникальность">
          <Input value={domains} onChange={(e) => setDomains(e.target.value)} placeholder="example.ru" />
        </Field>
        <div className="rounded-lg border border-dashed border-[#b8c2cd] bg-[#f7f9fb] px-3.5 py-2.5 text-[12px] leading-relaxed text-[#53606d]">
          <span className="font-semibold text-[#3d4854]">Демо-подсказка. </span>
          Введите ИНН 5405012345 или домен sibirproject.ru — покажем состояние «конфликт домена или ИНН».
        </div>
      </div>
    </Modal>
  )
}

function ConflictBanner() {
  return (
    <div className="mb-4 flex items-start gap-3 rounded-xl border border-warning/40 bg-[#faf0dc] px-4 py-3.5">
      <XCircle size={18} className="mt-0.5 shrink-0 text-warning" />
      <div className="text-sm">
        <p className="font-semibold text-[#6b4a0a]">Конфликт домена или ИНН</p>
        <p className="mt-0.5 text-[13px] leading-relaxed text-[#6b4a0a]/85">
          Домен «sibirproject.ru» уже привязан к ООО «СибирьПроект», а ИНН 5405012345 — к другой записи. Проверьте данные: компания не создана.
          <span className="mt-0.5 block font-(--font-caption) text-xs text-[#6b4a0a]/60">APP_COMPANY_CONFLICT</span>
        </p>
      </div>
    </div>
  )
}

function CompaniesScreen({ mobile = false }: { mobile?: boolean }) {
  const { role } = useDemo()
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [menuFor, setMenuFor] = useState<string | null>(null)
  const fmtNav = useFormatNav()
  const isManager = role === 'manager'
  const canAdd = role === 'admin' || role === 'engineer' || isManager

  const filtered = useMemo(
    () =>
      COMPANIES.filter(
        (c) =>
          (query.trim() === '' || c.fullName.toLowerCase().includes(query.toLowerCase()) || c.inn.includes(query)) &&
          (typeFilter === 'all' || c.typeId === typeFilter) &&
          (statusFilter === 'all' || c.status === statusFilter),
      ),
    [query, typeFilter, statusFilter],
  )

  const openCard = (id: string) => fmtNav(`/companies/${id}`)

  const addOpen = params.get('new') === '1'
  const conflict = params.get('conflict') === '1'

  return (
    <>
      {!mobile && <Topbar />}
      <main className={mobile ? 'flex flex-1 flex-col px-4 pt-4 pb-10' : 'mx-auto w-full max-w-[1320px] flex-1 px-8 pt-6 pb-10'}>
        {mobile ? (
          <h1 className="mb-4 text-[24px] font-extrabold">Компании</h1>
        ) : (
          <div className="mb-5 flex items-end justify-between">
            <h1 className="text-[28px] font-extrabold">Компании</h1>
            {canAdd && <Button onClick={() => setParams({ new: '1' })}>Добавить компанию</Button>}
          </div>
        )}
        {conflict && <ConflictBanner />}
        {mobile && canAdd && (
          <Button className="mb-4 w-full" onClick={() => setParams({ new: '1' })} icon={<Plus size={15} />}>
            Добавить компанию
          </Button>
        )}
        {mobile && canAdd && (
          <button onClick={() => setParams({ new: '1', conflict: '1' })} className="mb-4 cursor-pointer rounded-lg border border-dashed border-[#b8c2cd] bg-[#f7f9fb] px-3 py-2 text-left text-[12px] text-[#53606d]">
            <span className="font-semibold text-[#3d4854]">Демо: </span>показать состояние «конфликт домена или ИНН»
          </button>
        )}

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1 md:max-w-md">
            <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Название или ИНН..."
              className="h-10 w-full rounded-lg border border-border bg-surface pr-3 pl-9 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-10 cursor-pointer appearance-none rounded-lg border border-border bg-secondary/60 pr-8 pl-9 text-[13px] font-medium text-primary-strong focus:outline-none"
            >
              <option value="all">Тип: все</option>
              {COMPANY_TYPES.map((t) => (
                <option key={t.id} value={t.id}>Тип: {t.name}</option>
              ))}
            </select>
            <Building2 size={14} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-primary-strong" />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 cursor-pointer appearance-none rounded-lg border border-border bg-secondary/60 pr-8 pl-9 text-[13px] font-medium text-primary-strong focus:outline-none"
            >
              <option value="all">Статус: все</option>
              <option value="Активна">Статус: активна</option>
              <option value="Истекает">Статус: истекает</option>
              <option value="Приостановлена">Статус: приостановлена</option>
            </select>
            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2">
              <span className="block h-2.5 w-2.5 rounded-full border-2 border-primary-strong" />
            </span>
          </div>
        </div>

        {mobile ? (
          <div className="flex flex-col gap-2.5">
            {filtered.map((c) => (
              <button key={c.id} onClick={() => openCard(c.id)} className={`cursor-pointer rounded-xl border border-border/60 border-l-[3px] bg-surface p-4 text-left shadow-(--shadow-card) transition-colors ${EDGE[c.status].split(' ')[1]} hover:border-primary/40`} style={{ borderLeftColor: c.status === 'Активна' ? '#1e9e67' : c.status === 'Истекает' ? '#c98612' : '#d64545' }}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[15px] font-bold">{c.fullName}</p>
                  <MoreHorizontal size={16} className="text-muted" />
                </div>
                <p className="mt-0.5 text-xs text-muted">ИНН {c.inn}</p>
                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <StatusBadge status={c.status} />
                  <span className="text-xs text-muted">{COMPANY_TYPES.find((t) => t.id === c.typeId)?.name}</span>
                  <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted">
                    <Users size={13} /> {c.usersCount}
                  </span>
                </div>
              </button>
            ))}
            {filtered.length === 0 && <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted">Компании не найдены</p>}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border/60 bg-surface shadow-(--shadow-card)">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-surface-2/60 text-[11px] tracking-wider text-muted uppercase">
                  <th className="px-5 py-3 font-semibold">Компания</th>
                  <th className="px-3 py-3 font-semibold">ИНН</th>
                  <th className="px-3 py-3 font-semibold">Тип</th>
                  <th className="px-3 py-3 font-semibold">Статус / срок</th>
                  <th className="px-3 py-3 font-semibold">Пользователи</th>
                  <th className="w-14 px-3 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className={`cursor-pointer border-b border-border/40 bg-surface transition-colors last:border-b-0 hover:bg-bg/60 ${EDGE[c.status]}`} onClick={() => openCard(c.id)}>
                    <td className="px-5 py-3.5 font-semibold">{c.fullName}</td>
                    <td className="px-3 py-3.5 text-muted">{c.inn}</td>
                    <td className="px-3 py-3.5">{COMPANY_TYPES.find((t) => t.id === c.typeId)?.name}</td>
                    <td className="px-3 py-3.5">
                      <StatusBadge status={c.status} />
                      <p className="mt-0.5 text-xs text-muted">{c.statusUntil !== '—' ? `до ${c.statusUntil}` : 'бессрочно'}</p>
                    </td>
                    <td className="px-3 py-3.5">
                      <span className="inline-flex items-center gap-1.5 font-semibold">
                        <Users size={15} className="text-primary" /> {c.usersCount}
                      </span>
                    </td>
                    <td className="relative px-3 py-3.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setMenuFor(menuFor === c.id ? null : c.id)
                        }}
                        aria-label="Действия"
                        className="cursor-pointer rounded-lg border border-border px-2.5 py-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-text"
                      >
                        <MoreHorizontal size={16} />
                      </button>
                      {menuFor === c.id && (
                        <>
                          <div className="fixed inset-0 z-20" onClick={(e) => { e.stopPropagation(); setMenuFor(null) }} />
                          <div className="absolute right-3 top-11 z-30 w-[190px] animate-(--animate-scale-in) rounded-xl border border-border bg-surface p-1.5 shadow-(--shadow-pop)">
                            <button onClick={(e) => { e.stopPropagation(); openCard(c.id); setMenuFor(null) }} className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] hover:bg-surface-2">
                              Открыть карточку
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); setMenuFor(null); fmtNav(`/companies/${c.id}?tab=users`) }} className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] hover:bg-surface-2">
                              Пользователи
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-muted">Компании не найдены</td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="flex items-center justify-between border-t border-border/60 px-5 py-3">
              <p className="text-[13px] text-muted">Показано {filtered.length} из {COMPANIES.length}</p>
              <div className="flex items-center gap-1.5">
                <button className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-border text-muted hover:bg-surface-2"><ChevronDown size={14} className="rotate-90" /></button>
                <button className="h-9 min-w-9 rounded-lg border border-primary bg-primary text-sm font-medium text-white">1</button>
                <button className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-border text-muted hover:bg-surface-2"><ChevronDown size={14} className="-rotate-90" /></button>
              </div>
            </div>
          </div>
        )}
      </main>

      <AddCompanyDialog
        open={addOpen || conflict}
        onClose={() => setParams({})}
        onCreated={() => setParams({})}
        onConflict={() => setParams({ conflict: '1' })}
      />
    </>
  )
}

export function CompaniesD() {
  return <CompaniesScreen />
}

export function CompaniesM() {
  return (
    <MobilePage title="Компании">
      <CompaniesScreen mobile />
    </MobilePage>
  )
}
