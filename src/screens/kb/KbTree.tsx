import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BookOpen, FolderOpen } from 'lucide-react'
import { KB_NODES } from '../../data/mock'
import { useDemo } from '../../demo/DemoContext'
import { Topbar } from '../../components/shell/Topbar'
import { MobilePage } from '../../components/shell/MobileShell'
import { Button } from '../../components/ui'
import { ArticleListCard, KbSidebar } from './kb-parts'
import { useFormatNav } from '../../components/nav'

export function KbTreeD() {
  const { nodeId } = useParams()
  const navigate = useNavigate()
  const { role } = useDemo()
  const [selected, setSelected] = useState<string | null>(nodeId ?? null)
  const select = (id: string) => {
    setSelected(id)
    navigate(`/kb/node/${id}`)
  }
  const effective = selected ?? KB_NODES.find((n) => n.parentId === null)?.id ?? null
  return (
    <div className="flex min-h-full flex-col">
      <Topbar searchContext />
      <main className="mx-auto w-full max-w-[1320px] flex-1 px-8 pt-6 pb-10">
        <nav className="mb-2 flex items-center gap-2 text-[13px] text-muted">
          <span>База знаний</span>
          <span>›</span>
          <span className="font-medium text-text">Разделы базы знаний</span>
        </nav>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h1 className="text-[28px] font-extrabold">Разделы базы знаний</h1>
            <p className="mt-1 text-sm text-muted">
              {role === 'admin' ? 'Инструкции, практики внедрения и материалы для администраторов' : 'Инструкции и документация по продуктам MaxSoft'}
            </p>
          </div>
          <span className="text-sm text-muted">12 статей</span>
        </div>
        <div className="grid grid-cols-[280px_1fr] items-start gap-5">
          <KbSidebar selectedId={effective} onSelect={select} />
          <ArticleListCard nodeId={effective ?? 'n-products'} />
        </div>
      </main>
    </div>
  )
}

export function KbTreeM() {
  const { nodeId } = useParams()
  const navigate = useFormatNav()
  const [selected, setSelected] = useState<string | null>(nodeId ?? null)
  const [showTree, setShowTree] = useState(!nodeId)
  const select = (id: string) => {
    setSelected(id)
    setShowTree(false)
    navigate(`/kb/node/${id}`)
  }
  const effective = selected ?? KB_NODES.find((n) => n.parentId === null)?.id ?? null
  return (
    <MobilePage title="База знаний" showSearch onBack={showTree ? undefined : () => setShowTree(true)}>
      <div className="flex flex-1 flex-col gap-3 px-4 pt-4 pb-8">
        {showTree ? (
          <>
            <h1 className="text-[22px] font-extrabold">Разделы базы знаний</h1>
            <KbSidebar selectedId={effective} onSelect={select} mobile />
          </>
        ) : (
          <ArticleListCard nodeId={effective ?? 'n-products'} />
        )}
      </div>
    </MobilePage>
  )
}

/** Пустое дерево разделов (KB-01 · пусто) */
export function KbTreeEmptyD() {
  const navigate = useFormatNav()
  return (
    <div className="flex min-h-full flex-col">
      <Topbar searchContext />
      <main className="mx-auto w-full max-w-[1320px] flex-1 px-8 pt-6 pb-10">
        <nav className="mb-2 flex items-center gap-2 text-[13px] text-muted">
          <span>База знаний</span>
          <span>›</span>
          <span className="font-medium text-text">Разделы</span>
        </nav>
        <h1 className="mb-4 text-[28px] font-extrabold">Разделы базы знаний</h1>
        <div className="grid grid-cols-[280px_1fr] items-start gap-5">
          <div className="rounded-xl border border-border/60 bg-surface p-3.5 shadow-(--shadow-card)">
            <p className="px-1 pt-1 pb-2.5 text-[11px] font-bold tracking-widest text-muted uppercase">Разделы</p>
            <p className="rounded-lg border border-dashed border-border px-2 py-4 text-center text-[13px] text-muted">Дерево пусто</p>
          </div>
          <div className="flex flex-col items-center justify-center rounded-xl border border-border/60 bg-surface px-6 py-16 text-center shadow-(--shadow-card)">
            <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2">
              <FolderOpen size={26} className="text-muted" />
            </span>
            <p className="text-[16px] font-bold">В базе знаний пока нет разделов</p>
            <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted">
              Создайте структуру разделов, чтобы начать публиковать инструкции. Черновики и статьи появятся в дереве сразу после создания.
            </p>
            <Button className="mt-5" onClick={() => navigate('/kb/structure')}>
              Настроить структуру
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

export function KbTreeEmptyM() {
  const navigate = useFormatNav()
  return (
    <MobilePage title="База знаний" showSearch>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-10 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2">
          <BookOpen size={26} className="text-muted" />
        </span>
        <p className="text-[16px] font-bold">В базе знаний пока нет разделов</p>
        <p className="text-[13px] leading-relaxed text-muted">Создайте структуру разделов, чтобы начать публиковать инструкции.</p>
        <Button className="mt-5" onClick={() => navigate('/m/kb/structure')}>
          Настроить структуру
        </Button>
      </div>
    </MobilePage>
  )
}
