import { BookOpen, Search } from 'lucide-react'
import { GuestHeader } from './parts'
import { useDemo } from '../../demo/DemoContext'

function CapabilityCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-surface p-6 shadow-(--shadow-card) transition-all duration-200 hover:-translate-y-1 hover:shadow-(--shadow-pop)">
      <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-white">{icon}</span>
      <h3 className="mb-1 text-[17px] font-bold">{title}</h3>
      <p className="text-sm text-muted">{text}</p>
    </div>
  )
}

export function GuestHomeD() {
  const { role } = useDemo()
  if (role !== 'guest') return null
  return (
    <div className="flex min-h-full flex-col">
      <GuestHeader />
      <main className="flex flex-1 flex-col bg-secondary/40">
        <section className="flex flex-col items-center px-6 pt-20 pb-16 text-center">
          <h1 className="mb-3 text-[44px] leading-tight font-extrabold">База знаний MaxSoft</h1>
          <p className="text-[17px] text-muted">Инструкции, документы и поиск по материалам для клиентов MaxSoft</p>
        </section>
        <section className="mx-auto grid w-full max-w-[1320px] flex-1 grid-cols-2 content-start gap-5 px-8 pb-24">
          <CapabilityCard icon={<BookOpen size={22} />} title="База знаний" text="Инструкции и документация по продуктам" />
          <CapabilityCard icon={<Search size={22} />} title="Поиск" text="Поиск по статьям и вложенным файлам" />
        </section>
        <footer className="flex h-16 items-center justify-between border-t border-border/70 bg-surface px-8 text-sm text-muted">
          <span>© MaxSoft</span>
          <a href="mailto:helpsapr@maxsoft.ru" className="text-link hover:underline">
            helpsapr@maxsoft.ru
          </a>
        </footer>
      </main>
    </div>
  )
}

export function GuestHomeM() {
  const { role } = useDemo()
  if (role !== 'guest') return null
  return (
    <div className="flex min-h-full flex-col bg-secondary/40">
      <div className="bg-surface">
        <GuestHeader mobile />
      </div>
      <main className="flex flex-1 flex-col">
        <section className="flex flex-col items-center px-5 pt-10 pb-8 text-center">
          <h1 className="mb-2 text-[28px] leading-tight font-extrabold">База знаний MaxSoft</h1>
          <p className="text-sm text-muted">Инструкции, документы и поиск по материалам для клиентов MaxSoft</p>
        </section>
        <section className="flex flex-1 flex-col gap-3 px-4 pb-8">
          <CapabilityCard icon={<BookOpen size={20} />} title="База знаний" text="Инструкции и документация по продуктам" />
          <CapabilityCard icon={<Search size={20} />} title="Поиск" text="Поиск по статьям и вложенным файлам" />
        </section>
        <footer className="flex h-14 items-center justify-between border-t border-border/70 bg-surface px-4 text-xs text-muted">
          <span>© MaxSoft</span>
          <a href="mailto:helpsapr@maxsoft.ru" className="text-link hover:underline">
            helpsapr@maxsoft.ru
          </a>
        </footer>
      </main>
    </div>
  )
}
