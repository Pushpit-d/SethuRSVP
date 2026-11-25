import { neon } from '@neondatabase/serverless'
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function buildReminderText(firstName) {
  const name = (firstName || 'Friend').trim()
  return `Dear ${name},

We're looking forward to celebrating Sethu's 60th birthday with you this Thursday, November 26!

Just a gentle reminder that the festivities will begin at 10:00 AM sharp. We've planned several fun and interesting activities, so please try to arrive on time so you don't miss a moment.

For your reference, here is the event invitation with all the details:

  https://sethu60.hhoma.com/

Dress code: There's no strict dress code. You're welcome to wear traditional South Indian attire, or anything you feel comfortable in. The idea is simply to celebrate together and have a wonderful time.

Thank you, and we can't wait to see you all soon!

Warm regards,
Banu
`
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // Admin auth — simple bearer check (reuses ADMIN_SECRET)
  const expected = process.env.ADMIN_SECRET
  if (!expected) return res.status(500).json({ error: 'Server misconfigured' })
  if (req.headers.authorization !== `Bearer ${expected}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (!resend) {
    return res.status(500).json({ error: 'Email sender not configured' })
  }

  const sql = neon(process.env.DATABASE_URL)
  const { to, dryRun } = req.body || {}

  // Resolve recipients
  let recipients = []
  if (to) {
    // Single target — look up name in DB if present, else derive from email handle
    const rows = await sql`
      SELECT first_name, email FROM rsvps
      WHERE LOWER(email) = LOWER(${to})
      LIMIT 1
    `
    if (rows.length > 0) {
      recipients = [{ first_name: rows[0].first_name, email: rows[0].email }]
    } else {
      const handle = String(to).split('@')[0].split(/[._-]/)[0] || 'Friend'
      const name = handle.charAt(0).toUpperCase() + handle.slice(1).toLowerCase()
      recipients = [{ first_name: name, email: to }]
    }
  } else {
    const rows = await sql`
      SELECT first_name, email FROM rsvps
      WHERE email IS NOT NULL AND email <> ''
      ORDER BY submitted_at ASC
    `
    recipients = rows
  }

  if (dryRun) {
    return res.status(200).json({
      total: recipients.length,
      preview: recipients.slice(0, 5).map((r) => ({
        first_name: r.first_name,
        email: r.email,
      })),
    })
  }

  const fromAddress = process.env.EMAIL_FROM || 'Sethu at 60 <noreply@pandrsol.com>'
  const replyTo = process.env.REPLY_TO || process.env.EMAIL_FROM
  const subject = "Friendly reminder: Sethu's birthday celebration this Thursday at 10 AM"
  const unsubscribeAddr = (process.env.REPLY_TO || 'noreply@pandrsol.com').replace(/^.*<([^>]+)>.*$/, '$1')

  const results = []
  for (const r of recipients) {
    try {
      const result = await resend.emails.send({
        from: fromAddress,
        to: [r.email],
        reply_to: replyTo,
        subject,
        text: buildReminderText(r.first_name),
        headers: {
          'X-Entity-Ref-ID': `reminder-${Date.now()}-${r.email}`,
          'List-Unsubscribe': `<mailto:${unsubscribeAddr}?subject=Unsubscribe>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
      })
      results.push({ email: r.email, status: 'sent', id: result.data?.id || null })
    } catch (err) {
      console.error('Reminder send failed for', r.email, err)
      results.push({ email: r.email, status: 'failed', error: err.message })
    }
    // Throttle so a burst doesn't look suspicious to receiving servers
    await sleep(300)
  }

  const sent = results.filter((r) => r.status === 'sent').length
  const failed = results.filter((r) => r.status === 'failed').length

  return res.status(200).json({
    total: recipients.length,
    sent,
    failed,
    results,
  })
}
