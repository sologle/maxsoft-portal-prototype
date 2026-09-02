export type Role = 'admin' | 'engineer' | 'manager' | 'client-admin' | 'client-user' | 'guest'

export type Format = 'desktop' | 'mobile'

export interface RoleInfo {
  id: Role
  name: string
  short: string
  description: string
  staff: boolean
  sections: string[]
}

export interface CompanyType {
  id: string
  name: string
  description: string
  companiesCount: number
  articlesCount: number
}

export interface Company {
  id: string
  fullName: string
  shortName: string
  inn: string
  kpp: string
  address: string
  email: string
  phone: string
  typeId: string
  status: 'Активна' | 'Приостановлена' | 'Истекает'
  statusUntil: string
  contract: string
  contractDate: string
  project: string
  bitrix: string
  domains: string[]
  usersCount: number
}

export interface PortalUser {
  id: string
  name: string
  email: string
  role: Exclude<Role, 'guest'>
  companyId: string | null
  companyRole?: 'admin' | 'member'
  status: 'Активен' | 'Приглашён' | 'Заблокирован'
  blockedAt?: string
  lastActive: string
}

export interface TagGroup {
  id: string
  name: string
}

export interface Tag {
  id: string
  name: string
  groupId: string
  articlesCount: number
}

export interface KbNode {
  id: string
  name: string
  parentId: string | null
}

export interface Attachment {
  id: string
  name: string
  ext: 'pdf' | 'docx' | 'dwg' | 'zip' | 'xlsx' | 'csv' | 'mp4'
  size: string
}

export interface Article {
  id: string
  slug: string
  title: string
  summary: string
  nodeId: string
  status: 'published' | 'draft'
  author: string
  authorShort: string
  updatedAt: string
  minutes: number
  tagIds: string[]
  typeIds: string[]
  attachments: Attachment[]
  body: string
  video?: {
    poster: string
    duration: string
    timecodes: { time: string; seconds: number; label: string }[]
  }
}

export interface AuditEntry {
  id: string
  date: string
  time: string
  user: string
  action: string
  target: string
  kind: 'article' | 'company' | 'user' | 'access' | 'file'
}

export interface CompanyFieldSetting {
  id: string
  name: string
  show: boolean
  required: boolean
  unique: boolean
  managerAccess: boolean
  onRegister: boolean
  onCreate: boolean
  onEdit: boolean
}

export interface KnowledgeFile {
  id: string
  name: string
  ext: Attachment['ext']
  size: string
  uploadedAt: string
  uploadedBy: string
  usageArticleIds: string[]
}
