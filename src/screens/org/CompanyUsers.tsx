import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Ban, MoreHorizontal, UserPlus } from 'lucide-react'
import { COMPANY_USERS_SIBIR } from '../../data/mock'
import type { PortalUser } from '../../data/types'
import { useDemo } from '../../demo/DemoContext'
import { Topbar } from '../../components/shell/Topbar'
import { MobilePage } from '../../components/shell/MobileShell'
import { Avatar, Button, Field, Input } from '../../components/ui'
import { Modal, NotAvailable } from '../../components/overlays'

function initials(name: string): string {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('')
}

function InviteDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useDemo()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Пригласить сотрудника"
      width={480}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Отмена</Button>
          <Button
            onClick={() => {
              if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
                setError('Укажите рабочую почту на домене компании')
                return
              }
              toast(`Приглашение отправлено на ${email}`)
              onClose()
              setEmail('')
            }}
          >
            Отправить приглашение
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {error && <p className="rounded-lg border border-danger/30 bg-[#fbe4e4] px-3.5 py-2.5 text-[13px] text-[#a12f2f]">{error}</p>}
        <Field label="Рабочий email" required error={error && !email ? error : undefined} hint="Домен должен совпадать с доменами компании">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@sibirproject.ru" autoFocus />
        </Field>
        <p className="rounded-lg bg-surface-2 px-3.5 py-2.5 text-xs leading-relaxed text-muted">
          Сотрудник получит доступ к базе знаний вашей компании и сможет создавать запросы в поддержку (этап 2).
        </p>
      </div>
    </Modal>
  )
}

function BlockDialog({ user, onClose }: { user: PortalUser | null; onClose: () => void }) {
  const { toast } = useDemo()
  if (!user) return null
  const blocked = user.status === 'Заблокирован'
  return (
    <Modal
      open
      onClose={onClose}
      title={blocked ? 'Разблокировать сотрудника?' : 'Заблокировать сотрудника?'}
      width={480}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Отмена</Button>
          <Button
            variant={blocked ? 'primary' : 'danger'}
            onClick={() => {
              toast(blocked ? `${user.name} разблокирован — доступ восстановлен` : `${user.name} заблокирован`, blocked ? 'success' : 'info')
              onClose()
            }}
          >
            {blocked ? 'Разблокировать' : 'Заблокировать'}
          </Button>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-muted">
        {blocked ? (
          <>Сотрудник снова получит доступ к базе знаний и своим материалам. История блокировок сохранится в профиле.</>
        ) : (
          <>
            <b className="text-text">{user.name}</b> не сможет войти на портал, пока доступ не будет восстановлен. Все действия сотрудника сохранены в истории
            и останутся в журнале.
          </>
        )}
      </p>
    </Modal>
  )
}

