import { useMemo, useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Download, FileArchive, FileImage, FileText, Film, Link2, List, PanelLeft, Pause, Play } from 'lucide-react'
import { COMPANIES, TAGS, articleBySlug } from '../../data/mock'
import type { Article, Attachment } from '../../data/types'
import { isStaff, useDemo } from '../../demo/DemoContext'
import { Topbar } from '../../components/shell/Topbar'
import { MobilePage } from '../../components/shell/MobileShell'
import { Modal, NotAvailable } from '../../components/overlays'
import { Avatar } from '../../components/ui'
import { nodePath } from './kb-parts'

const TAG_NAME = Object.fromEntries(TAGS.map((t) => [t.id, t.name]))

const EXT_META: Record<Attachment['ext'], { label: string; icon: typeof FileText }> = {
  pdf: { label: 'PDF', icon: FileText },
  docx: { label: 'DOCX', icon: FileText },
  dwg: { label: 'DWG', icon: FileImage },
  zip: { label: 'ZIP', icon: FileArchive },
  xlsx: { label: 'XLSX', icon: FileText },
  csv: { label: 'CSV', icon: FileText },
  mp4: { label: 'MP4', icon: Film },
}

export function AttachmentRow({ file, onDownload }: { file: Attachment; onDownload: (f: Attachment) => void }) {
  const meta = EXT_META[file.ext]
  const Icon = meta.icon
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-surface px-3.5 py-2.5 transition-colors hover:border-primary/40">
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-surface-2 px-2 py-1 text-xs font-semibold text-primary-strong">
        <Icon size={13} />
        {meta.label} · {file.size}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-medium">{file.name}</span>
      <button onClick={() => onDownload(file)} aria-label={`Скачать ${file.name}`} className="cursor-pointer rounded-lg border border-border p-2 text-muted transition-colors hover:bg-surface-2 hover:text-text">
        <Download size={15} />
      </button>
    </div>
  )
}

function FilesBlock({ article }: { article: Article }) {
  const { toast } = useDemo()
  if (article.attachments.length === 0) return null
  const download = (f: Attachment) => toast(`Файл «${f.name}» отправлен на загрузку`, 'info')
  return (
    <section id="files" className="scroll-mt-24">
      <h2 className="mb-1 text-[20px] font-extrabold">Файлы</h2>
      <p className="mb-3.5 text-[13px] text-muted">Материалы для настройки, проверки и развёртывания.</p>
      <div className="flex flex-col gap-2">
        {article.attachments.map((f) => (
          <AttachmentRow key={f.id} file={f} onDownload={download} />
        ))}
      </div>
    </section>
  )
}

