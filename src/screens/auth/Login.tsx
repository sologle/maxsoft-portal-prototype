import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, Info } from 'lucide-react'
import type { Role } from '../../data/types'
import { useDemo } from '../../demo/DemoContext'
import { Button, Field, Input } from '../../components/ui'
import { AuthCard, AuthScene, DemoHint } from './parts'

const QUICK_ROLES: { id: Role; label: string }[] = [
  { id: 'admin', label: 'Администратор' },
  { id: 'engineer', label: 'Инженер ТП' },
  { id: 'manager', label: 'Менеджер' },
  { id: 'client-admin', label: 'Админ клиента' },
  { id: 'client-user', label: 'Сотрудник' },
]

function LoginForm({ mobile = false }: { mobile?: boolean }) {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { login, nextUrl, setNextUrl } = useDemo()
  const next = params.get('next') ?? nextUrl
  const closedLink = Boolean(next)
  const [error, setError] = useState(params.get('error') === '1')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError(true)
      return
    }
    // Любые корректно заполненные учётные данные ведут в кабинет выбранной демо-роли
    const role = (params.get('role') as Role) || 'admin'
    login(role, null)
    setNextUrl(null)
    if (next) navigate(next)
    else navigate(`${mobile ? '/m' : ''}/dashboard`)
  }

  const quick = (role: Role) => {
    login(role, null)
    setNextUrl(null)
    if (next) navigate(next)
    else navigate(`${mobile ? '/m' : ''}/dashboard`)
  }

  return (
    <AuthCard mobile={mobile}>
      <h1 className={mobile ? 'text-[24px] font-extrabold' : 'text-[30px] font-extrabold'}>Вход</h1>
      {closedLink && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-primary/25 bg-secondary px-3.5 py-3 text-[13px] text-primary-strong">
          <Info size={16} className="mt-0.5 shrink-0" />
          Ссылка ведёт к материалу, доступному после входа. Войдите — и мы вернём вас к нему.
        </div>
      )}
      {error && !closedLink && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-danger/30 bg-[#fbe4e4] px-3.5 py-3 text-[13px] text-[#a12f2f]">
          <span className="mt-0.5 inline-block h-2 w-2 shrink-0 rounded-full bg-danger" />
          Неверный email или пароль. Проверьте данные и попробуйте ещё раз.
          <span className="sr-only">APP_AUTH_FAILED</span>
        </div>
      )}
      <form onSubmit={submit} className={mobile ? 'mt-5 flex flex-col gap-4' : 'mt-6 flex flex-col gap-4'}>
        <Field label="Email">
          <Input type="email" placeholder="name@company.ru" value={email} onChange={(e) => setEmail(e.target.value)} invalid={error && !email.trim()} />
        </Field>
        <Field label="Пароль">
          <div className="relative">
            <Input
              type={show ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              invalid={error && !password.trim()}
              className="pr-10"
            />
            <button
              type="button"
              aria-label={show ? 'Скрыть пароль' : 'Показать пароль'}
              onClick={() => setShow((v) => !v)}
              className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-muted hover:text-text"
            >
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </Field>
        <Button type="submit" size="lg" className="w-full">
          Войти
        </Button>
      </form>
      <div className="mt-5 flex items-center justify-between text-sm">
        <button onClick={() => navigate(`${mobile ? '/m' : ''}/recovery`)} className="cursor-pointer font-medium text-link hover:underline">
          Забыли пароль?
        </button>
        <button onClick={() => navigate(`${mobile ? '/m' : ''}/register`)} className="cursor-pointer font-medium text-link hover:underline">
          Регистрация
        </button>
      </div>
      <DemoHint>
        Демо-вход без пароля:{' '}
        <span className="flex flex-wrap gap-1.5 pt-1.5">
          {QUICK_ROLES.map((r) => (
            <button
              key={r.id}
              onClick={() => quick(r.id)}
              className="cursor-pointer rounded-md border border-border bg-surface px-2 py-0.5 text-[12px] font-medium text-text transition-colors hover:border-primary/50 hover:text-primary"
            >
              {r.label}
            </button>
          ))}
        </span>
      </DemoHint>
    </AuthCard>
  )
}

export function LoginD() {
  return (
    <AuthScene>
      <LoginForm />
      <p className="mt-5 text-sm text-muted">
        Нет учётной записи?{' '}
        <button onClick={() => window.history.length > 1 && (window.location.hash = '#/register')} className="cursor-pointer text-link hover:underline">
          Зарегистрироваться
        </button>
      </p>
    </AuthScene>
  )
}

export function LoginM() {
  return (
    <AuthScene mobile>
      <LoginForm mobile />
      <p className="mt-5 text-center text-[13px] text-muted">Нет учётной записи? Зарегистрируйтесь</p>
    </AuthScene>
  )
}
