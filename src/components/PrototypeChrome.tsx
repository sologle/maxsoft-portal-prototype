import { useState } from 'react'
import type { ReactNode } from 'react'
import { Monitor, Smartphone } from 'lucide-react'
import { useDemo } from '../demo/DemoContext'
import { Toasts } from './overlays'
import { useCounterpartNavigate } from './nav'
import type { Role } from '../data/types'

/**
 * Демо-панель прототипа: не часть продукта. Позволяет заказчику
 * переключать роль и формат без повторного входа.
 */
function DemoPanel() {
  const { role, format, login, logout } = useDemo()
  const switchFormat = useCounterpartNavigate()
  const [open, setOpen] = useState(false)

  const roles: { id: Role; label: string }[] = [
    { id: 'guest', label: 'Гость' },
    { id: 'admin', label: 'Администратор портала' },
    { id: 'engineer', label: 'Инженер ТП' },
    { id: 'manager', label: 'Менеджер' },
    { id: 'client-admin', label: 'Администратор клиента' },
    { id: 'client-user', label: 'Сотрудник клиента' },
  ]

  return (
    <div className="fixed right-4 bottom-4 z-[70] flex flex-col items-end gap-2 print:hidden">
      {open && (
        <div className="w-64 animate-(--animate-scale-in) rounded-xl border border-[#2a3440] bg-[#11161d] p-3 text-white shadow-(--shadow-pop)">
          <p className="mb-1.5 text-[11px] font-semibold tracking-widest text-[#8fa1b3] uppercase">Роль</p>
          <div className="mb-3 flex flex-col gap-0.5">
            {roles.map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  if (r.id === 'guest') logout()
                  else login(r.id)
                }}
                className={`cursor-pointer rounded-lg px-2.5 py-1.5 text-left text-[13px] transition-colors ${
                  role === r.id ? 'bg-[#1478bd] text-white' : 'text-[#c9d4de] hover:bg-white/10'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <p className="mb-1.5 text-[11px] font-semibold tracking-widest text-[#8fa1b3] uppercase">Формат</p>
          <div className="mb-3 grid grid-cols-2 gap-1">
            <button
              onClick={() => switchFormat('desktop')}
              className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] transition-colors ${
                format === 'desktop' ? 'bg-[#1478bd] text-white' : 'text-[#c9d4de] hover:bg-white/10'
              }`}
            >
              <Monitor size={14} /> 1440
            </button>
            <button
              onClick={() => switchFormat('mobile')}
              className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] transition-colors ${
                format === 'mobile' ? 'bg-[#1478bd] text-white' : 'text-[#c9d4de] hover:bg-white/10'
              }`}
            >
              <Smartphone size={14} /> 390
            </button>
          </div>
          <button
            onClick={() => {
              logout()
              window.location.hash = ''
            }}
            className="w-full cursor-pointer rounded-lg border border-white/15 px-2.5 py-1.5 text-[13px] text-[#c9d4de] transition-colors hover:bg-white/10"
          >
            Сбросить демо
          </button>
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex cursor-pointer items-center gap-2 rounded-full bg-[#11161d] px-4 py-2.5 text-[13px] font-semibold text-white shadow-(--shadow-pop) transition-transform hover:scale-105 active:scale-95"
      >
        <span className="h-2 w-2 rounded-full bg-[#35d0b5]" />
        ДЕМО
      </button>
    </div>
  )
}

export function PrototypeChrome({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full">
      {children}
      <DemoPanel />
      <Toasts />
    </div>
  )
}