function VideoPlayer({ article }: { article: Article }) {
  const video = article.video!
  const [active, setActive] = useState(0)
  const [playing, setPlaying] = useState(false)
  const total = 982 // 16:22 в секундах
  const current = video.timecodes[active].seconds
  const progress = Math.min(100, (current / total) * 100)
  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  return (
    <div className="my-4">
      <div className="relative overflow-hidden rounded-xl border border-border/60" style={{ background: video.poster }}>
        <div className="flex aspect-video flex-col items-center justify-center gap-4">
          <p className="absolute top-4 left-5 text-[11px] font-bold tracking-widest text-white/60 uppercase">Видео­инструкция · MaxSoft</p>
          <button
            onClick={() => setPlaying((v) => !v)}
            aria-label={playing ? 'Пауза' : 'Смотреть'}
            className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-xl bg-white/95 text-[#0e2a40] shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            {playing ? <Pause size={26} /> : <Play size={26} className="ml-1" />}
          </button>
          {playing && <div className="absolute inset-0 animate-(--animate-fade-in) bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.14),transparent_60%)]" />}
        </div>
        <div className="flex items-center gap-3 px-5 pb-4">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs font-medium text-white/80 tabular-nums">
            {fmt(current)} / {video.duration}
          </span>
        </div>
      </div>
      <div className="mt-3 flex flex-col">
        {video.timecodes.map((tc, i) => (
          <button
            key={tc.time}
            onClick={() => {
              setActive(i)
              setPlaying(true)
            }}
            className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
              active === i ? 'bg-secondary font-semibold text-primary-strong' : 'hover:bg-surface-2'
            }`}
          >
            <span className={`w-11 text-[13px] tabular-nums ${active === i ? 'font-bold text-primary' : 'text-primary/80'}`}>{tc.time}</span>
            {active === i && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
            <span className={active === i ? '' : 'text-muted'}>{tc.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function useAccessCheck(article: Article | undefined): 'ok' | 'no-article' | 'denied' {
  const { role } = useDemo()
  return useMemo(() => {
    if (!article) return 'no-article'
    if (isStaff(role)) return 'ok'
    if (article.status === 'draft') return 'denied'
    if (role === 'guest') return 'ok'
    const company = COMPANIES.find((c) => c.id === 'c-sibir')
    if (!company) return 'denied'
    return article.typeIds.includes(company.typeId) ? 'ok' : 'denied'
  }, [article, role])
}

function ArticleBody({ article }: { article: Article }) {
  const html = article.body.replace(/<video\/>/g, '')
  return <div className="article-content" dangerouslySetInnerHTML={{ __html: html }} />
}

export function ArticleD() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { toast } = useDemo()
  const article = articleBySlug(slug ?? '')
  const access = useAccessCheck(article)
  const bodyRef = useRef<HTMLDivElement>(null)

  if (access === 'no-article') return <Shell><NotAvailable onBack={() => navigate('/kb')} backLabel="В базу знаний" /></Shell>
  if (access === 'denied') return <Shell><NotAvailable onBack={() => navigate('/kb')} backLabel="В базу знаний" /></Shell>
  if (!article) return null

  const path = nodePath(article.nodeId)
  const sections = Array.from(article.body.matchAll(/<h2(?: id="([^"]*)")?>([^<]+)<\/h2>/g)).map((m) => ({ id: m[1] ?? '', title: m[2] }))

  const scrollTo = (id: string) => (e: MouseEvent) => {
    e.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <Shell>
      <div className="mx-auto flex w-full max-w-[1240px] flex-1 gap-8 px-6 pt-6 pb-14">
        <aside className="sticky top-24 hidden h-fit w-12 shrink-0 flex-col items-center gap-1 rounded-xl border border-border/60 bg-surface py-3 shadow-(--shadow-card) xl:flex">
          <button onClick={() => navigate('/kb')} title="К дереву разделов" className="cursor-pointer rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-text">
            <PanelLeft size={17} />
          </button>
          <button onClick={() => navigate('/kb')} title="Разделы" className="cursor-pointer rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-text">
            <span className="block h-px w-4 bg-current" />
          </button>
          <button onClick={() => document.getElementById('files')?.scrollIntoView({ behavior: 'smooth' })} title="Файлы" className="cursor-pointer rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-text">
            <Download size={17} />
          </button>
          <button onClick={() => document.getElementById('toc')?.scrollIntoView({ behavior: 'smooth' })} title="Оглавление" className="cursor-pointer rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-text">
            <List size={17} />
          </button>
          <button onClick={() => toast('Ссылка на статью скопирована', 'info')} title="Копировать ссылку" className="cursor-pointer rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-text">
            <Link2 size={17} />
          </button>
        </aside>

        <article ref={bodyRef} className="min-w-0 flex-1">
          <nav className="mb-3 flex flex-wrap items-center gap-2 text-[13px] text-muted">
            <button onClick={() => navigate('/kb')} className="cursor-pointer hover:text-text">База знаний</button>
            {path.map((p) => (
              <span key={p.id} className="flex items-center gap-2">
                <span>›</span>
                <button onClick={() => navigate(`/kb/node/${p.id}`)} className="cursor-pointer hover:text-text">
                  {p.name}
                </button>
              </span>
            ))}
          </nav>
          <h1 className="text-[34px] leading-tight font-extrabold">{article.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-2 text-[13px] text-muted">
              <Avatar initials={article.authorShort} size={26} />
              <span className="font-semibold text-text">{article.author}</span>
              <span>· обновлено {article.updatedAt}</span>
            </span>
            {article.status === 'draft' && (
              <span className="rounded-md border border-border bg-surface-2 px-2 py-0.5 text-xs font-medium text-muted">Черновик</span>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {article.tagIds.map((t) => (
              <span key={t} className="rounded-md border border-primary/20 bg-secondary px-2.5 py-1 text-xs font-medium text-primary-strong">
                {TAG_NAME[t] ?? t}
              </span>
            ))}
          </div>
          <div className="mt-5">
            {article.video && <VideoPlayer article={article} />}
            <ArticleBody article={article} />
          </div>
          <div className="mt-8 border-t border-border/60 pt-6">
            <FilesBlock article={article} />
          </div>
        </article>

        <aside id="toc" className="sticky top-24 hidden h-fit w-60 shrink-0 lg:block">
          <p className="mb-2 text-[11px] font-bold tracking-widest text-muted uppercase">На этой странице</p>
          <nav className="flex flex-col border-l border-border">
            {sections.map((s, i) => (
              <a
                key={i}
                href={`#${s.id}`}
                onClick={scrollTo(s.id)}
                className={`-ml-px border-l-2 py-1.5 pl-3 text-[13px] transition-colors ${
                  i === 0 ? 'border-primary font-semibold text-primary-strong' : 'border-transparent text-muted hover:border-border hover:text-text'
                }`}
              >
                {s.title}
              </a>
            ))}
            <a href="#files" onClick={scrollTo('files')} className="-ml-px border-l-2 border-transparent py-1.5 pl-3 text-[13px] text-muted transition-colors hover:border-border hover:text-text">
              Файлы
            </a>
          </nav>
        </aside>
      </div>
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <Topbar searchContext />
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  )
}

