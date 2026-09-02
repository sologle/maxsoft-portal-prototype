import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, Folder, Pencil, Plus, Trash2 } from 'lucide-react'
import { ARTICLES, KB_NODES } from '../../data/mock'
import type { KbNode } from '../../data/types'
import { useDemo } from '../../demo/DemoContext'
import { Topbar } from '../../components/shell/Topbar'
import { MobilePage } from '../../components/shell/MobileShell'
import { Button, Field, Input, Select } from '../../components/ui'
import { Modal } from '../../components/overlays'

type Dialog = { kind: 'create' } | { kind: 'rename'; node: KbNode } | { kind: 'delete'; node: KbNode } | null

function StructureTree({ selectedId, onSelect, onEdit, onDelete }: {
  selectedId: string
  onSelect: (id: string) => void
  onEdit: (n: KbNode) => void
  onDelete: (n: KbNode) => void
}) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(['n-products', 'n-navisa']))
  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const Row = ({ node, depth }: { node: KbNode; depth: number }) => {
    const children = KB_NODES.filter((n) => n.parentId === node.id)
    const open = expanded.has(node.id)
    const selected = selectedId === node.id
    return (
      <div>
        <div
          onClick={() => onSelect(node.id)}
          className={`group flex cursor-pointer items-center gap-1 rounded-lg py-1.5 pr-1.5 transition-colors ${
            selected ? 'bg-secondary ring-1 ring-primary/40' : 'hover:bg-surface-2'
          }`}
          style={{ paddingLeft: 6 + depth * 18 }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation()
              toggle(node.id)
            }}
            className="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center text-muted hover:text-text"
            aria-label={open ? 'Свернуть' : 'Развернуть'}
          >
            {children.length > 0 && <ChevronDown size={13} className={`transition-transform ${open ? '' : '-rotate-90'}`} />}
          </button>
          <Folder size={15} className="shrink-0 text-muted" />
          <span className={`min-w-0 flex-1 truncate text-left text-[13px] ${selected ? 'font-semibold text-primary-strong' : ''}`}>{node.name}</span>
          <span className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit(node)
              }}
              aria-label="Переименовать"
              className="cursor-pointer rounded-md p-1.5 text-muted hover:bg-surface hover:text-text"
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(node)
              }}
              aria-label="Удалить"
              className="cursor-pointer rounded-md p-1.5 text-muted hover:bg-surface hover:text-danger"
            >
              <Trash2 size={13} />
            </button>
          </span>
        </div>
        {open && children.map((c) => <Row key={c.id} node={c} depth={depth + 1} />)}
      </div>
    )
  }

  return (
    <div>
      {KB_NODES.filter((n) => n.parentId === null).map((n) => (
        <Row key={n.id} node={n} depth={0} />
      ))}
    </div>
  )
}

