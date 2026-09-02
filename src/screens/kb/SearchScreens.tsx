import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowUpRight, Download, FileText, Search as SearchIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { ARTICLES, FILES, KB_NODES, TAGS } from '../../data/mock'
import type { Role } from '../../data/types'
import { useDemo } from '../../demo/DemoContext'
import { Topbar } from '../../components/shell/Topbar'
import { MobilePage } from '../../components/shell/MobileShell'
import { Button, Chip } from '../../components/ui'
import { Modal } from '../../components/overlays'
import { articleVisibleToRole, nodePath } from './kb-parts'

const TAG_NAME = Object.fromEntries(TAGS.map((t) => [t.id, t.name]))
const POPULAR = ['tag-navisa', 'tag-integration', 'tag-setup', 'tag-backup']

interface Hit {
  kind: 'article' | 'file'
  articleId?: string
  fileId?: string
  title: string
  snippet: ReactNode
  snippetText: string
  meta: string
  tagIds: string[]
  inFile?: boolean
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
}

function highlight(text: string, query: string): ReactNode {
  if (!query.trim()) return text
  const parts = text.split(new RegExp(`(${query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig'))
  return parts.map((p, i) => (p.toLowerCase() === query.trim().toLowerCase() ? <mark key={i}>{p}</mark> : p))
}

function makeSnippet(text: string, query: string): string {
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx < 0) return text.slice(0, 150) + (text.length > 150 ? '…' : '')
  const start = Math.max(0, idx - 60)
  return (start > 0 ? '…' : '') + text.slice(start, idx + query.length + 90) + '…'
}

function searchAll(query: string, role: Role, tagFilter: string[], sectionId: string | null): Hit[] {
  const q = query.trim().toLowerCase()
  if (!q && tagFilter.length === 0 && !sectionId) return []
  const visible = ARTICLES.filter((a) => articleVisibleToRole(a, role))
  const hits: Hit[] = []

  for (const a of visible) {
    if (tagFilter.length > 0 && !tagFilter.every((t) => a.tagIds.includes(t))) continue
    if (sectionId) {
      const pathIds = nodePath(a.nodeId).map((p) => p.id)
      if (!pathIds.includes(sectionId)) continue
    }
    const body = stripHtml(a.body)
    const titleMatch = a.title.toLowerCase().includes(q)
    const bodyMatch = q === '' || body.toLowerCase().includes(q)
    if (!titleMatch && !bodyMatch) continue
    if (q !== '' && !titleMatch && !bodyMatch) continue
    const snippetSrc = bodyMatch ? body : a.summary
    hits.push({
      kind: 'article',
      articleId: a.id,
      title: a.title,
      snippetText: makeSnippet(snippetSrc, q),
      snippet: highlight(makeSnippet(snippetSrc, q), q),
      meta: `${nodePath(a.nodeId).map((p) => p.name).join(' / ')} · ${a.author} · ${a.updatedAt}`,
      tagIds: a.tagIds,
    })
    const usedFiles = FILES.filter((f) => f.usageArticleIds.includes(a.id))
    for (const f of usedFiles) {
      if (q !== '' && !f.name.toLowerCase().includes(q)) continue
      hits.push({
        kind: 'file',
        fileId: f.id,
        articleId: a.id,
        title: f.name,
        snippetText: makeSnippet(body, q),
        snippet: highlight(makeSnippet(body, q), q),
        meta: `в статье: ${a.title}`,
        tagIds: a.tagIds,
        inFile: true,
      })
    }
  }
  return hits
}

function ResultCard({ hit, onOpen }: { hit: Hit; onOpen: (hit: Hit) => void }) {
  const { toast } = useDemo()
  if (hit.kind === 'file') {
    return (
      <div className="rounded-xl border-2 border-primary/50 bg-secondary/40 p-4 transition-shadow hover:shadow-(--shadow-card)">
        <div className="flex items-start gap-3">
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-surface px-2 py-1 text-xs font-bold text-danger">
            <FileText size={12} />
            {hit.title.split('.').pop()?.toUpperCase()}
          </span>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-primary/25 bg-secondary px-2 py-1 text-xs font-semibold text-primary-strong">
            Найдено в файле
          </span>
          <button onClick={() => onOpen(hit)} className="min-w-0 flex-1 cursor-pointer text-left">
            <p className="flex items-center gap-1.5 text-[15px] font-bold hover:text-primary">
              <span className="truncate">{hit.title}</span>
            </p>
          </button>
          <button onClick={() => toast(`Файл «${hit.title}» отправлен на загрузку`, 'info')} aria-label="Скачать файл" className="cursor-pointer rounded-lg p-1.5 text-muted hover:bg-surface hover:text-text">
            <Download size={16} />
          </button>
        </div>
        <p className="mt-2 text-[13px] leading-relaxed text-muted">{hit.snippet}</p>
        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-muted">{hit.meta}</span>
        </div>
      </div>
    )
  }
  return (
    <button onClick={() => onOpen(hit)} className="block w-full cursor-pointer rounded-xl border border-border/60 bg-surface p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-(--shadow-card)">
      <div className="flex items-start gap-3">
        <span className="shrink-0 rounded-md border border-border bg-surface-2 px-2 py-1 text-[11px] font-bold tracking-wide text-muted uppercase">Статья</span>
        <p className="min-w-0 flex-1 text-[15px] leading-snug font-bold">
          {hit.title}
          <ArrowUpRight size={15} className="ml-1 inline text-muted" />
        </p>
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-muted">{hit.snippet}</p>
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
        <span className="flex flex-wrap gap-1.5">
          {hit.tagIds.map((t) => (
            <Chip key={t} tone="blue">{TAG_NAME[t] ?? t}</Chip>
          ))}
        </span>
        <span className="text-xs text-muted">{hit.meta}</span>
      </div>
    </button>
  )
}

function FiltersPanel({
  tagFilter,
  toggleTag,
  sectionId,
  setSectionId,
  onReset,
}: {
  tagFilter: string[]
  toggleTag: (id: string) => void
  sectionId: string | null
  setSectionId: (id: string | null) => void
  onReset: () => void
}) {
  const roots = KB_NODES.filter((n) => n.parentId === null)
  return (
    <div className="flex h-full flex-col">
      <p className="mb-3 text-[17px] font-bold">Фильтры</p>
      <p className="mb-1.5 text-[11px] font-bold tracking-widest text-muted uppercase">Теги</p>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {tagFilter.map((t) => (
          <Chip key={t} tone="blue">
            {TAG_NAME[t] ?? t}
            <button onClick={() => toggleTag(t)} aria-label="Убрать тег" className="cursor-pointer font-bold hover:text-danger">×</button>
          </Chip>
        ))}
        {tagFilter.length === 0 && <span className="text-[13px] text-muted">Не выбраны</span>}
      </div>
      <p className="mb-2 text-[11px] font-bold tracking-widest text-muted uppercase">Раздел базы знаний</p>
      <div className="flex flex-col gap-1">
        <label className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] ${sectionId === null ? 'bg-secondary font-semibold text-primary-strong' : 'hover:bg-surface-2'}`}>
          <input type="radio" checked={sectionId === null} onChange={() => setSectionId(null)} className="h-4 w-4 accent-[#1478bd]" />
          Вся база знаний
        </label>
        {roots.map((r) => (
          <label key={r.id} className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] ${sectionId === r.id ? 'bg-secondary font-semibold text-primary-strong' : 'hover:bg-surface-2'}`}>
            <input type="radio" checked={sectionId === r.id} onChange={() => setSectionId(r.id)} className="h-4 w-4 accent-[#1478bd]" />
            {r.name}
          </label>
        ))}
      </div>
      <button onClick={onReset} className="mt-auto cursor-pointer pt-6 text-[13px] font-medium text-primary hover:underline">
        Сбросить фильтры
      </button>
    </div>
  )
}

export function SearchD() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { role } = useDemo()
  const initial = params.get('q') ?? ''
  const [input, setInput] = useState(initial)
  const [query, setQuery] = useState(initial)
  const [tagFilter, setTagFilter] = useState<string[]>([])
  const [sectionId, setSectionId] = useState<string | null>(null)
  const [focused, setFocused] = useState(false)

  // Реагируем на смену запроса в URL (например, новый поиск из топбара)
  useEffect(() => {
    const q = params.get('q') ?? ''
    setInput(q)
    setQuery(q)
  }, [params])

  const hits = useMemo(() => searchAll(query, role, tagFilter, sectionId), [query, role, tagFilter, sectionId])
  const searched = query.trim() !== '' || tagFilter.length > 0 || sectionId !== null

  const open = (hit: Hit) => {
    const slug = ARTICLES.find((a) => a.id === hit.articleId)?.slug
    if (slug) navigate(`/article/${slug}`)
  }
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setQuery(input)
  }
  const reset = () => {
    setTagFilter([])
    setSectionId(null)
  }

  return (
    <div className="flex min-h-full flex-col">
      <Topbar searchContext />
      <main className="mx-auto w-full max-w-[1320px] flex-1 px-8 pt-6 pb-10">
        <nav className="mb-2 flex items-center gap-2 text-[13px] text-muted">
          <button onClick={() => navigate('/kb')} className="cursor-pointer hover:text-text">База знаний</button>
          <span>›</span>
          <span className="font-medium text-text">Поиск</span>
        </nav>
        <h1 className="text-[28px] font-extrabold">Результаты поиска</h1>
        {query && <p className="mt-1 text-sm text-muted">По запросу «{query}»</p>}
        <form onSubmit={submit} className="relative mt-4 flex gap-3">
          <div className="relative flex-1">
            <SearchIcon size={16} className="absolute top-1/2 left-4 -translate-y-1/2 text-muted" />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => window.setTimeout(() => setFocused(false), 150)}
              placeholder="Статьи, документы, вложенные файлы..."
              className="h-12 w-full rounded-xl border border-border bg-surface pr-4 pl-11 text-sm shadow-(--shadow-card) transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
            />
            {focused && (
              <div className="absolute inset-x-0 top-[52px] z-20 rounded-xl border border-border bg-surface p-3 shadow-(--shadow-pop)">
                <p className="mb-2 text-[11px] font-bold tracking-widest text-muted uppercase">Часто ищут</p>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR.map((t) => (
                    <Chip key={t} tone="blue" onClick={() => { setTagFilter((p) => (p.includes(t) ? p : [...p, t])); setFocused(false) }}>
                      {TAG_NAME[t] ?? t}
                    </Chip>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Button size="lg" className="h-12 px-6">Найти</Button>
        </form>

        <div className="mt-6 grid grid-cols-[280px_1fr] items-start gap-5">
          <div className="sticky top-24 h-[560px] rounded-xl border border-border/60 bg-surface p-5 shadow-(--shadow-card)">
            <FiltersPanel tagFilter={tagFilter} toggleTag={(t) => setTagFilter((p) => p.filter((x) => x !== t))} sectionId={sectionId} setSectionId={setSectionId} onReset={reset} />
          </div>
          <div>
            {searched && hits.length > 0 && (
              <>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[15px] font-bold">Найдено {hits.length} {plural(hits.length, 'результат', 'результата', 'результатов')} по запросу «{query}»</p>
                  <select className="h-9 cursor-pointer rounded-lg border border-border bg-surface px-3 text-[13px] focus:outline-none">
                    <option>По релевантности</option>
                    <option>По дате обновления</option>
                  </select>
                </div>
                <div className="flex flex-col gap-3">
                  {hits.slice(0, 8).map((h, i) => (
                    <ResultCard key={i} hit={h} onOpen={open} />
                  ))}
                </div>
                <p className="mt-4 text-[13px] text-muted">Показаны 1–{Math.min(8, hits.length)} из {hits.length}</p>
              </>
            )}
            {searched && hits.length === 0 && (
              <div className="flex flex-col items-center rounded-xl border border-border/60 bg-surface px-6 py-16 text-center shadow-(--shadow-card)">
                <SearchIcon size={30} className="mb-4 text-muted" />
                <p className="text-[17px] font-bold">Ничего не найдено</p>
                <p className="mt-1.5 max-w-md text-sm leading-relaxed text-muted">
                  Попробуйте изменить запрос: проверьте раскладку, используйте меньше слов или уберите фильтры. Поиск работает и по тексту вложенных PDF и DOCX.
                </p>
                <div className="mt-5 flex gap-2">
                  <Button variant="secondary" onClick={() => { reset(); setQuery(''); setInput('') }}>Сбросить фильтры</Button>
                  <Button onClick={() => navigate('/kb')}>Вернуться в базу знаний</Button>
                </div>
              </div>
            )}
            {!searched && (
              <div className="flex flex-col items-center rounded-xl border border-dashed border-border bg-surface/60 px-6 py-16 text-center">
                <SearchIcon size={30} className="mb-4 text-muted" />
                <p className="text-[17px] font-bold">Введите запрос или выберите фильтры</p>
                <p className="mt-1.5 max-w-md text-sm leading-relaxed text-muted">Поиск найдёт статьи и совпадения внутри вложенных файлов PDF и DOCX с текстовым слоем.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export function SearchM() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { role } = useDemo()
  const initial = params.get('q') ?? ''
  const [input, setInput] = useState(initial)
  const [query, setQuery] = useState(initial)
  const [tagFilter, setTagFilter] = useState<string[]>([])
  const [sectionId, setSectionId] = useState<string | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    const q = params.get('q') ?? ''
    setInput(q)
    setQuery(q)
  }, [params])

  const hits = useMemo(() => searchAll(query, role, tagFilter, sectionId), [query, role, tagFilter, sectionId])
  const searched = query.trim() !== '' || tagFilter.length > 0 || sectionId !== null

  const open = (hit: Hit) => {
    const slug = ARTICLES.find((a) => a.id === hit.articleId)?.slug
    if (slug) navigate(`/m/article/${slug}`)
  }
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setQuery(input)
  }
  const reset = () => {
    setTagFilter([])
    setSectionId(null)
  }

  return (
    <MobilePage title="Поиск" showSearch={false} onBack={() => navigate('/m/kb')}>
      <div className="flex flex-1 flex-col px-4 pt-4 pb-10">
        <form onSubmit={submit} className="flex flex-col gap-2.5">
          <div className="relative">
            <SearchIcon size={16} className="absolute top-1/2 left-3.5 -translate-y-1/2 text-muted" />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Статьи и файлы..."
              className="h-11 w-full rounded-xl border border-border bg-surface pr-3 pl-10 text-sm shadow-(--shadow-card) focus:border-primary focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" className="flex-1">Найти</Button>
            <Button type="button" size="sm" variant="secondary" className="flex-1" onClick={() => setFiltersOpen(true)}>
              Фильтры{tagFilter.length + (sectionId ? 1 : 0) > 0 ? ` · ${tagFilter.length + (sectionId ? 1 : 0)}` : ''}
            </Button>
          </div>
        </form>

        {searched && hits.length > 0 && (
          <>
            <p className="mt-4 mb-2.5 text-[14px] font-bold">Найдено {hits.length} {plural(hits.length, 'результат', 'результата', 'результатов')}</p>
            <div className="flex flex-col gap-3">
              {hits.slice(0, 8).map((h, i) => (
                <ResultCard key={i} hit={h} onOpen={open} />
              ))}
            </div>
          </>
        )}
        {searched && hits.length === 0 && (
          <div className="mt-6 flex flex-col items-center rounded-xl border border-border/60 bg-surface px-5 py-10 text-center shadow-(--shadow-card)">
            <SearchIcon size={26} className="mb-3 text-muted" />
            <p className="text-[16px] font-bold">Ничего не найдено</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted">Попробуйте меньше слов или уберите фильтры.</p>
            <div className="mt-4 flex w-full flex-col gap-2">
              <Button variant="secondary" className="w-full" onClick={() => { reset(); setQuery(''); setInput('') }}>Сбросить фильтры</Button>
              <Button className="w-full" onClick={() => navigate('/m/kb')}>Вернуться в базу знаний</Button>
            </div>
          </div>
        )}
        {!searched && (
          <div className="mt-6 flex flex-col items-center rounded-xl border border-dashed border-border bg-surface/60 px-5 py-10 text-center">
            <p className="text-[15px] font-bold">Что будем искать?</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted">Поиск по статьям и вложенным файлам PDF/DOCX.</p>
            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              {POPULAR.map((t) => (
                <Chip key={t} tone="blue" onClick={() => { setInput(TAG_NAME[t] ?? ''); setQuery(TAG_NAME[t] ?? '') }}>{TAG_NAME[t] ?? t}</Chip>
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Фильтры" sheet>
        <FiltersPanel tagFilter={tagFilter} toggleTag={(t) => setTagFilter((p) => p.filter((x) => x !== t))} sectionId={sectionId} setSectionId={setSectionId} onReset={reset} />
      </Modal>
    </MobilePage>
  )
}

function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few
  return many
}