export function ArticleM() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const article = articleBySlug(slug ?? '')
  const access = useAccessCheck(article)
  const [tocOpen, setTocOpen] = useState(false)

  if (access === 'no-article' || access === 'denied')
    return (
      <MobilePage title="Статья" onBack={() => navigate('/m/kb')}>
        <NotAvailable onBack={() => navigate('/m/kb')} backLabel="В базу знаний" />
      </MobilePage>
    )
  if (!article) return null

  const path = nodePath(article.nodeId)
  const sections = Array.from(article.body.matchAll(/<h2(?: id="([^"]*)")?>([^<]+)<\/h2>/g)).map((m) => ({ id: m[1] ?? '', title: m[2] }))

  const scrollTo = (id: string) => (e: MouseEvent) => {
    e.preventDefault()
    setTocOpen(false)
    window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120)
  }

  return (
    <MobilePage title={path[path.length - 1]?.name} showSearch onBack={() => navigate('/m/kb')}>
      <article className="flex-1 px-4 pt-4 pb-20">
        <nav className="mb-2 flex flex-wrap items-center gap-1.5 text-xs text-muted">
          <span>База знаний</span>
          {path.map((p) => (
            <span key={p.id} className="flex items-center gap-1.5">
              <span>›</span>
              <span>{p.name}</span>
            </span>
          ))}
        </nav>
        <h1 className="text-[24px] leading-tight font-extrabold">{article.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          <span className="flex items-center gap-2 text-xs text-muted">
            <Avatar initials={article.authorShort} size={24} />
            <span className="font-semibold text-text">{article.author}</span>
            <span>· {article.updatedAt}</span>
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {article.tagIds.map((t) => (
            <span key={t} className="rounded-md border border-primary/20 bg-secondary px-2.5 py-1 text-xs font-medium text-primary-strong">
              {TAG_NAME[t] ?? t}
            </span>
          ))}
        </div>
        <div className="mt-4">
          {article.video && <VideoPlayer article={article} />}
          <ArticleBody article={article} />
        </div>
        <div className="mt-8 border-t border-border/60 pt-5">
          <FilesBlock article={article} />
        </div>
      </article>
      <button
        onClick={() => setTocOpen(true)}
        className="fixed right-4 bottom-20 z-20 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow-(--shadow-pop) transition-transform hover:scale-105 active:scale-95 sm:right-[calc(50%-195px+16px)]"
        aria-label="Оглавление"
      >
        <List size={20} />
      </button>
      <Modal open={tocOpen} onClose={() => setTocOpen(false)} title="На этой странице" sheet>
        <nav className="flex flex-col">
          {sections.map((s, i) => (
            <button key={i} onClick={scrollTo(s.id || 'files')} className="cursor-pointer rounded-lg py-2.5 text-left text-sm text-text hover:bg-surface-2">
              {s.title}
            </button>
          ))}
          <button onClick={scrollTo('files')} className="cursor-pointer rounded-lg py-2.5 text-left text-sm text-text hover:bg-surface-2">
            Файлы
          </button>
        </nav>
      </Modal>
    </MobilePage>
  )
}