function UsersScreen({ mobile = false }: { mobile?: boolean }) {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const { role } = useDemo()
  const [menuFor, setMenuFor] = useState<string | null>(null)
  const [blockFor, setBlockFor] = useState<PortalUser | null>(null)
  const inviteOpen = params.get('invite') === '1'

  if (role !== 'client-admin') {
    return mobile ? (
      <MobilePage title="Пользователи компании" onBack={() => navigate('/m/dashboard')}>
        <NotAvailable onBack={() => navigate('/m/dashboard')} backLabel="На главную" />
      </MobilePage>
    ) : (
      <div className="flex min-h-full flex-col">
        <Topbar />
        <NotAvailable onBack={() => navigate('/dashboard')} backLabel="На главную" />
      </div>
    )
  }

  return (
    <>
      {!mobile && <Topbar />}
      <main className={mobile ? 'flex flex-1 flex-col px-4 pt-4 pb-10' : 'mx-auto w-full max-w-[1320px] flex-1 px-8 pt-6 pb-10'}>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className={mobile ? 'text-[24px] font-extrabold' : 'text-[28px] font-extrabold'}>Пользователи компании</h1>
            <p className="mt-1 text-sm text-muted">ООО «СибирьПроект» · приглашайте сотрудников и управляйте их доступом</p>
          </div>
          <Button onClick={() => setParams({ invite: '1' })} icon={<UserPlus size={15} />}>Пригласить сотрудника</Button>
        </div>

        {mobile ? (
          <div className="flex flex-col gap-2.5">
            {COMPANY_USERS_SIBIR.map((u) => (
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
                <div className="mt-2.5 flex items-center gap-2 text-xs">
                  <span className="text-muted">{u.companyRole === 'admin' ? 'Администратор компании' : 'Сотрудник'}</span>
                  <span className={u.status === 'Заблокирован' ? 'ml-auto font-medium text-danger' : 'ml-auto font-medium text-success'}>{u.status}</span>
                </div>
                {menuFor === u.id && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setMenuFor(null)} />
                    <div className="absolute right-4 top-14 z-30 w-[210px] animate-(--animate-scale-in) rounded-xl border border-border bg-surface p-1.5 shadow-(--shadow-pop)">
                      <button onClick={() => { setBlockFor(u); setMenuFor(null) }} className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] hover:bg-surface-2">
                        <Ban size={14} className="text-muted" /> {u.status === 'Заблокирован' ? 'Разблокировать' : 'Заблокировать'}
                      </button>
                      <button onClick={() => setMenuFor(null)} className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] hover:bg-surface-2">
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border/60 bg-surface shadow-(--shadow-card)">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-surface-2/50 text-[11px] tracking-wider text-muted uppercase">
                  <th className="px-5 py-3 font-semibold">Сотрудник</th>
                  <th className="px-3 py-3 font-semibold">Роль в компании</th>
                  <th className="px-3 py-3 font-semibold">Статус</th>
                  <th className="px-3 py-3 font-semibold">Активность</th>
                  <th className="w-12 px-3 py-3" />
                </tr>
              </thead>
              <tbody>
                {COMPANY_USERS_SIBIR.map((u) => (
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
                    <td className="px-3 py-3">{u.companyRole === 'admin' ? 'Администратор компании' : 'Сотрудник'}</td>
                    <td className="px-3 py-3">
                      <span className={u.status === 'Заблокирован' ? 'font-medium text-danger' : u.status === 'Приглашён' ? 'font-medium text-warning' : 'font-medium text-success'}>
                        {u.status}
                      </span>
                      {u.blockedAt && <span className="block text-xs text-muted">с {u.blockedAt}</span>}
                    </td>
                    <td className="px-3 py-3 text-xs text-muted">{u.lastActive}</td>
                    <td className="px-3 py-3">
                      <button onClick={() => setMenuFor(menuFor === u.id ? null : u.id)} aria-label="Действия" className="cursor-pointer rounded-lg border border-border px-2.5 py-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-text">
                        <MoreHorizontal size={15} />
                      </button>
                      {menuFor === u.id && (
                        <>
                          <div className="fixed inset-0 z-20" onClick={() => setMenuFor(null)} />
                          <div className="absolute right-4 top-11 z-30 w-[210px] animate-(--animate-scale-in) rounded-xl border border-border bg-surface p-1.5 shadow-(--shadow-pop)">
                            <button onClick={() => { setBlockFor(u); setMenuFor(null) }} className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] hover:bg-surface-2">
                              <Ban size={14} className="text-muted" /> {u.status === 'Заблокирован' ? 'Разблокировать' : 'Заблокировать'}
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-border/60 px-5 py-3">
              <p className="text-[13px] text-muted">Блокировка сохраняет историю сотрудника. Данные не удаляются.</p>
            </div>
          </div>
        )}
      </main>

      <InviteDialog open={inviteOpen} onClose={() => setParams({})} />
      {blockFor && <BlockDialog user={blockFor} onClose={() => setBlockFor(null)} />}
    </>
  )
}

export function CompanyUsersD() {
  return <UsersScreen />
}

export function CompanyUsersM() {
  return (
    <MobilePage title="Пользователи компании">
      <UsersScreen mobile />
    </MobilePage>
  )
}
