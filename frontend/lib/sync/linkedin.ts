import type { SyncResult } from './runner'

interface LinkedInParsedData {
  experiences?: { company: string; role: string; start_date?: string; end_date?: string }[]
  education?: { school: string; degree?: string; field?: string }[]
  skills?: { name: string }[]
}

export function parseLinkedInCSV(text: string): LinkedInParsedData {
  const result: LinkedInParsedData = {}
  const sections = text.split(/\n\s*\n/)

  for (const section of sections) {
    const lines = section.trim().split('\n')
    const header = lines[0]?.toLowerCase() || ''

    if (header.includes('experience') || header.includes('position')) {
      result.experiences = parseExperienceSection(lines.slice(1))
    } else if (header.includes('education') || header.includes('school')) {
      result.education = parseEducationSection(lines.slice(1))
    } else if (header.includes('skill')) {
      result.skills = parseSkillSection(lines.slice(1))
    }
  }

  return result
}

function parseExperienceSection(lines: string[]): LinkedInParsedData['experiences'] {
  return lines
    .filter(l => l.trim())
    .map(l => {
      const parts = l.split(',').map(s => s.trim())
      return {
        company: parts[0] || '',
        role: parts[1] || '',
        start_date: parts[2] || undefined,
        end_date: parts[3] || undefined,
      }
    })
    .filter(e => e.company || e.role)
}

function parseEducationSection(lines: string[]): LinkedInParsedData['education'] {
  return lines
    .filter(l => l.trim())
    .map(l => {
      const parts = l.split(',').map(s => s.trim())
      return {
        school: parts[0] || '',
        degree: parts[1] || undefined,
        field: parts[2] || undefined,
      }
    })
    .filter(e => e.school)
}

function parseSkillSection(lines: string[]): LinkedInParsedData['skills'] {
  return lines
    .filter(l => l.trim())
    .map(l => ({ name: l.trim() }))
    .filter(s => s.name)
}

export function createLinkedInImportAdapter(
  csvText: string,
  onImport: (data: LinkedInParsedData) => Promise<void>,
) {
  return {
    name: 'linkedin' as const,
    async sync(): Promise<SyncResult> {
      const errors: { source: string; message: string }[] = []
      const data = parseLinkedInCSV(csvText)

      let total = 0
      for (const key of ['experiences', 'education', 'skills'] as const) {
        if (data[key]) total += data[key]?.length || 0
      }

      if (total === 0) {
        return { success: false, items: 0, skipped: 0, errors: [{ source: 'linkedin', message: 'No recognizable data found in CSV' }] }
      }

      try {
        await onImport(data)
        return { success: true, items: total, skipped: 0, errors: [] }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Import failed'
        errors.push({ source: 'linkedin', message: msg })
        return { success: false, items: 0, skipped: total, errors }
      }
    },
  }
}

export type { LinkedInParsedData }
