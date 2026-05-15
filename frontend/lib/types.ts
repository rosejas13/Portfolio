export type Project = {
  id: number
  title: string
  slug: string
  tagline: string | null
  description: string | null
  tech_stack: string[] | null
  image_url: string | null
  live_url: string | null
  repo_url: string | null
  start_date: string | null
  end_date: string | null
  status: string
  sort_order: number
  created_at: string
  updated_at: string
}

export type Skill = {
  id: number
  name: string
  category: string | null
  icon_url: string | null
  sort_order: number
}

export type Post = {
  id: number
  title: string
  slug: string
  content: string | null
  excerpt: string | null
  tags: string[] | null
  status: string
  published_at: string | null
  created_at: string
  updated_at: string
}

export type Lead = {
  id: number
  name: string
  email: string | null
  message: string | null
  source: string
  status: string
  notes: string | null
  created_at: string
}

export type SiteConfig = {
  key: string
  value: unknown
}

export type Role = {
  id: number
  name: string
  description: string | null
}

export type Resource = {
  id: number
  name: string
  description: string | null
}

export type Permission = {
  id: number
  role_id: number
  resource_id: number
  action_id: number
}

export type Experience = {
  id: number
  company: string
  role: string
  location: string | null
  start_date: string
  end_date: string | null
  current: boolean
  description: string | null
  highlights: string[] | null
  sort_order: number
  created_at: string
  updated_at: string
}

export type Education = {
  id: number
  school: string
  degree: string | null
  field: string | null
  start_date: string | null
  end_date: string | null
  description: string | null
  sort_order: number
  created_at: string
  updated_at: string
}
