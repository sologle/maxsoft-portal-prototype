import { useMemo, useState } from 'react'
import { ChevronDown, FileText, Folder, FolderOpen, Search } from 'lucide-react'
import { ARTICLES, KB_NODES, TAGS } from '../../data/mock'
import type { Article } from '../../data/types'
import { isStaff, useDemo } from '../../demo/DemoContext'
import { useFormatNav } from '../../components/nav'

const TAG_NAME = Object.fromEntries(TAGS.map((t) => [t.id, t.name]))

export function articlesOfNode(nodeId: string): Article[] {
  return ARTICLES.filter((a) => a.nodeId === nodeId)
}

export function nodePath(nodeId: string): KbNodePathItem[] {
  const path: KbNodePathItem[] = []
  let cur: (typeof KB_NODES)[number] | undefined = KB_NODES.find((n) => n.id === nodeId)
  while (cur) {
    path.unshift({ id: cur.id, name: cur.name })
    const parentId: string | null = cur.parentId
    cur = parentId ? KB_NODES.find((n) => n.id === parentId) : undefined
  }
  return path
}

export interface KbNodePathItem {
  id: string
  name: string
}

function TreeRow({
  node,
  depth,
  selectedId,
  onSelect,
  expanded,
  toggle,
}: {
  node: (typeof KB_NODES)[number]
  depth: number
  selectedId: string | null
  onSelect: (id: string) => void
  expanded: Set<string>
  toggle: (id: string) => void
}) {
  const children = KB_NODES.filter((n) => n.parentId === node.id)
  const isOpen = expanded.has(node.id)
  const selected = selectedId === node.id
  return (
    <div>
      <button
        onClick={() => onSelect(node.id)}
        className={`group flex w-full cursor-pointer items-center gap-1.5 rounded-lg py-1.5 pr-2 text-left text-[13px] transition-colors ${
          selected ? 'bg-secondary font-semibold text-primary-strong' : 'text-text hover:bg-surface-2'
        }`}
        style={{ paddingLeft: 8 + depth * 16 }}
      >
        <span
          onClick={(e) => {
            e.stopPropagation()
            toggle(node.id)
          }}
          className="flex h-5 w-5 shrink-0 items-center justify-center text-muted hover:text-text"
        >
          {children.length > 0 ? <ChevronDown size={14} className={`transition-transform ${isOpen ? '' : '-rotate-90'}`} /> : null}
        </span>
        {isOpen && children.length > 0 ? <FolderOpen size={15} className="shrink-0 text-muted" /> : <Folder size={15} className="shrink-0 text-muted" />}
        <span className="truncate">{node.name}</span>
      </button>
      {isOpen &&
        children.map((c) => (
          <TreeRow key={c.id} node={c} depth={depth + 1} selectedId={selectedId} onSelect={onSelect} expanded={expanded} toggle={toggle} />
        ))}
    </div>
  )
}

export function KbSidebar({ selectedId, onSelect, mobile = false }: { selectedId: string | null; onSelect: (id: string) => void; mobile?: boolean }) {
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(['n-products', 'n-navisa']))
  const { role } = useDemo()

  const roots = KB_NODES.filter((n) => n.parentId === null)
  const filtered = useMemo(() => {
    if (!query.trim()) return null
    const q = query.toLowerCase()
    return KB_NODES.filter((n) => n.name.toLowerCase().includes(q))
  }, [query])

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <aside className={`flex flex-col gap-2.5 rounded-xl border border-border/60 bg-surface p-3.5 shadow-(--shadow-card) ${mobile ? '' : 'h-fit'}`}>
      {!mobile && <p className="px-1 pt-1 text-[11px] font-bold tracking-widest text-muted uppercase">Разделы</p>}
      <div className="relative">
        <Search size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Найти раздел"
          className="h-9 w-full rounded-lg border border-border bg-surface pr-3 pl-8.5 text-[13px] transition-colors focus:border-primary focus:outline-none"
        />
      </div>
      <div className="max-h-[420px] overflow-auto pr-0.5">
        {filtered ? (
          filtered.length === 0 ? (
            <p className="px-2 py-3 text-[13px] text-muted">Раздел не найден</p>
          ) : (
            filtered.map((n) => (
              <button
                key={n.id}
                onClick={() => onSelect(n.id)}
                className={`flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] transition-colors ${
                  selectedId === n.id ? 'bg-secondary font-semibold text-primary-strong' : 'hover:bg-surface-2'
                }`}
              >
                <Folder size={15} className="shrink-0 text-muted" />
                {n.name}
              </button>
            ))
          )
        ) : (
          roots.map((n) => <TreeRow key={n.id} node={n} depth={0} selectedId={selectedId} onSelect={onSelect} expanded={expanded} toggle={toggle} />)
        )}
      </div>
      {isStaff(role) && !mobile && <p className="border-t border-border/60 px-1 pt-2.5 pb-1 text-[11px] text-muted">Черновики видны только сотрудникам MaxSoft</p>}
    </aside>
  )
}

