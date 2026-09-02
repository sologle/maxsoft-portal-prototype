import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Mail } from 'lucide-react'
import { Button, Field, Input } from '../../components/ui'
import { AuthCard, AuthScene, DemoHint } from './parts'

function StepEmail({ mobile = false }: { mobile?: boolean }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState(false)
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError(true)
      return
    }
    navigate(`${mobile ? '/m' : ''}/recovery/sent`)
  }
  return (
    <AuthCard mobile={mobile}>
      <h1 className={mobile ? 'text-[22px] font-extrabold' : 'text-[28px] font-extrabold'}>Восстановление доступа</h1>
      <p className="mt-2 text-sm text-muted">Укажите рабочий email — отправим ссылку для создания нового пароля.</p>
      <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
        <Field label="Email" error={error ? 'Укажите корректный email' : undefined}>
          <Input type="email" placeholder="name@company.ru" value={email} onChange={(e) => setEmail(e.target.value)} invalid={error} />
        </Field>
        <Button type="submit" size="lg" className="w-full">
          Отправить письмо
        </Button>
      </form>
      <button onClick={() => navigate(`${mobile ? '/m' : ''}/login`)} className="mt-5 cursor-pointer text-sm font-medium text-link hover:underline">
        Вернуться ко входу
      </button>
    </AuthCard>
  )
}

function StepSent({ mobile = false }: { mobile?: boolean }) {
  const navigate = useNavigate()
  return (
    <AuthCard mobile={mobile}>
      <div className="rounded-xl border border-[#9fd4b8] px-4 py-4">
        <p className="flex items-start gap-2.5 text-[15px] leading-snug font-bold">
          <Mail size={19} className="mt-0.5 shrink-0 text-success" />
          Если такой email зарегистрирован, письмо со ссылкой отправлено
        </p>
      </div>
      <p className="mt-4 text-sm text-muted">Письмо придёт в течение пары минут. Ссылка действует 24 часа.</p>
      <button onClick={() => navigate(`${mobile ? '/m' : ''}/login`)} className="mt-5 cursor-pointer text-sm font-medium text-link hover:underline">
        Вернуться ко входу
      </button>
      <DemoHint>
        В демо письмо не отправляется: <button onClick={() => navigate(`${mobile ? '/m' : ''}/recovery/new`)} className="cursor-pointer font-semibold text-primary underline">открыть ссылку из письма</button>
      </DemoHint>
    </AuthCard>
  )
}

function StepNewPassword({ mobile = false }: { mobile?: boolean }) {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [errors, setErrors] = useState<{ p?: string; p2?: string }>({})
  const submit = (e: FormEvent) => {
    e.preventDefault()
    const errs: { p?: string; p2?: string } = {}
    if (password.length < 6) errs.p = 'Минимум 6 символов'
    if (password2 !== password) errs.p2 = 'Пароли не совпадают'
    setErrors(errs)
    if (Object.keys(errs).length === 0) navigate(`${mobile ? '/m' : ''}/recovery/success`)
  }
  return (
    <AuthCard mobile={mobile}>
      <h1 className={mobile ? 'text-[22px] font-extrabold' : 'text-[28px] font-extrabold'}>Новый пароль</h1>
      <p className="mt-2 text-sm text-muted">Придумайте новый пароль. Старый перестанет действовать.</p>
      <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
        <Field label="Новый пароль" error={errors.p}>
          <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} invalid={!!errors.p} />
        </Field>
        <Field label="Подтверждение пароля" error={errors.p2}>
          <Input type="password" placeholder="••••••••" value={password2} onChange={(e) => setPassword2(e.target.value)} invalid={!!errors.p2} />
        </Field>
        <Button type="submit" size="lg" className="w-full">
          Сохранить пароль
        </Button>
      </form>
    </AuthCard>
  )
}

function StepSuccess({ mobile = false }: { mobile?: boolean }) {
  const navigate = useNavigate()
  return (
    <AuthScene mobile={mobile}>
      <div className={`flex w-full flex-col items-center gap-5 ${mobile ? '' : 'max-w-[420px]'}`}>
        <div className="w-full animate-(--animate-fade-up) rounded-xl border border-[#9fd4b8] bg-surface p-5 shadow-(--shadow-card)">
          <div className="flex items-start gap-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e2f3ea] text-success">
              <CheckCircle2 size={19} />
            </span>
            <div>
              <p className="text-[15px] font-bold leading-snug">Пароль изменён</p>
              <p className="mt-1 text-[13px] leading-relaxed text-muted">Теперь войдите с новым паролем.</p>
            </div>
          </div>
        </div>
        <Button size="lg" className="w-full max-w-[260px]" onClick={() => navigate(`${mobile ? '/m' : ''}/login`)}>
          Перейти ко входу
        </Button>
      </div>
    </AuthScene>
  )
}

export function RecoveryD({ step }: { step: 'email' | 'sent' | 'new' | 'success' }) {
  if (step === 'email') return <AuthScene><StepEmail /></AuthScene>
  if (step === 'sent') return <AuthScene><StepSent /></AuthScene>
  if (step === 'new') return <AuthScene><StepNewPassword /></AuthScene>
  return <StepSuccess />
}

export function RecoveryM({ step }: { step: 'email' | 'sent' | 'new' | 'success' }) {
  if (step === 'email') return <AuthScene mobile><StepEmail mobile /></AuthScene>
  if (step === 'sent') return <AuthScene mobile><StepSent mobile /></AuthScene>
  if (step === 'new') return <AuthScene mobile><StepNewPassword mobile /></AuthScene>
  return <StepSuccess mobile />
}
