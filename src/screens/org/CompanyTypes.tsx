import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Pencil, Plus, Trash2 } from 'lucide-react'
import { COMPANY_TYPES } from '../../data/mock'
import type { CompanyType } from '../../data/types'
import { useDemo } from '../../demo/DemoContext'
import { Topbar } from '../../components/shell/Topbar'
import { MobilePage } from '../../components/shell/MobileShell'
import { Button, Field, Input, Textarea } from '../../components/ui'
import { Modal } from '../../components/overlays'

type Dialog = { kind: 'create' } | { kind: 'edit'; type: CompanyType } | { kind: 'delete'; type: CompanyType } | null

function TypesScreen({ mobile = false }: { mobile?: boolean }) {
  const navigate = useNavigate()
  const { toast } = useDemo()
  const [dialog, setDialog] = useState<Dialog>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  const open = (d: Dialog) => {
    setDialog(d)
    setError('')
    if (d?.kind === 'edit') {
      setName(d.type.name)
      setDescription(d.type.description)
    } else {
      setName('')
      setDescription('')
    }
  }

  const submit = () => {
    if (dialog?.kind === 'create' || dialog?.kind === 'edit') {
      if (!name.trim()) {
        setError('Введите название типа')
        return
      }
      if (COMPANY_TYPES.some((t) => t.name.toLowerCase() === name.trim().toLowerCase() && (dialog.kind === 'create' || dialog.type.id !== t.id))) {
        setError('Тип с таким названием уже существует')
        return
      }
      toast(dialog.kind === 'create' ? `Тип «${name.trim()}» создан` : 'Тип сохранён')
    }
    setDialog(null)
  }

  return (
    <>
      <Topbar />
      <main className={mobile ? 'flex flex-1 flex-col px-4 pt-4 pb-10' : 'mx-auto w-full max-w-[1320px] flex-1 px-8 pt-6 pb-10'}>
        <nav className="mb-2 flex items-center gap-2 text-[13px] text-muted">
          <span>Администрирование</span>
          <span>›</span>
          <button onClick={() => navigate('/companies')} className="cursor-pointer hover:text-text">Компании</button>
          <span>›</span>
          <span className="font-medium text-text">Типы компаний</span>
        </nav>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className={mobile ? 'text-[24px] font-extrabold' : 'text-[28px] font-extrabold'}>Типы компаний</h1>
            <p className="mt-1 text-sm text-muted">Тип определяет набор разделов базы знаний, доступных сотрудникам компании. Клиент свой тип не видит.</p>
          </div>
          <Button onClick={() => open({ kind: 'create' })} icon={<Plus size={15} />}>Новый тип</Button>
        </div>

        <div className={`grid gap-4 ${mobile ? 'grid-cols-1' : 'grid-cols-3 items-start'}`}>
          {COMPANY_TYPES.map((t) => {
            return (
              <div key={t.id} className="rounded-xl border border-border/60 bg-surface p-5 shadow-(--shadow-card)">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
                      <Building2 size={19} />
                    </span>
                    <div>
                      <p className="text-[16px] font-bold">{t.name}</p>
                      <p className="text-xs text-muted">{t.companiesCount} компаний · {t.articlesCount} статей</p>
                    </div>
                  </div>
                  <button
                    onClick={() => open({ kind: 'edit', type: t })}
                    aria-label="Редактировать тип"
                    className="cursor-pointer rounded-lg p-2 text-muted transition-colors hover:bg-surface-2 hover:text-text"
                  >
                    <Pencil size={15} />
                  </button>
                </div>
                <p className="mt-3 text-[13px] leading-relaxed text-muted">{t.description}</p>
                <div className="mt-4 flex gap-2 border-t border-border/60 pt-4">
                  <Button variant="secondary" size="sm" className="flex-1" onClick={() => navigate('/companies')}>
                    Компании ({t.companiesCount})
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-danger hover:bg-[#fbe4e4]"
                    icon={<Trash2 size={14} />}
                    onClick={() => open({ kind: 'delete', type: t })}
                  >
                    Удалить
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </main>

      <Modal
        open={dialog?.kind === 'create' || dialog?.kind === 'edit'}
        onClose={() => setDialog(null)}
        title={dialog?.kind === 'create' ? 'Новый тип компании' : 'Редактирование типа'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDialog(null)}>Отмена</Button>
            <Button onClick={submit}>{dialog?.kind === 'create' ? 'Создать' : 'Сохранить'}</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {error && <p className="rounded-lg border border-danger/30 bg-[#fbe4e4] px-3.5 py-2.5 text-[13px] text-[#a12f2f]">{error}</p>}
          <Field label="Название типа" required error={error && !name.trim() ? error : undefined}>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Например: ВИП-клиент" autoFocus />
          </Field>
          <Field label="Описание" hint="Что получает компания этого типа: разделы базы знаний и права">
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Доступные разделы и права сотрудников..." />
          </Field>
        </div>
      </Modal>

      <Modal
        open={dialog?.kind === 'delete'}
        onClose={() => setDialog(null)}
        title="Удаление недоступно"
        width={520}
        footer={<Button onClick={() => setDialog(null)}>Понятно</Button>}
      >
        <p className="text-sm leading-relaxed text-muted">
          Тип «{dialog?.kind === 'delete' ? dialog.type.name : ''}» используется в{' '}
          <b className="text-text">{dialog?.kind === 'delete' ? dialog.type.companiesCount : 0} компаниях</b> и назначен в правах{' '}
          <b className="text-text">{dialog?.kind === 'delete' ? dialog.type.articlesCount : 0} статей</b>.
        </p>
        <p className="mt-2.5 text-sm leading-relaxed text-muted">
          Сначала переназначьте тип компаний и права статей, затем удалите тип.
          <span className="mt-1 block font-(--font-caption) text-xs text-[#9aa4b0]">APP_COMPANY_TYPE_IN_USE</span>
        </p>
      </Modal>
    </>
  )
}

export function CompanyTypesD() {
  return <TypesScreen />
}

export function CompanyTypesM() {
  return (
    <MobilePage title="Типы компаний" onBack={() => (window.location.hash = '#/m/companies')}>
      <TypesScreen mobile />
    </MobilePage>
  )
}