/** Список статей узла (KB-01): карточка с заголовком, сортировкой, строками статей и пагинацией */
export function ArticleListCard({ nodeId }: { nodeId: string }) {
  const navigate = useFormatNav()
  const { role } = useDemo()
  const node = KB_NODES.find((n) => n.id === nodeId)
  const path = nodePath(nodeId)
  const articles = articlesOfNode(nodeId).filter((a) => isStaff(role) || a.status === 'published')

  return (
    <div className="flex min-w-0 flex-1 flex-col rounded-xl border border-border/60 bg-surface shadow-(--shadow-card)">
      <div className="flex items-start justify-between gap-4 border-b border-border/60 px-5 py-4">
        <div>
          <h2 className="text-[17px] font-bold">{node?.name ?? 'Раздел'}</h2>
          <p className="mt-0.5 text-[13px] text-muted">{path.map((p) => p.name).join(' · ')}</p>
        </div>
        <select className="h-9 cursor-pointer rounded-lg border border-border bg-surface px-3 text-[13px] focus:outline-none">
          <option>По названию</option>
          <option>По дате обновления</option>
        </select>
      </div>
      {articles.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-14 text-center">
          <FileText size={28} className="mb-3 text-muted" />
          <p className="text-sm font-semibold">В этом разделе пока нет статей</p>
          <p className="mt-1 text-[13px] text-muted">Выберите другой раздел в дереве слева</p>
        </div>
      ) : (
        <div>
          {articles.map((a) => (
            <button
              key={a.id}
              onClick={() => navigate(`/article/${a.slug}`)}
              className="block w-full cursor-pointer border-b border-border/50 px-5 py-4 text-left transition-colors last:border-b-0 hover:bg-bg/70"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold">{a.title}</p>
                  <p className="mt-0.5 text-[13px] leading-snug text-muted">{a.summary}</p>
                  <p className="mt-2 text-xs text-muted">
                    {a.status === 'draft' ? 'Изменено' : 'Обновлено'} {a.updatedAt} · {a.minutes} мин · {a.author}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  {a.status === 'draft' && (
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-2 px-2 py-0.5 text-xs font-medium text-muted">
                      <FileText size={11} /> Черновик
                    </span>
                  )}
                  <div className="flex flex-wrap justify-end gap-1.5">
                    {a.tagIds.slice(0, 2).map((t) => (
                      <span key={t} className="inline-flex items-center gap-1 rounded-md border border-border/70 bg-surface-2 px-2 py-0.5 text-xs text-muted">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2z" />
                        </svg>
                        {TAG_NAME[t] ?? t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          ))}
          <div className="flex items-center justify-end gap-1.5 px-5 py-3.5">
            <button className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface text-muted transition-colors hover:bg-surface-2">‹</button>
            <button className="h-9 min-w-9 rounded-lg border border-primary bg-primary text-sm font-medium text-white">1</button>
            <span className="px-1 text-sm text-muted">…</span>
            <button className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface text-muted transition-colors hover:bg-surface-2">›</button>
          </div>
        </div>
      )}
    </div>
  )
}

