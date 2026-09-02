import { useState } from 'react'
import { MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import { TAGS, TAG_GROUPS } from '../../data/mock'
import type { Tag, TagGroup } from '../../data/types'
import { useDemo } from '../../demo/DemoContext'
import { Topbar } from '../../components/shell/Topbar'
import { MobilePage } from '../../components/shell/MobileShell'
import { Button, Field, Input, Select } from '../../components/ui'
import { Modal } from '../../components/overlays'

type TagDialog = { kind: 'create'; groupId: string } | { kind: 'edit'; tag: Tag } | { kind: 'delete'; tag: Tag } | { kind: 'group' } | null
type MenuState = { tag: Tag; x: number; y: number } | null

export function KbTagsD() {
  return <TagsScreen />
}

export function KbTagsM() {
  return (
    <MobilePage title="Теги статей" onBack={() => window.location.hash = '#/m/kb'}>
      <TagsScreen mobile />
    </MobilePage>
  )
}

function TagsScreen({ mobile = false }: { mobile?: boolean }) {
  const { toast } = useDemo()
  const [dialog, setDialog] = useState<TagDialog>(null)
  const [menu, setMenu] = useState<MenuState>(null)
  const [name, setName] = useState('')
  const [groupId, setGroupId] = useState(TAG_GROUPS[0].id)
  const [error, setError] = useState('')

  const openCreate = (gid: string) => {
    setName('')
    setGroupId(gid)
    setError('')
    setDialog({ kind: 'create', groupId: gid })
  }
  const openEdit = (t: Tag) => {
    setName(t.name)
    setGroupId(t.groupId)
    setError('')
    setDialog({ kind: 'edit', tag: t })
    setMenu(null)
  }
  const openDelete = (t: Tag) => {
    setDialog({ kind: 'delete', tag: t })
    setMenu(null)
  }

  const submit = () => {
    if (!dialog) return
    if (dialog.kind === 'create' || dialog.kind === 'edit') {
      if (!name.trim()) {
        setError('Введите название тега')
        return
      }
      if (TAGS.some((t) => t.name.toLowerCase() === name.trim().toLowerCase() && (dialog.kind === 'create' || dialog.kind === 'edit' && t.id !== dialog.tag.id))) {
        setError('Тег с таким названием уже существует')
        return
      }
      toast(dialog.kind === 'create' ? `Тег «${name.trim()}» создан` : 'Тег обновлён')
    }
    if (dialog.kind === 'delete') toast(`Тег «${dialog.tag.name}» удалён`, 'info')
    if (dialog.kind === 'group') toast('Группа создана')
    setDialog(null)
  }

  const tagMenu = menu && (
    <>
      <div className="fixed inset-0 z-30" onClick={() => setMenu(null)} />
      <div style={{ left: Math.min(menu.x, window.innerWidth - 200), top: menu.y + 6 }} className="fixed z-40 w-[170px] animate-(--animate-scale-in) rounded-xl border border-border bg-surface p-1.5 shadow-(--shadow-pop)">
        <button onClick={() => openEdit(menu.tag)} className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] hover:bg-surface-2">
          <Pencil size={14} className="text-muted" /> Редактировать
        </button>
        <button onClick={() => openDelete(menu.tag)} className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] text-danger hover:bg-[#fbe4e4]">
          <Trash2 size={14} /> Удалить
        </button>
      </div>
    </>
  )

  return (
    <>
      <Topbar />
      <main className={mobile ? 'flex flex-1 flex-col px-4 pt-4 pb-10' : 'mx-auto w-full max-w-[1320px] flex-1 px-8 pt-6 pb-10'}>
        <nav className="mb-2 flex items-center gap-2 text-[13px] text-muted">
          <span>Администрирование</span>
          <span>›</span>
          <button onClick={() => (window.location.hash = '#/kb')} className="cursor-pointer hover:text-text">База знаний</button>
          <span>›</span>
          <span className="font-medium text-text">Теги</span>
        </nav>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className={mobile ? 'text-[24px] font-extrabold' : 'text-[28px] font-extrabold'}>Теги статей</h1>
            <p className="mt-1 text-sm text-muted">Управляйте справочником тегов и группировкой материалов.</p>
          </div>
          <Button onClick={() => openCreate(TAG_GROUPS[0].id)} icon={<Plus size={15} />}>Новый тег</Button>
        </div>
        <div className={`grid gap-4 ${mobile ? 'grid-cols-1' : 'grid-cols-3 items-start'}`}>
          {TAG_GROUPS.map((g: TagGroup) => (
            <div key={g.id} className="rounded-xl border border-border/60 bg-surface p-5 shadow-(--shadow-card)">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-[17px] font-bold">{g.name}</h2>
                <button onClick={() => openCreate(g.id)} className="cursor-pointer text-[13px] font-medium text-primary hover:underline">
                  + Добавить
                </button>
              </div>
              <div>
                {TAGS.filter((t) => t.groupId === g.id).map((t) => (
                  <div key={t.id} className="group flex items-center justify-between gap-3 border-b border-border/50 py-2.5 last:border-b-0 hover:bg-secondary/40">
                    <span className="inline-flex items-center gap-1 rounded-md border border-primary/20 bg-secondary px-2.5 py-1 text-[13px] font-medium text-primary-strong">
                      {t.name}
                      <button
                        aria-label="Действия с тегом"
                        onClick={(e) => {
                          const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
                          setMenu({ tag: t, x: r.left, y: r.bottom })
                        }}
                        className="cursor-pointer text-primary/70 hover:text-primary"
                      >
                        <MoreHorizontal size={13} />
                      </button>
                    </span>
                    <span className="text-[13px] text-muted">{t.articlesCount} статей</span>
                  </div>
                ))}
                {TAGS.filter((t) => t.groupId === g.id).length === 0 && <p className="py-3 text-[13px] text-muted">В группе пока нет тегов</p>}
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => setDialog({ kind: 'group' })} className="mt-4 self-start cursor-pointer text-[13px] font-medium text-primary hover:underline">
          + Новая группа тегов
        </button>
      </main>

      {tagMenu}

      <Modal
        open={dialog?.kind === 'create' || dialog?.kind === 'edit'}
        onClose={() => setDialog(null)}
        title={dialog?.kind === 'create' ? 'Новый тег' : 'Редактирование тега'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDialog(null)}>Отмена</Button>
            <Button onClick={submit}>Сохранить</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {error && <p className="rounded-lg border border-danger/30 bg-[#fbe4e4] px-3.5 py-2.5 text-[13px] text-[#a12f2f]">{error}</p>}
          <Field label="Название тега" error={error && !name.trim() ? error : undefined}>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Например: Обновление" autoFocus />
          </Field>
          <Field label="Группа">
            <Select value={groupId} onChange={(e) => setGroupId(e.target.value)}>
              {TAG_GROUPS.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </Select>
          </Field>
        </div>
      </Modal>

      <Modal
        open={dialog?.kind === 'delete'}
        onClose={() => setDialog(null)}
        title="Удалить тег?"
        width={480}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDialog(null)}>Отмена</Button>
            <Button
              variant="danger"
              onClick={() => {
                if (dialog?.kind === 'delete') toast(`Тег «${dialog.tag.name}» удалён`, 'info')
                setDialog(null)
              }}
            >
              Удалить
            </Button>
          </>
        }
      >
        <p className="text-sm leading-relaxed text-muted">
          Тег «{dialog?.kind === 'delete' ? dialog.tag.name : ''}» используется в{' '}
          <b className="text-text">{dialog?.kind === 'delete' ? dialog.tag.articlesCount : 0} статьях</b>. Тег будет снят со статей, статьи не удаляются.
        </p>
      </Modal>

      <Modal
        open={dialog?.kind === 'group'}
        onClose={() => setDialog(null)}
        title="Новая группа тегов"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDialog(null)}>Отмена</Button>
            <Button onClick={submit}>Создать</Button>
          </>
        }
      >
        <Field label="Название группы">
          <Input placeholder="Например: Регламент" autoFocus />
        </Field>
      </Modal>
    </>
  )
}
