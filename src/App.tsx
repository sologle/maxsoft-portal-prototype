import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { HashRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { DemoProvider, useDemo, can } from './demo/DemoContext'
import type { Format } from './data/types'
import { PrototypeChrome } from './components/PrototypeChrome'
import { OverlayRootProvider } from './components/overlays'
import { useCounterpartNavigate } from './components/nav'

import { GuestHomeD, GuestHomeM } from './screens/auth/Home'
import { LoginD, LoginM } from './screens/auth/Login'
import { RegisterD, RegisterM, RegisterResultD, RegisterResultM } from './screens/auth/Register'
import { RecoveryD, RecoveryM } from './screens/auth/Recovery'
import { DashboardD, DashboardM } from './screens/dashboard/Dashboard'
import { KbTreeD, KbTreeM, KbTreeEmptyD, KbTreeEmptyM } from './screens/kb/KbTree'
import { ArticleD, ArticleM } from './screens/kb/KbArticle'
import { KbEditorD, KbEditorM } from './screens/kb/KbEditor'
import { KbStructureD, KbStructureM } from './screens/kb/KbStructure'
import { KbTagsD, KbTagsM } from './screens/kb/KbTags'
import { KbFilesD, KbFilesM } from './screens/kb/KbFiles'
import { SearchD, SearchM } from './screens/kb/SearchScreens'
import { CompaniesD, CompaniesM } from './screens/org/Companies'
import { CompanyCardD, CompanyCardM } from './screens/org/CompanyCard'
import { CompanyTypesD, CompanyTypesM } from './screens/org/CompanyTypes'
import { PortalUsersD, PortalUsersM } from './screens/org/PortalUsers'
import { CompanyUsersD, CompanyUsersM } from './screens/org/CompanyUsers'
import { AdminHomeD, AdminHomeM, AdminDeniedD, AdminDeniedM, IntegrationsD, IntegrationsM, AuditD, AuditM, CompanyFieldsD, CompanyFieldsM } from './screens/plat/PlatScreens'

/** Мобильные маршруты: '/m' и всё, что начинается с '/m/' */
function isMobilePath(pathname: string): boolean {
  return pathname === '/m' || pathname.startsWith('/m/')
}

function useViewportCategory(): 'narrow' | 'wide' {
  const [cat, setCat] = useState<'narrow' | 'wide'>(() => (window.innerWidth < 768 ? 'narrow' : 'wide'))
  useEffect(() => {
    const onResize = () => setCat(window.innerWidth < 768 ? 'narrow' : 'wide')
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return cat
}

/** Автоперевод между форматами при смене категории вьюпорта (граница 768px) */
function FormatSync({ category }: { category: 'narrow' | 'wide' }) {
  const location = useLocation()
  const navigate = useNavigate()
  const prev = useRef(category)
  useEffect(() => {
    if (prev.current === category) return
    prev.current = category
    const mobile = isMobilePath(location.pathname)
    if (category === 'narrow' && !mobile) {
      navigate('/m' + (location.pathname === '/' ? '' : location.pathname) + location.search, { replace: true })
    }
    if (category === 'wide' && mobile) {
      navigate(location.pathname.slice(2) + location.search, { replace: true })
    }
  }, [category, location.pathname, location.search, navigate])
  return null
}

/** Требует авторизации; гость уходит на вход с возвратом к исходному ресурсу */
function RequireAuth({ children, section }: { children: ReactNode; section?: string }) {
  const { role } = useDemo()
  const location = useLocation()
  if (role === 'guest') {
    const next = location.pathname + location.search
    return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />
  }
  if (section && !can(section, role)) {
    return <Navigate to={(isMobilePath(location.pathname) ? '/m' : '') + '/denied'} replace />
  }
  return <>{children}</>
}

/** Гостевые страницы: авторизованного пользователя уводим в кабинет */
function GuestOnly({ children }: { children: ReactNode }) {
  const { role } = useDemo()
  const location = useLocation()
  if (role !== 'guest') {
    const params = new URLSearchParams(location.search)
    const next = params.get('next')
    return <Navigate to={next ?? (isMobilePath(location.pathname) ? '/m/dashboard' : '/dashboard')} replace />
  }
  return <>{children}</>
}

function StageRoot({ children }: { children: ReactNode }) {
  const [root, setRoot] = useState<HTMLElement | null>(null)
  return (
    <div className="relative flex min-h-full flex-col">
      <OverlayRootProvider root={root}>
        {children}
        <div
          ref={setRoot}
          className="pointer-events-none absolute inset-0 z-50 [&_*]:pointer-events-auto"
        />
      </OverlayRootProvider>
    </div>
  )
}

/** Мобильная сцена: на узком экране — во всю ширину, на широком — в рамке телефона */
function MobileLayout({ children }: { children: ReactNode }) {
  const category = useViewportCategory()
  if (category === 'narrow') {
    return <div className="min-h-screen bg-bg">{children}</div>
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#dfe7ef_0%,#c8d6e4_50%,#d8e2ec_100%)] py-8">
      <div
        className="relative overflow-hidden rounded-[38px] border-[10px] border-[#10161d] bg-bg shadow-(--shadow-phone)"
        style={{ width: 390, height: 'min(844px, calc(100vh - 64px))' }}
      >
        <div className="absolute top-0 left-1/2 z-40 flex h-7 w-32 -translate-x-1/2 items-center justify-center rounded-b-2xl bg-[#10161d] text-[10px] font-semibold text-white/80">
          9:41
        </div>
        <div className="h-full overflow-y-auto overflow-x-hidden">
          <div className="h-7" />
          <StageRoot>{children}</StageRoot>
        </div>
      </div>
    </div>
  )
}

const kindFromHash = () => (window.location.hash.split('/').pop() ?? 'review') as 'existing' | 'new' | 'review'

function MobileRoutes() {
  return (
    <Routes>
      <Route path="/m" element={<GuestOnly><GuestHomeM /></GuestOnly>} />
      <Route path="/m/" element={<GuestOnly><GuestHomeM /></GuestOnly>} />
      <Route path="/m/login" element={<GuestOnly><LoginM /></GuestOnly>} />
      <Route path="/m/register" element={<GuestOnly><RegisterM /></GuestOnly>} />
      <Route path="/m/register/result/:kind" element={<GuestOnly><RegisterResultM kind={kindFromHash()} /></GuestOnly>} />
      <Route path="/m/recovery" element={<GuestOnly><RecoveryM step="email" /></GuestOnly>} />
      <Route path="/m/recovery/sent" element={<GuestOnly><RecoveryM step="sent" /></GuestOnly>} />
      <Route path="/m/recovery/new" element={<GuestOnly><RecoveryM step="new" /></GuestOnly>} />
      <Route path="/m/recovery/success" element={<GuestOnly><RecoveryM step="success" /></GuestOnly>} />
      <Route path="/m/dashboard" element={<RequireAuth section="dashboard"><DashboardM /></RequireAuth>} />
      <Route path="/m/kb" element={<RequireAuth section="kb"><KbTreeM /></RequireAuth>} />
      <Route path="/m/kb/node/:nodeId" element={<RequireAuth section="kb"><KbTreeM /></RequireAuth>} />
      <Route path="/m/kb/empty" element={<RequireAuth section="kb"><KbTreeEmptyM /></RequireAuth>} />
      <Route path="/m/article/:slug" element={<RequireAuth section="kb"><ArticleM /></RequireAuth>} />
      <Route path="/m/kb/editor" element={<RequireAuth section="kb-staff"><KbEditorM /></RequireAuth>} />
      <Route path="/m/kb/structure" element={<RequireAuth section="kb-staff"><KbStructureM /></RequireAuth>} />
      <Route path="/m/kb/tags" element={<RequireAuth section="kb-staff"><KbTagsM /></RequireAuth>} />
      <Route path="/m/kb/files" element={<RequireAuth section="kb-staff"><KbFilesM /></RequireAuth>} />
      <Route path="/m/search" element={<RequireAuth section="search"><SearchM /></RequireAuth>} />
      <Route path="/m/companies" element={<RequireAuth section="org"><CompaniesM /></RequireAuth>} />
      <Route path="/m/companies/:id" element={<RequireAuth section="org"><CompanyCardM /></RequireAuth>} />
      <Route path="/m/company-types" element={<RequireAuth section="org"><CompanyTypesM /></RequireAuth>} />
      <Route path="/m/users" element={<RequireAuth section="org-users"><PortalUsersM /></RequireAuth>} />
      <Route path="/m/company/users" element={<RequireAuth section="company-users"><CompanyUsersM /></RequireAuth>} />
      <Route path="/m/admin" element={<RequireAuth section="plat"><AdminHomeM /></RequireAuth>} />
      <Route path="/m/admin/integrations" element={<RequireAuth section="plat"><IntegrationsM /></RequireAuth>} />
      <Route path="/m/admin/audit" element={<RequireAuth section="plat"><AuditM /></RequireAuth>} />
      <Route path="/m/admin/company-fields" element={<RequireAuth section="plat"><CompanyFieldsM /></RequireAuth>} />
      <Route path="/m/denied" element={<AdminDeniedM />} />
      <Route path="*" element={<Navigate to="/m" replace />} />
    </Routes>
  )
}

function DesktopRoutes() {
  return (
    <Routes>
      <Route path="/" element={<GuestOnly><GuestHomeD /></GuestOnly>} />
      <Route path="/login" element={<GuestOnly><LoginD /></GuestOnly>} />
      <Route path="/register" element={<GuestOnly><RegisterD /></GuestOnly>} />
      <Route path="/register/result/:kind" element={<GuestOnly><RegisterResultD kind={kindFromHash()} /></GuestOnly>} />
      <Route path="/recovery" element={<GuestOnly><RecoveryD step="email" /></GuestOnly>} />
      <Route path="/recovery/sent" element={<GuestOnly><RecoveryD step="sent" /></GuestOnly>} />
      <Route path="/recovery/new" element={<GuestOnly><RecoveryD step="new" /></GuestOnly>} />
      <Route path="/recovery/success" element={<GuestOnly><RecoveryD step="success" /></GuestOnly>} />
      <Route path="/dashboard" element={<RequireAuth section="dashboard"><DashboardD /></RequireAuth>} />
      <Route path="/kb" element={<RequireAuth section="kb"><KbTreeD /></RequireAuth>} />
      <Route path="/kb/node/:nodeId" element={<RequireAuth section="kb"><KbTreeD /></RequireAuth>} />
      <Route path="/kb/empty" element={<RequireAuth section="kb"><KbTreeEmptyD /></RequireAuth>} />
      <Route path="/article/:slug" element={<RequireAuth section="kb"><ArticleD /></RequireAuth>} />
      <Route path="/kb/editor" element={<RequireAuth section="kb-staff"><KbEditorD /></RequireAuth>} />
      <Route path="/kb/structure" element={<RequireAuth section="kb-staff"><KbStructureD /></RequireAuth>} />
      <Route path="/kb/tags" element={<RequireAuth section="kb-staff"><KbTagsD /></RequireAuth>} />
      <Route path="/kb/files" element={<RequireAuth section="kb-staff"><KbFilesD /></RequireAuth>} />
      <Route path="/search" element={<RequireAuth section="search"><SearchD /></RequireAuth>} />
      <Route path="/companies" element={<RequireAuth section="org"><CompaniesD /></RequireAuth>} />
      <Route path="/companies/:id" element={<RequireAuth section="org"><CompanyCardD /></RequireAuth>} />
      <Route path="/company-types" element={<RequireAuth section="org"><CompanyTypesD /></RequireAuth>} />
      <Route path="/users" element={<RequireAuth section="org-users"><PortalUsersD /></RequireAuth>} />
      <Route path="/company/users" element={<RequireAuth section="company-users"><CompanyUsersD /></RequireAuth>} />
      <Route path="/admin" element={<RequireAuth section="plat"><AdminHomeD /></RequireAuth>} />
      <Route path="/admin/integrations" element={<RequireAuth section="plat"><IntegrationsD /></RequireAuth>} />
      <Route path="/admin/audit" element={<RequireAuth section="plat"><AuditD /></RequireAuth>} />
      <Route path="/admin/company-fields" element={<RequireAuth section="plat"><CompanyFieldsD /></RequireAuth>} />
      <Route path="/denied" element={<AdminDeniedD />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function AppRoutes() {
  const location = useLocation()
  const mobile = isMobilePath(location.pathname)
  const switchFormat = useCounterpartNavigate()
  const { format, setFormat } = useDemo()

  useEffect(() => {
    setFormat(mobile ? 'mobile' : 'desktop')
  }, [mobile, setFormat])

  useEffect(() => {
    const onResize = () => {
      const next: Format = window.innerWidth < 768 ? 'mobile' : 'desktop'
      if (next !== format) switchFormat(next)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [format, switchFormat])

  return (
    <>
      <FormatSync category={useViewportCategory()} />
      {mobile ? (
        <MobileLayout>
          <MobileRoutes />
        </MobileLayout>
      ) : (
        <StageRoot>
          <div className="flex min-h-screen flex-col">
            <DesktopRoutes />
          </div>
        </StageRoot>
      )}
    </>
  )
}

export default function App() {
  return (
    <DemoProvider>
      <HashRouter>
        <PrototypeChrome>
          <AppRoutes />
        </PrototypeChrome>
      </HashRouter>
    </DemoProvider>
  )
}
