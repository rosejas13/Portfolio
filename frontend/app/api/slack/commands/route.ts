import { verifySlackRequest } from '@/lib/slack-verify'

export async function POST(request: Request) {
  const SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET || ''

  // Verify request from Slack
  const rawBody = await request.text()
  if (SIGNING_SECRET && !verifySlackRequest(rawBody, request.headers, SIGNING_SECRET)) {
    return Response.json({ text: 'Unauthorized' }, { status: 401 })
  }

  const API_URL = (process.env.API_URL || 'http://localhost:3001').replace(/\/$/, '')
  const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Parse Slack slash command payload (application/x-www-form-urlencoded)
  let body: Record<string, string>
  try {
    body = Object.fromEntries(new URLSearchParams(rawBody))
  } catch {
    return Response.json({ text: 'Invalid request' }, { status: 400 })
  }

  const { command, text: rawText } = body

  if (command !== '/leads') {
    return Response.json({ text: 'Unknown command' }, { status: 400 })
  }

  // Parse arguments: /leads [status] [limit]
  const args = rawText?.trim().split(/\s+/) || []
  const statusFilter = args[0] || null
  const count = Math.min(parseInt(args[1]) || 5, 10)

  // Query leads
  try {
    const rpcUrl = `${API_URL}/rpc/list_leads`
    const params = new URLSearchParams()
    if (statusFilter) params.set('status_filter', statusFilter)
    params.set('result_limit', String(count))

    const headers: Record<string, string> = {
      Prefer: 'return=representation',
    }
    if (ANON_KEY) {
      headers['apikey'] = ANON_KEY
      headers['Authorization'] = `Bearer ${ANON_KEY}`
    }

    const res = await fetch(`${rpcUrl}?${params}`, { headers })
    const leads = await res.json() as Array<{
      id: number
      name: string
      email: string
      message: string
      status: string
      created_at: string
    }>

    if (!leads.length) {
      return Response.json({
        response_type: 'ephemeral',
        text: statusFilter
          ? `No leads with status "${statusFilter}".`
          : 'No leads yet.',
      })
    }

    const blocks = leads.map((lead) => {
      const date = new Date(lead.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
      const statusEmoji = lead.status === 'new' ? '🆕' : lead.status === 'read' ? '👁' : lead.status === 'replied' ? '✅' : '📦'

      return {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${lead.name}* <${lead.email}|${statusEmoji} ${lead.status}>\n_${lead.message.slice(0, 200)}${lead.message.length > 200 ? '...' : ''}_\n${date} · ID ${lead.id}`,
        },
        accessory: {
          type: 'overflow',
          options: [
            { text: { type: 'plain_text', text: 'Mark Read' }, value: `read_${lead.id}` },
            { text: { type: 'plain_text', text: 'Mark Replied' }, value: `replied_${lead.id}` },
            { text: { type: 'plain_text', text: 'Delete' }, value: `delete_${lead.id}` },
          ],
        },
      }
    })

    return Response.json({
      response_type: 'ephemeral',
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: statusFilter ? `Leads — ${statusFilter} (${leads.length})` : `Recent Leads (${leads.length})` },
        },
        ...blocks,
        {
          type: 'context',
          elements: [{ type: 'mrkdwn', text: 'Use the ••• menu on each lead to update or delete.' }],
        },
      ],
    })
  } catch {
    return Response.json({
      response_type: 'ephemeral',
      text: 'Failed to fetch leads. Please try again.',
    })
  }
}