function StructureScreen({ mobile = false }: { mobile?: boolean }) {
  const navigate = useNavigate()
  const { toast } = useDemo()
  const [selectedId, setSelectedId] = useState('n-navisa-setup')
  const [dialog, setDialog] = useState<Dialog>(null)
  const [name, setName] = useState('')
  const [parentId, setParentId] = useState('')

  const node = KB_NODES.find((n) => n.id === selectedId)
  const childCount = KB_NODES.filter((n) => n.parentId === selectedId).length
  const articleCount = ARTICLES.filter((a) => a.nodeId === selectedId).length
  const canDelete = childCount === 0 && articleCount === 0

  const openCreate = () => {
    setName('')
    setParentId(selectedId)
    setDialog({ kind: 'create' })
  }
  const openRename = (n: KbNode) => {
    setName(n.name)
    setDialog({ kind: 'rename', node: n })
  }
  const openDelete = (n: KbNode) => {
    setDialog({ kind: 'delete', node: n })
  }

  const submit = () => {
    if (!dialog) return
    if (dialog.kind === 'create') toast(`Раздел «${name || 'Новый раздел'}» создан`)
    if (dialog.kind === 'rename') toast('Название раздела обновлено')
    if (dialog.kind === 'delete') toast(`Раздел «${dialog.node.name}» удалён`, 'info')
    setDialog(null)
  }

  const panel = (
    <div className="rounded-xl border border-border/60 bg-surface p-5 shadow-(--shadow-card)">
      <h2 className="text-[17px] font-bold">Параметры узла</h2>
      <div className="mt-4 flex flex-col gap-4">
        <Field label="Название">
          <Input value={node?.name ?? ''} onChange={() => undefined} />
        </Field>
        <Field label="Родительский раздел" hint="При смене раздел переместится вместе с вложенными узлами">
          <Select value={node?.parentId ?? ''} onChange={(e) => toast(`Раздел перемещён в «${KB_NODES.find((n) => n.id === e.target.value)?.name ?? 'корень'}»`)}>
            <option value="">— Корень —</option>
            {KB_NODES.filter((n) => n.parentId === null).map((n) => (
              <option key={n.id} value={n.id}>{n.name}</option>
            ))}
          </Select>
        </Field>
        <div className="border-t border-border/60 pt-4">
          <div className="flex items-center justify-between gap-3">
            <Button variant="danger" disabled={!canDelete} onClick={() => node && openDelete(node)}>
              Удалить
            </Button>
            <Button onClick={() => toast('Параметры узла сохранены')}>Сохранить</Button>
          </div>
          {!canDelete && (
            <p className="mt-2.5 text-xs leading-relaxed text-muted">
              Раздел содержит {articleCount} {plural(articleCount, 'статью', 'статьи', 'статей')} и {childCount}{' '}
              {plural(childCount, 'дочерний раздел', 'дочерних раздела', 'дочерних разделов')}. Сначала переместите материалы или выберите пустой раздел.
            </p>
          )}
        </div>
      </div>
    </div>
  )

  const treePanel = (
    <div className="rounded-xl border border-border/60 bg-surface p-3.5 shadow-(--shadow-card)">
      <div className="mb-2 flex items-start justify-between px-1">
        <div>
          <p className="text-[17px] font-bold">Структура</p>
          <p className="text-xs text-muted">Перетащите разделы, чтобы изменить порядок</p>
        </div>
      </div>
      <StructureTree selectedId={selectedId} onSelect={setSelectedId} onEdit={openRename} onDelete={openDelete} />
      <button
        onClick={openCreate}
        className="mt-3 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-border py-2.5 text-[13px] font-medium transition-colors hover:border-primary/50 hover:text-primary"
      >
        <Plus size={15} /> Добавить раздел
      </button>
    </div>
  )

  return (
    <>
      {!mobile && <Topbar />}
      <main className={mobile ? 'flex flex-1 flex-col gap-4 px-4 pt-4 pb-10' : 'mx-auto grid w-full max-w-[1320px] flex-1 grid-cols-[340px_1fr] items-start gap-5 px-8 pt-6 pb-10'}>
        {mobile ? (
          <>
            {treePanel}
            {panel}
          </>
        ) : (
          <>
            {treePanel}
            <div>
              <nav className="mb-2 flex items-center gap-2 text-[13px] text-muted">
                <span>Администрирование</span>
                <span>›</span>
                <button onClick={() => navigate('/kb')} className="cursor-pointer hover:text-text">База знаний</button>
                <span>›</span>
                <span className="font-medium text-text">Структура</span>
              </nav>
              <h1 className="text-[28px] font-extrabold">{node?.name ?? 'Структура'}</h1>
              <p className="mt-1 mb-4 text-sm text-muted">Измените название и родительский раздел.</p>
              {panel}
            </div>
          </>
        )}
      </main>

      <Modal
        open={dialog?.kind === 'create' || dialog?.kind === 'rename'}
        onClose={() => setDialog(null)}
        title={dialog?.kind === 'create' ? 'Новый раздел' : 'Переименование раздела'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDialog(null)}>Отмена</Button>
            <Button onClick={submit}>{dialog?.kind === 'create' ? 'Создать' : 'Сохранить'}</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Название раздела">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Например: Обновления" autoFocus />
          </Field>
          {dialog?.kind === 'create' && (
            <Field label="Родительский раздел">
              <Select value={parentId} onChange={(e) => setParentId(e.target.value)}>
                <option value="">— Корень —</option>
                {KB_NODES.map((n) => (
                  <option key={n.id} value={n.id}>{n.name}</option>
                ))}
              </Select>
            </Field>
          )}
        </div>
      </Modal>

      <Modal
        open={dialog?.kind === 'delete'}
        onClose={() => setDialog(null)}
        title="Удалить раздел?"
        width={480}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDialog(null)}>Отмена</Button>
            <Button
              variant="danger"
              onClick={() => {
                toast(`Раздел «${dialog?.kind === 'delete' ? dialog.node.name : ''}» удалён`, 'info')
                setDialog(null)
              }}
            >
              Удалить
            </Button>
          </>
        }
      >
        <p className="text-sm leading-relaxed text-muted">
          Раздел «{dialog?.kind === 'delete' ? dialog.node.name : ''}» пустой и не содержит вложенных разделов. Удалить его из структуры базы знаний?
        </p>
      </Modal>
    </>
  )
}

function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few
  return many
}

export function KbStructureD() {
  return <StructureScreen />
}

export function KbStructureM() {
  const navigate = useNavigate()
  return (
    <MobilePage title="Структура БЗ" onBack={() => navigate('/m/kb')}>
      <StructureScreen mobile />
    </MobilePage>
  )
}

