import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, CheckCircle2, Clock3, LogIn } from 'lucide-react'
import type { Role } from '../../data/types'
import { useDemo } from '../../demo/DemoContext'
import { Button, Field, Input } from '../../components/ui'
import { AuthCard, AuthScene, BackHome, DemoHint, ResultCard } from './parts'

type ResultKind = 'existing' | 'new' | 'review'

const KNOWN_DOMAINS: Record<string, { companyId: string; name: string; role: Role }> = {
  'sibirproject.ru': { companyId: 'c-sibir', name: 'ООО «СибирьПроект»', role: 'client-user' },
  'stroymash.ru': { companyId: 'c-stroy', name: 'АО «Строймаш»', role: 'client-user' },
  'energoset.ru': { companyId: 'c-energo', name: 'ПАО «ЭнергоСеть»', role: 'client-user' },
}

const KNOWN_INNS = new Set(['5405012345', '6321019876', '5402233445', '7701234567'])

interface FormState {
  lastName: string
  firstName: string
  middleName: string
  position: string
  department: string
  companyName: string
  inn: string
  email: string
  phone: string
  password: string
  password2: string
}

const EMPTY: FormState = {
  lastName: '',
  firstName: '',
  middleName: '',
  position: '',
  department: '',
  companyName: '',
  inn: '',
  email: '',
  phone: '',
  password: '',
  password2: '',
}

/** Демо-логика привязки: домен известен → существующая компания; новый домен + новый ИНН → новая компания; конфликт → ручная проверка */
function resolveResult(form: FormState): ResultKind {
  const domain = form.email.split('@')[1]?.toLowerCase() ?? ''
  const known = KNOWN_DOMAINS[domain]
  if (known) {
    return KNOWN_INNS.has(form.inn.trim()) || form.inn.trim() === '' ? 'existing' : 'review'
  }
  if (KNOWN_INNS.has(form.inn.trim())) return 'review'
  return 'new'
}

