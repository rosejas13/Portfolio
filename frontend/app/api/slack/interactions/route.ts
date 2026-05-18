import { verifySlackRequest } from '@/lib/slack-verify'

export async function POST(request: Request) {
  const SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET || ''

  const rawBody = await request.text()
  if (SIGNING_SECRET && !verifySlackRequest(rawBody, request.headers, SIGNING_SECRET)) {
    return Response.json({ text: 'Unauthorized' }, { status: 401 })
  }

  const API_URL = (process.env.API_URL || 'http://localhost:3001').replace(/\/$/, '')
  const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  let payload: { actions?: Array<{ value: string }>; user: { id: string; name: string }; response_url: string; message?: { ts: string; channel: string } }
  try {
    const form = Object.fromEntries(new URLSearchParams(rawBody))
    payload = JSON.parse(form.payload)
  } catch {
    return Response.json({ text: 'Invalid payload' }, { status: 400 })
  }

  const action = payload.actions?.[0]
  if (!action) return Response.json({ text: 'No action' }, { status: 400 })

  const [actionType, idStr] = action.value.split('_')
  const leadId = parseInt(idStr)
  if (isNaN(leadId)) return Response.json({ text: 'Invalid lead ID' }, { status: 400 })

  const headers: Record<string, string> = { 'Content-Type': 'application/json', Prefer: 'return=minimal' }
  if (ANON_KEY) {
    headers['apikey'] = ANON_KEY
    headers['Authorization'] = `Bearer ${ANON_KEY}`
  }

  const labels: Record<string, string> = { read: 'marked as read', replied: 'marked as replied', delete: 'deleted' }
  const label = labels[actionType] || 'updated'

  try {
    if (actionType === 'delete') {
      await fetch(`${API_URL}/rpc/delete_lead_by_id`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ lead_id: leadId }),
      })
    } else {
      await fetch(`${API_URL}/rpc/update_lead_status`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ lead_id: leadId, new_status: actionType }),
      })
    }

    return Response.json({ text: `Lead #${leadId} ${label}.` })
  } catch {
    return Response.json({ text: `Failed to ${label} lead. Try again.` })
  }
}
