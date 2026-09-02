import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  Bold,
  CheckCircle2,
  Eye,
  FileText,
  FileUp,
  Italic,
  Link2,
  List,
  ListOrdered,
  Redo2,
  Strikethrough,
  Table as TableIcon,
  Underline,
  Undo2,
  UnfoldVertical,
  X,
} from 'lucide-react'
import { ARTICLES, KB_NODES, TAGS } from '../../data/mock'
import type { Article } from '../../data/types'
import { useDemo } from '../../demo/DemoContext'
import { Topbar } from '../../components/shell/Topbar'
import { MobilePage } from '../../components/shell/MobileShell'
import { Button, Card, Checkbox, Chip, DraftBadge, Input, Switch } from '../../components/ui'
import { Modal } from '../../components/overlays'

const TAG_NAME = Object.fromEntries(TAGS.map((t) => [t.id, t.name]))

interface ImportState {
  phase: 'idle' | 'running' | 'done' | 'error'
  fileName: string
  progress: number
}

function ImportDialog({ state, onClose, onFile, onCancel, onRetry }: {
  state: ImportState
  onClose: () => void
  onFile: (name: string) => void
  onCancel: () => void
  onRetry: () => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  return (
    <Modal
      open
      onClose={state.phase === 'running' ? undefined : onClose}
      title={state.phase === 'idle' ? 'Импорт из Word' : state.phase === 'running' ? 'Импорт DOCX выполняется...' : state.phase === 'done' ? 'Импорт завершён' : 'Импорт не выполнен'}
      width={560}
    >
      {state.phase === 'idle' && (
        <div>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex w-full cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border bg-bg/60 px-6 py-10 text-center transition-colors hover:border-primary/50 hover:bg-secondary/50"
          >
            <FileUp size={28} className="text-primary" />
            <span className="text-sm font-semibold">Выберите файл .docx</span>
            <span className="max-w-xs text-xs leading-relaxed text-muted">Заголовки, списки и таблицы будут перенесены в статью. Изображения прикрепляются к статье автоматически.</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".docx"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) onFile(f.name)
            }}
          />
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>Отмена</Button>
          </div>
        </div>
      )}
      {state.phase === 'running' && (
        <div>
          <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-bg/60 px-3.5 py-3">
            <span className="rounded-md bg-secondary px-2 py-1 text-xs font-bold text-primary-strong">DOCX</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{state.fileName || 'регламент_работы_с_проектами.docx'}</p>
              <p className="text-xs text-muted">1,8 МБ · обнаружено 35 блоков</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-[13px]">
            <span className="font-medium">Импортируем содержимое...</span>
            <span className="font-bold text-primary">{state.progress}%</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-2">
            <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${state.progress}%` }} />
          </div>
          <p className="mt-3 flex items-center gap-2 text-[13px] text-muted">
            <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Извлечено {Math.round((state.progress / 100) * 35)} из 35 блоков · таблицы сохранены
          </p>
          <div className="mt-5 flex items-center justify-between">
            <p className="max-w-[280px] text-xs leading-snug text-muted">Статья появится в разделе, когда импорт завершится. Можно закрыть редактор.</p>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={onClose}>Скрыть</Button>
              <Button variant="secondary" onClick={onCancel}>Отменить</Button>
            </div>
          </div>
        </div>
      )}
      {state.phase === 'done' && (
        <div className="text-center">
          <CheckCircle2 size={40} className="mx-auto text-success" />
          <p className="mt-3 text-[15px] font-bold">Документ перенесён в черновик</p>
          <p className="mx-auto mt-1 max-w-sm text-[13px] leading-relaxed text-muted">
            «{state.fileName || 'регламент_работы_с_проектами.docx'}» → раздел НАВИСА / Настройка. Проверьте форматирование и опубликуйте статью.
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <Button onClick={onClose}>Открыть черновик</Button>
          </div>
        </div>
      )}
      {state.phase === 'error' && (
        <div className="text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#fbe4e4]">
            <X size={22} className="text-danger" />
          </div>
          <p className="mt-3 text-[15px] font-bold">Не удалось распознать документ</p>
          <p className="mx-auto mt-1 max-w-sm text-[13px] leading-relaxed text-muted">
            Файл «{state.fileName}» повреждён или защищён паролем. Попробуйте пересохранить его в .docx и повторить импорт.
            <span className="mt-1 block font-(--font-caption) text-xs text-[#9aa4b0]">KB_DOCX_IMPORT_FAILED</span>
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="secondary" onClick={onRetry}>Повторить</Button>
            <Button onClick={onClose}>Закрыть</Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

function ArticleSettingsPanel({ article, onPublished, onClose, mobile = false }: {
  article: Article
  onPublished: () => void
  onClose: () => void
  mobile?: boolean
}) {
  const [published, setPublished] = useState(article.status === 'published')
  const [nodes, setNodes] = useState<string[]>([article.nodeId])
  const [tags, setTags] = useState<string[]>([...article.tagIds])
  const [types, setTypes] = useState<string[]>([...article.typeIds])
  const [tagQuery, setTagQuery] = useState('')
  const { toast } = useDemo()

  const body = (
    <div className="flex flex-col gap-5">
      <div>
        <p className="mb-2 text-[11px] font-bold tracking-widest text-muted uppercase">Статус</p>
        <div className="flex items-center justify-between rounded-lg border border-border/70 px-3.5 py-2.5">
          <span className="text-sm font-medium">{published ? 'Опубликована' : 'Черновик'}</span>
          <Switch checked={published} onChange={setPublished} label="Публикация" />
        </div>
        <p className="mt-1.5 text-xs text-muted">Черновики видны только сотрудникам MaxSoft</p>
        <p className="mt-0.5 text-xs text-muted">Дата изменения: {article.updatedAt}</p>
      </div>
      <div>
        <p className="mb-2 text-[11px] font-bold tracking-widest text-muted uppercase">Разделы</p>
        <div className="flex flex-col gap-1.5">
          {KB_NODES.filter((n) => !n.parentId).flatMap((root) => {
            const children = KB_NODES.filter((c) => c.parentId === root.id)
            return [
              { id: root.id, label: root.name },
              ...children.map((c) => ({ id: c.id, label: `${root.name} / ${c.name}` })),
              ...KB_NODES.filter((g) => g.parentId && g.parentId !== root.id && children.some((ch) => ch.id === g.parentId)).map((g) => ({
                id: g.id,
                label: `${root.name} / ${KB_NODES.find((x) => x.id === g.parentId)?.name} / ${g.name}`,
              })),
            ]
          })
            .slice(0, 8)
            .map((n) => (
              <label key={n.id} className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-[13px] transition-colors ${nodes.includes(n.id) ? 'border-primary/50 bg-secondary' : 'border-border/70 hover:bg-surface-2'}`}>
                <Checkbox
                  label=""
                  checked={nodes.includes(n.id)}
                  onChange={(v) => setNodes((prev) => (v ? [...prev, n.id] : prev.filter((x) => x !== n.id)))}
                />
                {n.label}
              </label>
            ))}
        </div>
        <button className="mt-2 w-full cursor-pointer rounded-lg border border-dashed border-border py-2 text-[13px] font-medium text-muted transition-colors hover:border-primary/50 hover:text-primary">
          + Добавить узел
        </button>
      </div>
      <div>
        <p className="mb-2 text-[11px] font-bold tracking-widest text-muted uppercase">Теги</p>
        <div className="mb-2 flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <Chip tone="blue" key={t}>
              {TAG_NAME[t] ?? t}
              <button onClick={() => setTags((prev) => prev.filter((x) => x !== t))} className="ml-0.5 cursor-pointer font-bold hover:text-danger" aria-label="Убрать тег">
                ×
              </button>
            </Chip>
          ))}
        </div>
        <Input placeholder="Добавить тег..." value={tagQuery} onChange={(e) => setTagQuery(e.target.value)} />
        {tagQuery.trim() !== '' && (
          <div className="mt-1.5 rounded-lg border border-border bg-surface p-1.5 shadow-(--shadow-card)">
            {TAGS.filter((t) => (TAG_NAME[t.id] ?? '').toLowerCase().includes(tagQuery.toLowerCase()) && !tags.includes(t.id)).slice(0, 5).map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTags((prev) => [...prev, t.id])
                  setTagQuery('')
                }}
                className="block w-full cursor-pointer rounded-md px-2.5 py-1.5 text-left text-[13px] hover:bg-surface-2"
              >
                {TAG_NAME[t.id]}
              </button>
            ))}
          </div>
        )}
      </div>
      <div>
        <p className="mb-2 text-[11px] font-bold tracking-widest text-muted uppercase">Доступ по типам компаний</p>
        <div className="flex flex-col gap-1.5">
          {[
            { id: 't-basic', label: 'Базовый клиент' },
            { id: 't-vip', label: 'ВИП-клиент' },
            { id: 't-partner', label: 'Партнёр' },
          ].map((t) => (
            <label key={t.id} className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border/70 px-3 py-2 text-[13px] transition-colors hover:bg-surface-2">
              <Checkbox label="" checked={types.includes(t.id)} onChange={(v) => setTypes((prev) => (v ? [...prev, t.id] : prev.filter((x) => x !== t.id)))} />
              {t.label}
            </label>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-muted">Новая статья по умолчанию доступна всем типам.</p>
      </div>
      <div className="rounded-lg bg-surface-2 px-3.5 py-3">
        <p className="text-[13px]">
          <span className="text-muted">Автор: </span>
          <span className="font-semibold">{article.author}</span>
        </p>
        <p className="mt-0.5 text-xs text-muted">Создана 05.08.2026</p>
      </div>
      <div className="flex gap-2">
        <Button
          className="flex-1"
          onClick={() => {
            if (!published) {
              toast('Статья снята с публикации — теперь это черновик', 'info')
            } else {
              toast(published && article.status === 'published' ? 'Изменения сохранены' : 'Статья опубликована')
              onPublished()
            }
          }}
        >
          {article.status === 'published' ? 'Сохранить' : 'Опубликовать'}
        </Button>
        <Button variant="secondary" onClick={onClose}>Закрыть</Button>
      </div>
    </div>
  )

  if (mobile) {
    return (
      <Modal open onClose={onClose} title="Управление статьёй" sheet>
        {body}
      </Modal>
    )
  }
  return (
    <aside className="sticky top-24 h-fit w-[360px] shrink-0 rounded-xl border border-border/60 bg-surface shadow-(--shadow-card)">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3.5">
        <div>
          <p className="text-[15px] font-bold">Управление статьёй</p>
          <p className="text-xs text-muted">Параметры публикации</p>
        </div>
        <button onClick={onClose} aria-label="Закрыть панель" className="cursor-pointer rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-text">
          <X size={17} />
        </button>
      </div>
      <div className="p-4">{body}</div>
    </aside>
  )
}

function EditorToolbar() {
  const exec = (cmd: string, val?: string) => document.execCommand(cmd, false, val)
  const btn = 'flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-text'
  return (
    <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-border/60 bg-surface px-2 py-2 shadow-(--shadow-card) no-scrollbar">
      <button className={btn} title="Полужирный" onClick={() => exec('bold')}><Bold size={16} /></button>
      <button className={btn} title="Курсив" onClick={() => exec('italic')}><Italic size={16} /></button>
      <button className={btn} title="Подчёркнутый" onClick={() => exec('underline')}><Underline size={16} /></button>
      <button className={btn} title="Зачёркнутый" onClick={() => exec('strikeThrough')}><Strikethrough size={16} /></button>
      <span className="mx-1 h-5 w-px bg-border" />
      <select
        className="h-8 cursor-pointer rounded-md border border-border bg-surface px-2 text-[13px] focus:outline-none"
        onChange={(e) => exec('formatBlock', e.target.value)}
        defaultValue="p"
      >
        <option value="p">Обычный</option>
        <option value="h1">H1</option>
        <option value="h2">H2</option>
        <option value="h3">H3</option>
      </select>
      <span className="mx-1 h-5 w-px bg-border" />
      <button className={btn} title="Маркированный список" onClick={() => exec('insertUnorderedList')}><List size={16} /></button>
      <button className={btn} title="Нумерованный список" onClick={() => exec('insertOrderedList')}><ListOrdered size={16} /></button>
      <span className="mx-1 h-5 w-px bg-border" />
      <button className={btn} title="Таблица"><TableIcon size={16} /></button>
      <button className={btn} title="Вложение"><FileText size={16} /></button>
      <button className={btn} title="Ссылка" onClick={() => exec('createLink', 'https://portal.maxsoft.ru')}><Link2 size={16} /></button>
      <span className="mx-1 h-5 w-px bg-border" />
      <button className={btn} title="Отменить" onClick={() => exec('undo')}><Undo2 size={16} /></button>
      <button className={btn} title="Повторить" onClick={() => exec('redo')}><Redo2 size={16} /></button>
    </div>
  )
}

function EditorBody({ article }: { article: Article | null }) {
  const [title, setTitle] = useState(article?.title ?? '')
  const [saved, setSaved] = useState(true)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  const onEdit = () => {
    setSaved(false)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setSaved(true), 1200)
  }
  return (
    <Card className="flex-1 p-6">
      <div className="mb-4 flex items-center justify-between">
        {article?.status === 'published' ? (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-[#bfe3d0] bg-[#e2f3ea] px-2 py-0.5 text-xs font-medium text-[#17724b]">
            <span className="h-1.5 w-1.5 rounded-full bg-success" /> Опубликована
          </span>
        ) : (
          <DraftBadge />
        )}
        <span className={`text-xs transition-colors ${saved ? 'text-success' : 'text-muted'}`}>{saved ? 'Сохранено автоматически' : 'Автосохранение...'}</span>
      </div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onInput={onEdit}
        placeholder="Введите заголовок статьи"
        className="mb-4 w-full bg-transparent text-[30px] leading-tight font-extrabold placeholder:text-[#b3bcc7] focus:outline-none"
      />
      <div
        contentEditable
        suppressContentEditableWarning
        onInput={onEdit}
        className="article-content min-h-[420px] focus:outline-none"
        dangerouslySetInnerHTML={{ __html: article?.body ?? '<p>Начните писать текст статьи. Панель сверху поддерживает форматирование, списки и ссылки.</p>' }}
      />
    </Card>
  )
}

export function KbEditorD() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const { toast } = useDemo()
  const slug = params.get('article')
  const article = useMemo(() => ARTICLES.find((a) => a.slug === slug) ?? null, [slug])
  const [importState, setImportState] = useState<ImportState>({ phase: 'idle', fileName: '', progress: 0 })
  const [importOpen, setImportOpen] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const [preview, setPreview] = useState(false)
  const importTimer = useRef<number | undefined>(undefined)

  const startImport = (fileName: string) => {
    setImportState({ phase: 'running', fileName, progress: 5 })
    let p = 5
    importTimer.current = window.setInterval(() => {
      p += Math.floor(7 + Math.random() * 12)
      if (p >= 100) {
        window.clearInterval(importTimer.current)
        setImportState((s) => ({ ...s, phase: 'done', progress: 100 }))
      } else {
        setImportState((s) => ({ ...s, progress: p }))
      }
    }, 420)
  }

  useEffect(() => () => window.clearInterval(importTimer.current), [])

  const closeImport = () => {
    setImportState({ phase: 'idle', fileName: '', progress: 0 })
    setImportOpen(false)
    setParams({})
  }

  return (
    <div className="flex min-h-full flex-col">
      <Topbar />
      <div className="flex items-center justify-between gap-4 px-8 py-3.5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/kb')} aria-label="Назад" className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface text-muted transition-colors hover:text-text">
            <ArrowLeft size={17} />
          </button>
          <p className="text-[15px]">
            <button onClick={() => navigate('/kb')} className="cursor-pointer text-muted hover:text-text">База знаний</button>
            <span className="mx-2 text-muted">/</span>
            <span className="font-semibold">{article ? article.title : 'Новая статья'}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={<Eye size={15} />} onClick={() => setPreview(true)}>Предпросмотр</Button>
          <Button variant="secondary" icon={<FileUp size={15} />} onClick={() => setImportOpen(true)}>Импорт Word</Button>
          <Button
            onClick={() => {
              setPanelOpen(true)
            }}
          >
            Настройки статьи
          </Button>
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-[1360px] flex-1 items-start gap-5 px-8 pb-10">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <EditorToolbar />
          <EditorBody article={article} />
        </div>
        {panelOpen ? (
          <ArticleSettingsPanel
            article={article ?? ARTICLES[0]}
            onClose={() => setPanelOpen(false)}
            onPublished={() => navigate(`/article/${(article ?? ARTICLES[0]).slug}`)}
          />
        ) : (
          <Card className="flex h-[420px] w-[360px] flex-col items-center justify-center gap-3 p-8 text-center">
            <UnfoldVertical size={26} className="text-primary" />
            <p className="text-[15px] font-bold">Панель управления откроется здесь</p>
            <p className="text-[13px] leading-relaxed text-muted">Статус, разделы, теги, доступы и автор статьи</p>
            <Button variant="link" onClick={() => setPanelOpen(true)}>Открыть панель</Button>
          </Card>
        )}
      </div>
      {preview && (
        <Modal open onClose={() => setPreview(false)} title="Предпросмотр" width={820}>
          <h1 className="mb-2 text-[26px] font-extrabold">{article?.title ?? 'Новая статья'}</h1>
          <div className="article-content" dangerouslySetInnerHTML={{ __html: article?.body ?? '<p>Текст предпросмотра появится здесь.</p>' }} />
        </Modal>
      )}
      {(importOpen || importState.phase === 'running' || importState.phase === 'done' || importState.phase === 'error') && (
        <ImportDialog
          state={importState}
          onClose={closeImport}
          onFile={startImport}
          onCancel={() => {
            window.clearInterval(importTimer.current)
            toast('Импорт отменён', 'info')
            closeImport()
          }}
          onRetry={() => setImportState({ phase: 'idle', fileName: '', progress: 0 })}
        />
      )}
    </div>
  )
}

