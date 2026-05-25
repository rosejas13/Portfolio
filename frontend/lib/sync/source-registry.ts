import type { SyncSource, SyncSourceConfig } from './types'

const REGISTRY: Record<SyncSource, SyncSourceConfig> = {
  github: {
    name: 'github',
    label: 'GitHub',
    enabled: true,
    config: {
      repo: process.env.NEXT_PUBLIC_GITHUB_REPO || '',
      token: !!process.env.GITHUB_TOKEN,
    },
  },
  linkedin: {
    name: 'linkedin',
    label: 'LinkedIn',
    enabled: true,
  },
  resume_upload: {
    name: 'resume_upload',
    label: 'Resume Upload',
    enabled: true,
  },
}

export function getSource(name: SyncSource): SyncSourceConfig | undefined {
  return REGISTRY[name]
}

export function enabledSources(): SyncSourceConfig[] {
  return Object.values(REGISTRY).filter(s => s.enabled)
}
