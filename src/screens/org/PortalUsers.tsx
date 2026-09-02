import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MoreHorizontal, Search, ShieldCheck, Trash2, UserPlus } from 'lucide-react'
import { COMPANIES, PORTAL_USERS, ROLES } from '../../data/mock'
import type { PortalUser, Role } from '../../data/types'
import { useDemo } from '../../demo/DemoContext'
import { Topbar } from '../../components/shell/Topbar'
import { MobilePage } from '../../components/shell/MobileShell'
import { Avatar, Button, Field, Input, Select } from '../../components/ui'
import { Modal } from '../../components/overlays'

function roleLabel(r: Role): string {
  return ROLES.find((x) => x.id === r)?.name ?? r
}

function initials(name: string): string {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('')
}

function InviteDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast, role: currentRole } = useDemo()
  const isAdmin = currentRole === 'admin'
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role>('client-user')
  const [companyId, setCompanyId] = useState(COMPANIES[0].id)
  const [error, setError] = useState('')
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Пригласить пользователя"
      width={520}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Отмена</Button>
          <Button
            onClick={() => {
              if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
                setError('Укажите корректный email')
                return
              }
              toast(`Приглашение отправлено на ${email}`)
              onClose()
              setEmail('')
              setError('')
            }}
          >
            Отправить приглашение
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {error && <p className="rounded-lg border border-danger/30 bg-[#fbe4e4] px-3.5 py-2.5 text-[13px] text-[#a12f2f]">{error}</p>}
        <Field label="Рабочий email" required error={error && !email ? error : undefined}>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.ru" autoFocus />
        </Field>
        <Field
          label="Роль на портале"
          required
          hint={isAdmin ? undefined : 'Назначать роли может только администратор портала — новый пользователь получит роль «Сотрудник клиента»'}
        >
          {isAdmin ? (
            <Select value={role} onChange={(e) => setRole(e.target.value as Role)}>
              {ROLES.filter((r) => r.id !== 'guest').map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </Select>
          ) : (
            <Input value="Сотрудник клиента" disabled />
          )}
        </Field>
        <Field label="Компания" required>
          <Select value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
            {COMPANIES.map((c) => (
              <option key={c.id} value={c.id}>{c.fullName}</option>
            ))}
          </Select>
        </Field>
        <p className="rounded-lg bg-surface-2 px-3.5 py-2.5 text-xs leading-relaxed text-muted">
          Пользователь получит письмо со ссылкой для создания пароля. Роль можно изменить позже в карточке пользователя.
        </p>
      </div>
    </Modal>
  )
}

function RoleDialog({ user, onClose }: { user: PortalUser | null; onClose: () => void }) {
  const { toast } = useDemo()
  const [role, setRole] = useState<Role>(user?.role ?? 'client-user')
  if (!user) return null
  return (
    <Modal
      open
      onClose={onClose}
      title="Смена роли"
      width={520}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Отмена</Button>
          <Button
            onClick={() => {
              toast(`Роль ${user.name}: ${roleLabel(user.role)} → ${roleLabel(role)}`)
              onClose()
            }}
          >
            Сохранить
          </Button>
        </>
      }
    >
      <div className="flex items-center gap-3 border-b border-border/60 pb-4">
        <Avatar initials={initials(user.name)} size={40} />
        <div>
          <p className="text-sm font-semibold">{user.name}</p>
          <p className="text-xs text-muted">{user.email}</p>
        </div>
      </div>
      <div className="mt-4">
        <Field label="Новая роль" hint="Права действуют сразу после сохранения">
          <Select value={role} onChange={(e) => setRole(e.target.value as Role)}>
            {ROLES.filter((r) => r.id !== 'guest').map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </Select>
        </Field>
        <p className="mt-3 rounded-lg bg-surface-2 px-3.5 py-2.5 text-xs leading-relaxed text-muted">
          Текущая роль: <b className="text-text">{roleLabel(user.role)}</b>. Компания: {COMPANIES.find((c) => c.id === user.companyId)?.fullName ?? '—'}.
        </p>
      </div>
    </Modal>
  )
}

function DeleteDialog({ user, onClose }: { user: PortalUser | null; onClose: () => void }) {
  const { toast } = useDemo()
  if (!user) return null
  return (
    <Modal
      open
      onClose={onClose}
      title="Удалить пользователя?"
      width={480}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Отмена</Button>
          <Button
            variant="danger"
            onClick={() => {
              toast(`Пользователь ${user.name} удалён`, 'info')
              onClose()
            }}
          >
            Удалить
          </Button>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-muted">
        <b className="text-text">{user.name}</b> ({user.email}) потеряет доступ к порталу. История действий сохранится в журнале.
      </p>
    </Modal>
  )
}