function RegisterForm({ mobile = false }: { mobile?: boolean }) {
  const navigate = useNavigate()
  const [form, setForm] = useState<FormState>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [formError, setFormError] = useState(false)

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const errs: Partial<Record<keyof FormState, string>> = {}
    if (!form.lastName.trim()) errs.lastName = 'Укажите фамилию'
    if (!form.firstName.trim()) errs.firstName = 'Укажите имя'
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) errs.email = 'Укажите рабочий email'
    if (!form.companyName.trim()) errs.companyName = 'Укажите наименование компании'
    if (!form.inn.trim()) errs.inn = 'Укажите ИНН'
    if (form.password.length < 6) errs.password = 'Минимум 6 символов'
    if (form.password2 !== form.password) errs.password2 = 'Пароли не совпадают'
    setErrors(errs)
    setFormError(Object.keys(errs).length > 0)
    if (Object.keys(errs).length > 0) return
    navigate(`${mobile ? '/m' : ''}/register/result/${resolveResult(form)}`)
  }

  const label = 'mb-4 block text-[11px] font-bold tracking-widest text-primary uppercase'

  return (
    <AuthCard wide mobile={mobile}>
      <div className={mobile ? 'text-center' : 'text-center'}>
        <h1 className={mobile ? 'text-[24px] font-extrabold' : 'text-[30px] font-extrabold'}>Регистрация</h1>
        <p className="mt-1.5 text-sm text-muted">Создайте учётную запись для доступа к базе знаний MaxSoft</p>
      </div>
      {formError && (
        <div className="mt-4 rounded-lg border border-danger/30 bg-[#fbe4e4] px-3.5 py-2.5 text-[13px] text-[#a12f2f]">
          Проверьте выделенные поля — в форме есть ошибки.
          <span className="sr-only">APP_FORM_INVALID</span>
        </div>
      )}
      <form onSubmit={submit} className={mobile ? 'mt-5 flex flex-col gap-4' : 'mt-6 flex flex-col gap-4'}>
        <div>
          <p className={label}>Кто вы</p>
          <div className={`grid gap-3 ${mobile ? 'grid-cols-2' : 'grid-cols-3'}`}>
            <Field label="Фамилия" error={errors.lastName}>
              <Input placeholder="Введите фамилию" value={form.lastName} onChange={set('lastName')} invalid={!!errors.lastName} />
            </Field>
            <Field label="Имя" error={errors.firstName}>
              <Input placeholder="Введите имя" value={form.firstName} onChange={set('firstName')} invalid={!!errors.firstName} />
            </Field>
            {!mobile && (
              <Field label="Отчество">
                <Input placeholder="Введите отчество" value={form.middleName} onChange={set('middleName')} />
              </Field>
            )}
          </div>
          <div className={`mt-3 grid gap-3 ${mobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
            <Field label="Должность">
              <Input placeholder="Укажите должность" value={form.position} onChange={set('position')} />
            </Field>
            <Field label="Отдел">
              <Input placeholder="Укажите отдел" value={form.department} onChange={set('department')} />
            </Field>
          </div>
        </div>
        <div>
          <p className={label}>Компания</p>
          <div className={`grid gap-3 ${mobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
            <Field label="Наименование компании" error={errors.companyName}>
              <Input placeholder="Введите наименование компании" value={form.companyName} onChange={set('companyName')} invalid={!!errors.companyName} />
            </Field>
            <Field label="ИНН" error={errors.inn} hint="Если компания уже работает с MaxSoft, укажите её ИНН">
              <Input placeholder="Введите ИНН" value={form.inn} onChange={set('inn')} invalid={!!errors.inn} inputMode="numeric" />
            </Field>
          </div>
        </div>
        <div>
          <p className={label}>Контакты</p>
          <div className={`grid gap-3 ${mobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
            <Field label="Рабочий email" error={errors.email} hint={mobile ? undefined : 'Используйте рабочую почту на домене компании — мы автоматически привяжем вас к ней'}>
              <Input type="email" placeholder="name@company.ru" value={form.email} onChange={set('email')} invalid={!!errors.email} />
            </Field>
            <Field label="Телефон">
              <Input placeholder="+7 900 000-00-00" value={form.phone} onChange={set('phone')} inputMode="tel" />
            </Field>
          </div>
          <div className={`mt-3 grid gap-3 ${mobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
            <Field label="Пароль" error={errors.password}>
              <Input type="password" placeholder="••••••••" value={form.password} onChange={set('password')} invalid={!!errors.password} />
            </Field>
            <Field label="Подтверждение пароля" error={errors.password2}>
              <Input type="password" placeholder="••••••••" value={form.password2} onChange={set('password2')} invalid={!!errors.password2} />
            </Field>
          </div>
        </div>
        <Button type="submit" size="lg" className="mt-2 w-full">
          Зарегистрироваться
        </Button>
      </form>
      <p className="mt-5 text-center text-sm">
        <button onClick={() => navigate(`${mobile ? '/m' : ''}/login`)} className="cursor-pointer font-medium text-link hover:underline">
          Уже есть учётная запись? Войти
        </button>
      </p>
      <DemoHint>
        Демо-сценарии: email на <b>@sibirproject.ru</b> и пустой/совпадающий ИНН — привязка к существующей компании; любой новый домен и новый ИНН —
        создание новой компании; известный домен с чужим ИНН (например 7701234567) — ручная проверка. Кнопка «Зарегистрироваться» с пустыми полями
        покажет ошибки формы.
      </DemoHint>
    </AuthCard>
  )
}

export function RegisterD() {
  return (
    <AuthScene>
      <RegisterForm />
    </AuthScene>
  )
}

export function RegisterM() {
  return (
    <AuthScene mobile>
      <RegisterForm mobile />
    </AuthScene>
  )
}

export function RegisterResultD({ kind }: { kind: ResultKind }) {
  const navigate = useNavigate()
  const { login } = useDemo()
  const goDashboard = (role: Role) => {
    login(role)
    navigate('/dashboard')
  }
  return (
    <AuthScene>
      <div className="flex w-full max-w-[560px] flex-col items-center gap-5">
        {kind === 'existing' && (
          <ResultCard
            tone="blue"
            icon={<CheckCircle2 size={19} />}
            title="Вы привязаны к существующей компании"
            text="Мы нашли компанию по домену вашего рабочего email и автоматически привязали к ней учётную запись. Доступ к базе знаний уже открыт."
            meta="Только что"
            action={
              <Button size="lg" className="w-full" onClick={() => goDashboard('client-user')}>
                Продолжить
              </Button>
            }
          />
        )}
        {kind === 'new' && (
          <ResultCard
            tone="blue"
            icon={<Building2 size={19} />}
            title="Компания создана"
            text="Мы не нашли компанию с таким доменом и ИНН, поэтому создали новую с типом «Базовый клиент». Вы стали её администратором и можете приглашать сотрудников."
            meta="Только что"
            action={
              <Button size="lg" className="w-full" onClick={() => goDashboard('client-admin')}>
                Продолжить
              </Button>
            }
          />
        )}
        {kind === 'review' && (
          <ResultCard
            tone="green"
            icon={<Clock3 size={19} />}
            title="Регистрация отправлена на ручную проверку"
            text="Домен или ИНН уже связаны с другой компанией. Мы проверим данные и сообщим результат на рабочий email."
            meta="Только что"
          />
        )}
        {kind === 'review' ? (
          <Button size="lg" onClick={() => navigate('/login')}>
            Вернуться ко входу
          </Button>
        ) : (
          <BackHome />
        )}
      </div>
    </AuthScene>
  )
}

export function RegisterResultM({ kind }: { kind: ResultKind }) {
  const navigate = useNavigate()
  const { login } = useDemo()
  const goDashboard = (role: Role) => {
    login(role)
    navigate('/m/dashboard')
  }
  return (
    <AuthScene mobile>
      <div className="flex w-full flex-col items-center gap-5">
        {kind === 'existing' && (
          <ResultCard
            tone="blue"
            icon={<LogIn size={19} />}
            title="Вы привязаны к существующей компании"
            text="Мы нашли компанию по домену вашего рабочего email и автоматически привязали к ней учётную запись."
            meta="Только что"
            action={
              <Button size="lg" className="w-full" onClick={() => goDashboard('client-user')}>
                Продолжить
              </Button>
            }
          />
        )}
        {kind === 'new' && (
          <ResultCard
            tone="blue"
            icon={<Building2 size={19} />}
            title="Компания создана"
            text="Мы создали компанию с типом «Базовый клиент». Вы стали её администратором и можете приглашать сотрудников."
            meta="Только что"
            action={
              <Button size="lg" className="w-full" onClick={() => goDashboard('client-admin')}>
                Продолжить
              </Button>
            }
          />
        )}
        {kind === 'review' && (
          <ResultCard
            tone="green"
            icon={<Clock3 size={19} />}
            title="Регистрация отправлена на ручную проверку"
            text="Домен или ИНН уже связаны с другой компанией. Мы проверим данные и сообщим результат на рабочий email."
            meta="Только что"
          />
        )}
        {kind === 'review' ? (
          <Button size="lg" className="w-full" onClick={() => navigate('/m/login')}>
            Вернуться ко входу
          </Button>
        ) : (
          <BackHome mobile />
        )}
      </div>
    </AuthScene>
  )
}
