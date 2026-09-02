import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileArchive, FileImage, FileText, Film, Grid3X3, MoreHorizontal, Table2 } from 'lucide-react'
import { ARTICLES, FILES } from '../../data/mock'
import type { KnowledgeFile } from '../../data/types'
import { Topbar } from '../../components/shell/Topbar'
import { MobilePage } from '../../components/shell/MobileShell'
import { Input } from '../../components/ui'
import { Drawer } from '../../components/overlays'

const FORMAT_FILTERS = [
  { id: 'pdf', label: 'PDF', icon: FileText },
  { id: 'dwg', label: 'DWG', icon: FileImage },
  { id: 'zip', label: 'ZIP', icon: FileArchive },
  { id: 'docx', label: 'DOCX', icon: FileText },
  { id: 'xlsx', label: 'XLSX', icon: Table2 },
  { id: 'mp4', label: 'Видео', icon: Film },
]

const EXT_ICON: Record<string, typeof FileText> = {
  pdf: FileText,
  docx: FileText,
  dwg: FileImage,
  zip: FileArchive,
  xlsx: Table2,
  csv: FileText,
  mp4: Film,
}

function articleTitle(id: string): string {
  return ARTICLES.find((a) => a.id === id)?.title ?? id
}

function UsageDrawer({ file, onClose }: { file: KnowledgeFile; onClose: () => void }) {
  const navigate = useNavigate()
  return (
    <Drawer open onClose={onClose} title="Места использования">
      <p className="mb-1 text-sm font-semibold">{file.name}</p>
      <p className="mb-4 text-xs text-muted">
        {file.ext.toUpperCase()} · {file.size} · загружен {file.uploadedAt}
      </p>
      <p className="mb-2 text-[11px] font-bold tracking-widest text-muted uppercase">Используется в статьях</p>
      {file.usageArticleIds.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-[13px] text-muted">Файл не используется ни в одной статье</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {file.usageArticleIds.map((id) => (
            <button
              key={id}
              onClick={() => {
                onClose()
                navigate(`/article/${ARTICLES.find((a) => a.id === id)?.slug ?? ''}`)
              }}
              className="cursor-pointer rounded-lg border border-border/60 px-3.5 py-2.5 text-left text-[13px] font-medium transition-colors hover:border-primary/40 hover:bg-secondary/50"
            >
              {articleTitle(id)}
            </button>
          ))}
        </div>
      )}
      <div className="mt-5 rounded-lg bg-surface-2 px-3.5 py-3 text-[13px] text-muted">
        Удаление файла доступно из карточки статьи. Файл нельзя удалить, пока он используется хотя бы в одной статье.
      </div>
    </Drawer>
  )
}

export function KbFilesD() {
  return <FilesScreen />
}

export function KbFilesM() {
  return (
    <MobilePage title="Реестр файлов" onBack={() => (window.location.hash = '#/m/kb')}>
      <FilesScreen mobile />
    </MobilePage>
  )
}