function UsersScreen({ mobile = false }: { mobile?: boolean }) {
  const [params, setParams] = useSearchParams()
  const { role, toast } = useDemo()
  const [query, setQuery] = useState('')
  const [menuFor, setMenuFor] = useState<string | null>(null)
  const [roleFor, setRoleFor] = useState<PortalUser | null>(null)
  const [deleteFor, setDeleteFor] = useState<PortalUser | null>(null)
  const isAdmin = role === 'admin'
  const inviteOpen = params.get('invite') === '1'

  const users = PORTAL_USERS.filter((u) => query.trim() === '' || u.name.toLowerCase().includes(query.toLowerCase()) || u.email.includes(query))

  const menu = (u: PortalUser) => (
    <div className="absolute right-4 top-11 z-30 w-[210px] animate-(--animate-scale-in) rounded-xl border border-border bg-surface p-1.5 shadow-(--shadow-pop)">
      {isAdmin && (
        <button onClick={() => { setRoleFor(u); setMenuFor(null) }} className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] hover:bg-surface-2">
          <ShieldCheck size={14} className="text-muted" /> Сменить роль
        </button>
      )}
      <button onClick={() => { toast(`Компания ${u.name}: ${COMPANIES.find((c) => c.id === u.companyId)?.shortName ?? '—'}`, 'info'); setMenuFor(null) }} className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] hover:bg-surface-2">
        Привязка к компании
      </button>
      {isAdmin && (
        <button onClick={() => { setDeleteFor(u); setMenuFor(null) }} className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] text-danger hover:bg-[#fbe4e4]">
          <Trash2 size={14} /> Удалить пользователя
        </button>
      )}
    </div>
  )

  return (
    <>
      {!mobile && <Topbar />}
      <main className={mobile ? 'flex flex-1 flex-col px-4 pt-4 pb-10' : 'mx-auto w-full max-w-[1320px] flex-1 px-8 pt-6 pb-10'}>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className={mobile ? 'text-[24px] font-extrabold' : 'text-[28px] font-extrabold'}>Пользователи портала</h1>
            <p className="mt-1 text-sm text-muted">
              {isAdmin ? 'Управляйте ролями и доступом сотрудников MaxSoft и клиентов.' : 'Вы можете приглашать пользователей и привязывать их к компаниям. Смена ролей и удаление — только для администратора портала.'}
            </p>
          </div>
          <Button onClick={() => setParams({ invite: '1' })} icon={<UserPlus size={15} />}>Пригласить пользователя</Button>
        </div>

        <div className="relative mb-4 max-w-md">
          <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Имя или email..."
            className="h-10 w-full rounded-lg border border-border bg-surface pr-3 pl-9 text-sm focus:border-primary focus:outline-none"
          />
        </div>

        {mobile ? (
          <div className="flex flex-col gap-2.5">
            {users.map((u) => (
              <div key={u.id} className="relative rounded-xl border border-border/60 bg-surface p-4 shadow-(--shadow-card)">
                <div className="flex items-center gap-3">
                  <Avatar initials={initials(u.name)} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{u.name}</p>
                    <p className="truncate text-xs text-muted">{u.email}</p>
                  </div>
                  <button onClick={() => setMenuFor(menuFor === u.id ? null : u.id)} aria-label="Действия" className="cursor-pointer rounded-lg border border-border px-2 py-1.5 text-muted">
                    <MoreHorizontal size={15} />
                  </button>
                </div>
                <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-md border border-border bg-surface-2 px-2 py-0.5 font-medium text-muted">{roleLabel(u.role)}</span>
                  <span className="text-muted">{COMPANIES.find((c) => c.id === u.companyId)?.shortName ?? 'MaxSoft'}</span>
                  <span className={u.status === 'Заблокирован' ? 'ml-auto text-danger' : 'ml-auto text-success'}>{u.status}</span>
                </div>
                {menuFor === u.id && menu(u)}
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border/60 bg-surface shadow-(--shadow-card)">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-surface-2/50 text-[11px] tracking-wider text-muted uppercase">
                  <th className="px-5 py-3 font-semibold">Пользователь</th>
                  <th className="px-3 py-3 font-semibold">Роль</th>
                  <th className="px-3 py-3 font-semibold">Компания</th>
                  <th className="px-3 py-3 font-semibold">Статус</th>
                  <th className="px-3 py-3 font-semibold">Активность</th>
                  <th className="w-12 px-3 py-3" />
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="relative border-b border-border/40 last:border-b-0 hover:bg-bg/60">
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-3">
                        <Avatar initials={initials(u.name)} size={34} />
                        <span>
                          <span className="block font-semibold">{u.name}</span>
                          <span className="block text-xs text-muted">{u.email}</span>
                        </span>
                      </span>
                    </td>
                    <td className="px-3 py-3">{roleLabel(u.role)}</td>
                    <td className="px-3 py-3 text-muted">{COMPANIES.find((c) => c.id === u.companyId)?.shortName ?? 'MaxSoft'}</td>
                    <td className="px-3 py-3">
                      <span className={u.status === 'Заблокирован' ? 'font-medium text-danger' : u.status === 'Приглашён' ? 'font-medium text-warning' : 'font-medium text-success'}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs text-muted">{u.lastActive}</td>
                    <td className="px-3 py-3">
                      <button onClick={() => setMenuFor(menuFor === u.id ? null : u.id)} aria-label="Действия" className="cursor-pointer rounded-lg border border-border px-2.5 py-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-text">
                        <MoreHorizontal size={15} />
                      </button>
                      {menuFor === u.id && menu(u)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-border/60 px-5 py-3">
              <p className="text-[13px] text-muted">Показано {users.length} из {PORTAL_USERS.length}</p>
            </div>
          </div>
        )}
        {!isAdmin && (
          <p className="mt-4 rounded-lg border border-dashed border-border bg-surface/60 px-4 py-3 text-[13px] text-muted">
            Роли «Администратор портала» назначает только администратор. Если пользователю нужна другая роль — обратитесь к администратору портала.
          </p>
        )}
      </main>

      <InviteDialog open={inviteOpen} onClose={() => setParams({})} />
      {roleFor && <RoleDialog user={roleFor} onClose={() => setRoleFor(null)} />}
      {deleteFor && <DeleteDialog user={deleteFor} onClose={() => setDeleteFor(null)} />}
    </>
  )
}

export function PortalUsersD() {
  return <UsersScreen />
}

export function PortalUsersM() {
  return (
    <MobilePage title="Пользователи портала">
      <UsersScreen mobile />
    </MobilePage>
  )
}
