const CODE_BLOCK = /```(\w*)\n([\s\S]*?)```/g
const HEADING = /^#{1,3}\s+(.+)$/gm
const BOLD = /\*\*(.+?)\*\*/g
const INLINE_CODE = /`(.+?)`/g
const LINK = /\[([^\]]+)\]\(([^)]+)\)/g
const LIST_ITEM = /^[-*]\s+(.+)$/gm
const ORDERED_ITEM = /^\d+\.\s+(.+)$/gm
const BLOCKQUOTE = /^>\s+(.+)$/gm

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function tokenize(text: string): { type: string; content: string; lang?: string }[] {
  const tokens: { type: string; content: string; lang?: string }[] = []

  let lastIndex = 0
  let match: RegExpExecArray | null

  const codeBlocks: { index: number; content: string; lang: string; length: number }[] = []
  const codeRegex = /```(\w*)\n([\s\S]*?)```/g
  while ((match = codeRegex.exec(text)) !== null) {
    codeBlocks.push({
      index: match.index,
      content: match[2],
      lang: match[1] || 'text',
      length: match[0].length,
    })
  }

  let pos = 0
  for (const cb of codeBlocks) {
    if (cb.index > pos) {
      const before = text.slice(pos, cb.index)
      if (before.trim()) tokens.push({ type: 'body', content: before })
    }
    tokens.push({ type: 'code', content: cb.content, lang: cb.lang })
    pos = cb.index + cb.length
  }
  if (pos < text.length) {
    const remaining = text.slice(pos)
    if (remaining.trim()) tokens.push({ type: 'body', content: remaining })
  }

  return tokens
}

function renderInline(text: string): string {
  let html = escapeHtml(text)
  html = html.replace(BOLD, '<strong>$1</strong>')
  html = html.replace(INLINE_CODE, '<code>$1</code>')
  html = html.replace(LINK, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
  return html
}

function renderBodyBlock(text: string): string {
  const lines = text.split('\n')
  const out: string[] = []
  let inList = false
  let inOrderedList = false

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) {
      if (inList) { out.push('</ul>'); inList = false }
      if (inOrderedList) { out.push('</ol>'); inOrderedList = false }
      continue
    }

    const heading = line.match(/^###?\s+(.+)/)
    if (heading) {
      if (inList) { out.push('</ul>'); inList = false }
      if (inOrderedList) { out.push('</ol>'); inOrderedList = false }
      const tag = line.startsWith('### ') ? 'h3' : 'h2'
      out.push(`<${tag}>${renderInline(heading[1])}</${tag}>`)
      continue
    }

    const bq = line.match(/^>\s+(.+)/)
    if (bq) {
      if (inList) { out.push('</ul>'); inList = false }
      if (inOrderedList) { out.push('</ol>'); inOrderedList = false }
      out.push(`<blockquote>${renderInline(bq[1])}</blockquote>`)
      continue
    }

    const li = line.match(/^[-*]\s+(.+)/)
    if (li) {
      if (inOrderedList) { out.push('</ol>'); inOrderedList = false }
      if (!inList) { out.push('<ul>'); inList = true }
      out.push(`<li>${renderInline(li[1])}</li>`)
      continue
    }

    const oi = line.match(/^\d+\.\s+(.+)/)
    if (oi) {
      if (inList) { out.push('</ul>'); inList = false }
      if (!inOrderedList) { out.push('<ol>'); inOrderedList = true }
      out.push(`<li>${renderInline(oi[1])}</li>`)
      continue
    }

    if (inList) { out.push('</ul>'); inList = false }
    if (inOrderedList) { out.push('</ol>'); inOrderedList = false }
    out.push(`<p>${renderInline(line)}</p>`)
  }

  if (inList) out.push('</ul>')
  if (inOrderedList) out.push('</ol>')
  return out.join('\n')
}

export function Markdown({ content, className }: { content: string; className?: string }) {
  const tokens = tokenize(content)

  return (
    <div className={className}>
      {tokens.map((t, i) => {
        if (t.type === 'code') {
          return (
            <pre key={i}>
              <code>{escapeHtml(t.content)}</code>
            </pre>
          )
        }
        return (
          <div key={i} dangerouslySetInnerHTML={{ __html: renderBodyBlock(t.content) }} />
        )
      })}
    </div>
  )
}
