import { useLocation, useNavigate } from 'react-router-dom'
import { useDemo } from '../demo/DemoContext'

/** Возвращает префикс текущего формата: '' для desktop, '/m' для mobile */
export function useFormatBase(): string {
  const { format } = useDemo()
  return format === 'mobile' ? '/m' : ''
}

/** Навигация внутри текущего формата */
export function useFormatNav() {
  const base = useFormatBase()
  const navigate = useNavigate()
  return (path: string) => {
    const clean = path.startsWith('/') ? path : `/${path}`
    navigate(`${base}${clean}`)
  }
}

/** Полный href с учётом формата — для Link */
export function useHref() {
  const base = useFormatBase()
  return (path: string) => `${base}${path}`
}

/** Переход в тот же экран другого формата (только для демо-переключателя) */
export function useCounterpartNavigate() {
  const location = useLocation()
  const navigate = useNavigate()
  return (target: 'desktop' | 'mobile') => {
    const isMobileNow = location.pathname.startsWith('/m/')
    const rest = isMobileNow ? location.pathname.slice(2) || '/' : location.pathname
    const next = target === 'mobile' ? `/m${rest === '/' ? '' : rest}` : rest
    navigate(next + location.search)
  }
}