function FilesScreen({ mobile = false }: { mobile?: boolean }) {
  const [usage, setUsage] = useState<KnowledgeFile | null>(null)
  const [activeFormats, setActiveFormats] = useState<string[]>([])
  const [query, setQuery] = useState('')

  const filtered = FILES.filter(
    (f) =>
      (activeFormats.length === 0 || activeFormats.includes(f.ext)) &&
      (query.trim() === '' || f.name.toLowerCase().includes(query.toLowerCase())),
  )

  const toggleFormat = (id: string) => setActiveFormats((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  return (
    <>
      <Topbar />
      <main className={mobile ? 'flex flex-1 flex-col px-4 pt-4 pb-10' : 'mx-auto w-full max-w-[1320px] flex-1 px-8 pt-6 pb-10'}>
        <nav className="mb-2 flex items-center gap-2 text-[13px] text-muted">
          <span>Администрирование</span>
          <span>›</span>
          <button onClick={() => (window.location.hash = '#/kb')} className="cursor-pointer hover:text-text">База знаний</button>
          <span>›</span>
          <span className="font-medium text-text">Файлы</span>
        </nav>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className={mobile ? 'text-[24px] font-extrabold' : 'text-[28px] font-extrabold'}>Реестр файлов</h1>
            <p className="mt-1 text-sm text-muted">Все вложения базы знаний и места их использования</p>
          </div>
          <div className="w-full max-w-xs">
            <Input placeholder="Поиск по файлам..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>
        <div className="mb-4 flex flex-wrap items-center gap-1.5">
          <span className="text-[13px] font-medium text-muted">Форматы:</span>
          {FORMAT_FILTERS.map((f) => {
            const Icon = f.icon
            const active = activeFormats.includes(f.id)
            return (
              <button
                key={f.id}
                onClick={() => toggleFormat(f.id)}
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[13px] font-medium transition-colors ${
                  active ? 'border-primary bg-secondary text-primary-strong' : 'border-border bg-surface text-muted hover:border-primary/40 hover:text-text'
                }`}
              >
                <Icon size={13} />
                {f.label}
              </button>
            )
          })}
        </div>

        {mobile ? (
          <div className="flex flex-col gap-2.5">
            {filtered.map((f) => {
              const Icon = EXT_ICON[f.ext] ?? Grid3X3
              return (
                <button key={f.id} onClick={() => setUsage(f)} className="cursor-pointer rounded-xl border border-border/60 bg-surface p-4 text-left shadow-(--shadow-card) transition-colors hover:border-primary/40">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-primary">
                      <Icon size={17} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{f.name}</p>
                      <p className="text-xs text-muted">
                        {f.ext.toUpperCase()} · {f.size} · {f.uploadedAt}
                      </p>
                    </div>
                    <MoreHorizontal size={16} className="ml-auto shrink-0 text-muted" />
                  </div>
                  <p className="mt-2 truncate text-xs text-muted">
                    {f.usageArticleIds.length > 0 ? `Используется: ${articleTitle(f.usageArticleIds[0])}` : <span className="text-danger">Не используется</span>}
                  </p>
                </button>
              )
            })}
            {filtered.length === 0 && <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted">Файлы не найдены</p>}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border/60 bg-surface shadow-(--shadow-card)">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-surface-2/60 text-xs text-muted">
                  <th className="px-5 py-3 font-semibold">Файл</th>
                  <th className="px-3 py-3 font-semibold">Размер</th>
                  <th className="px-3 py-3 font-semibold">Загружен</th>
                  <th className="px-3 py-3 font-semibold">Используется в</th>
                  <th className="w-10 px-3 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((f) => {
                  const Icon = EXT_ICON[f.ext] ?? Grid3X3
                  return (
                    <tr key={f.id} className="border-b border-border/40 transition-colors last:border-b-0 hover:bg-bg/60">
                      <td className="px-5 py-3">
                        <span className="flex items-center gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-primary">
                            <Icon size={15} />
                          </span>
                          <span className="font-medium">{f.name}</span>
                          <span className="rounded border border-border bg-surface-2 px-1.5 py-0.5 text-[11px] font-semibold text-muted">{f.ext.toUpperCase()}</span>
                        </span>
                      </td>
                      <td className="px-3 py-3 text-muted">{f.size}</td>
                      <td className="px-3 py-3 text-muted">{f.uploadedAt}</td>
                      <td className="px-3 py-3">
                        {f.usageArticleIds.length === 0 ? (
                          <span className="font-medium text-danger">Не используется</span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <button onClick={() => setUsage(f)} className="cursor-pointer text-link hover:underline">
                              {articleTitle(f.usageArticleIds[0])}
                            </button>
                            {f.usageArticleIds.length > 1 && <span className="text-muted">+{f.usageArticleIds.length - 1}</span>}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <button onClick={() => setUsage(f)} aria-label="Места использования" className="cursor-pointer rounded-md p-1.5 text-muted hover:bg-surface-2 hover:text-text">
                          <MoreHorizontal size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-muted">Файлы не найдены</td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="flex items-center justify-between border-t border-border/60 px-5 py-3">
              <p className="text-[13px] text-muted">
                Показано {filtered.length} из {FILES.length}
                <span className="ml-2 text-xs">Реестр обновлён 02.09.2026 в 15:10</span>
              </p>
              <div className="flex items-center gap-1.5">
                <button className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-border text-muted hover:bg-surface-2">‹</button>
                <button className="h-9 min-w-9 rounded-lg border border-primary bg-primary text-sm font-medium text-white">1</button>
                <button className="h-9 min-w-9 cursor-pointer rounded-lg border border-border text-sm hover:bg-surface-2">2</button>
                <button className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-border text-muted hover:bg-surface-2">›</button>
              </div>
            </div>
          </div>
        )}
      </main>

      {usage && <UsageDrawer file={usage} onClose={() => setUsage(null)} />}
    </>
  )
}