export function KbEditorM() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { toast } = useDemo()
  const slug = params.get('article')
  const article = useMemo(() => ARTICLES.find((a) => a.slug === slug) ?? null, [slug])
  const [importState, setImportState] = useState<ImportState>({ phase: 'idle', fileName: '', progress: 0 })
  const [importOpen, setImportOpen] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const [preview, setPreview] = useState(false)
  const importTimer = useRef<number | undefined>(undefined)
  const fileRef = useRef<HTMLInputElement>(null)

  const startImport = (fileName: string) => {
    setImportState({ phase: 'running', fileName, progress: 5 })
    let p = 5
    importTimer.current = window.setInterval(() => {
      p += Math.floor(8 + Math.random() * 12)
      if (p >= 100) {
        window.clearInterval(importTimer.current)
        setImportState((s) => ({ ...s, phase: 'done', progress: 100 }))
      } else {
        setImportState((s) => ({ ...s, progress: p }))
      }
    }, 380)
  }
  useEffect(() => () => window.clearInterval(importTimer.current), [])

  const closeImport = () => {
    setImportState({ phase: 'idle', fileName: '', progress: 0 })
    setImportOpen(false)
  }

  return (
    <MobilePage title="Редактор" onBack={() => navigate('/m/kb')}>
      <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-surface px-4 py-2.5">
        <p className="min-w-0 flex-1 truncate text-[13px] font-semibold">{article ? article.title : 'Новая статья'}</p>
        <Button variant="secondary" size="sm" icon={<Eye size={14} />} onClick={() => setPreview(true)}>Смотреть</Button>
        <Button size="sm" onClick={() => setPanelOpen(true)}>Панель</Button>
      </div>
      <div className="flex flex-1 flex-col gap-3 px-3 pt-3 pb-8">
        <div className="overflow-x-auto no-scrollbar">
          <EditorToolbar />
        </div>
        <EditorBody article={article} />
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" icon={<FileUp size={15} />} onClick={() => setImportOpen(true)}>
            Импорт Word
          </Button>
        </div>
        <input ref={fileRef} type="file" accept=".docx" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) startImport(f.name) }} />
      </div>
      {preview && (
        <Modal open onClose={() => setPreview(false)} title="Предпросмотр">
          <h1 className="mb-2 text-[22px] font-extrabold">{article?.title ?? 'Новая статья'}</h1>
          <div className="article-content" dangerouslySetInnerHTML={{ __html: article?.body ?? '<p>Текст предпросмотра появится здесь.</p>' }} />
        </Modal>
      )}
      {panelOpen && (
        <ArticleSettingsPanel
          mobile
          article={article ?? ARTICLES[0]}
          onClose={() => setPanelOpen(false)}
          onPublished={() => {
            setPanelOpen(false)
            toast('Статья опубликована')
            navigate('/m/article/' + (article ?? ARTICLES[0]).slug)
          }}
        />
      )}
      {(importOpen || importState.phase === 'running' || importState.phase === 'done' || importState.phase === 'error') && (
        <ImportDialog
          state={importState}
          onClose={closeImport}
          onFile={startImport}
          onCancel={() => {
            window.clearInterval(importTimer.current)
            toast('Импорт отменён', 'info')
            closeImport()
          }}
          onRetry={closeImport}
        />
      )}
    </MobilePage>
  )
}
