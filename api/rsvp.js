import { neon } from '@neondatabase/serverless'
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

// In-memory rate limit for admin auth failures (per IP).
// Serverless warm invocations share this; cold starts reset — good enough
// to make bulk brute-force impractical.
const adminFailures = new Map()
const FAIL_WINDOW_MS = 15 * 60 * 1000 // 15 min
const MAX_FAILS = 5

function getClientIp(req) {
  const fwd = req.headers['x-forwarded-for']
  if (fwd) return String(fwd).split(',')[0].trim()
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown'
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function checkAdminAuth(req) {
  const now = Date.now()
  const ip = getClientIp(req)
  const rec = adminFailures.get(ip)
  if (rec && rec.until > now) {
    return { ok: false, lockedUntil: rec.until }
  }

  const authHeader = req.headers.authorization
  const expected = process.env.ADMIN_SECRET
  if (!expected) return { ok: false, serverMisconfigured: true }
  if (authHeader === `Bearer ${expected}`) {
    // Reset on success
    adminFailures.delete(ip)
    return { ok: true }
  }

  // Fail: increment and apply increasing delay
  const prev = rec && rec.windowStart > now - FAIL_WINDOW_MS ? rec : { count: 0, windowStart: now }
  const count = prev.count + 1
  const next = { count, windowStart: prev.windowStart }
  if (count >= MAX_FAILS) {
    next.until = now + FAIL_WINDOW_MS
  }
  adminFailures.set(ip, next)

  // Progressive delay: 0.5s, 1s, 2s, 4s... capped at 5s
  const delay = Math.min(5000, 500 * Math.pow(2, Math.max(0, count - 1)))
  await sleep(delay)

  return { ok: false, locked: !!next.until, lockedUntil: next.until }
}

const EVENT = {
  title: "Sethu's 60th Birthday Celebration",
  date: 'Thursday, November 26, 2026',
  time: '10:00 AM',
  venue: 'Jewish Community Center',
  address: 'Omaha, Nebraska',
  calendarStart: '20261126T160000Z',
  calendarEnd: '20261126T190000Z',
}

function buildGuestEmail(firstName, guestCount, mealPreferences) {
  const mealRows = mealPreferences
    .map(
      (m) =>
        `<tr><td style="padding: 6px 0; font-family: -apple-system, 'Segoe UI', sans-serif; font-size: 14px; color: #3D1F1F;">Guest ${m.guest}</td><td style="padding: 6px 0; font-family: -apple-system, 'Segoe UI', sans-serif; font-size: 14px; color: #8B6F5E; text-align: right; text-transform: capitalize;">${m.preference}</td></tr>`
    )
    .join('')

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Your RSVP is confirmed</title>
</head>
<body style="margin: 0; padding: 0; background: #FFF8ED; font-family: -apple-system, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 560px; margin: 0 auto; padding: 32px 16px;">

    <!-- Hero -->
    <div style="background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%); border-radius: 20px 20px 0 0; padding: 44px 32px 36px; text-align: center; position: relative;">
      <div style="width: 68px; height: 68px; border-radius: 50%; background: linear-gradient(135deg, #FBBF24, #F59E0B); margin: 0 auto 20px; display: inline-flex; align-items: center; justify-content: center; line-height: 68px; box-shadow: 0 8px 20px rgba(0,0,0,0.15);">
        <span style="font-family: 'Georgia', serif; color: #7F1D1D; font-size: 26px; font-weight: 700; letter-spacing: -1px; display: inline-block; line-height: 68px;">60</span>
      </div>
      <h1 style="color: #ffffff; font-family: 'Georgia', serif; font-size: 30px; font-weight: 500; margin: 0 0 8px; letter-spacing: -0.5px;">You're all set, ${firstName}!</h1>
      <p style="color: rgba(255,255,255,0.85); font-size: 15px; margin: 0; line-height: 1.5;">Your RSVP has been received. We can't wait to celebrate with you.</p>
    </div>

    <!-- Body -->
    <div style="background: #ffffff; padding: 32px; border-left: 1px solid #F3E6D5; border-right: 1px solid #F3E6D5;">

      <p style="font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #DC2626; margin: 0 0 12px;">Event Details</p>

      <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <tr>
          <td style="padding: 10px 0; font-size: 13px; color: #8B6F5E; width: 80px;">Date</td>
          <td style="padding: 10px 0; font-family: 'Georgia', serif; font-size: 17px; color: #1A0808; font-weight: 500;">${EVENT.date}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; font-size: 13px; color: #8B6F5E; border-top: 1px solid #F3E6D5;">Time</td>
          <td style="padding: 10px 0; font-family: 'Georgia', serif; font-size: 17px; color: #1A0808; font-weight: 500; border-top: 1px solid #F3E6D5;">${EVENT.time}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; font-size: 13px; color: #8B6F5E; border-top: 1px solid #F3E6D5; vertical-align: top;">Venue</td>
          <td style="padding: 10px 0; font-family: 'Georgia', serif; font-size: 17px; color: #1A0808; font-weight: 500; border-top: 1px solid #F3E6D5; line-height: 1.4;">
            ${EVENT.venue}<br>
            <span style="font-family: -apple-system, sans-serif; font-size: 14px; color: #8B6F5E; font-weight: 400;">${EVENT.address}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 10px 0; font-size: 13px; color: #8B6F5E; border-top: 1px solid #F3E6D5;">Guests</td>
          <td style="padding: 10px 0; font-family: 'Georgia', serif; font-size: 17px; color: #1A0808; font-weight: 500; border-top: 1px solid #F3E6D5;">${guestCount}</td>
        </tr>
      </table>

      <div style="background: #FFF8ED; border-radius: 14px; padding: 18px 20px;">
        <p style="font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #8B6F5E; margin: 0 0 10px;">Meal Preferences</p>
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          ${mealRows}
        </table>
      </div>

      <p style="font-size: 14px; color: #5C4A52; line-height: 1.6; margin: 28px 0 0;">
        We'll send any updates to this email address closer to the day. If anything changes, just reply to this email and let us know.
      </p>
    </div>

    <!-- Footer -->
    <div style="background: #FEF2E8; border-radius: 0 0 20px 20px; border: 1px solid #F3E6D5; border-top: none; padding: 24px 32px; text-align: center;">
      <p style="font-family: 'Georgia', serif; font-style: italic; font-size: 15px; color: #991B1B; margin: 0 0 4px;">With love from the family</p>
      <p style="font-size: 12px; color: #8B6F5E; margin: 0; letter-spacing: 0.5px;">Omaha, Nebraska</p>
    </div>

  </div>
</body>
</html>`
}

function buildGuestEmailText(firstName, guestCount, mealPreferences) {
  const mealLines = mealPreferences
    .map((m) => `  Guest ${m.guest}: ${m.preference}`)
    .join('\n')

  return `You're all set, ${firstName}!

Your RSVP for Sethu's 60th Birthday has been received.
We can't wait to celebrate with you.

EVENT DETAILS
  Date:   ${EVENT.date}
  Time:   ${EVENT.time}
  Venue:  ${EVENT.venue}
          ${EVENT.address}
  Guests: ${guestCount}

MEAL PREFERENCES
${mealLines}

We'll send any updates to this email address closer to the day.
If anything changes, just reply to this email and let us know.

With love from the family
Omaha, Nebraska
`
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const sql = neon(process.env.DATABASE_URL)

  if (req.method === 'POST') {
    try {
      const { firstName, lastName, email, phone, guestCount, mealPreferences, website } = req.body

      // Honeypot: if the hidden field is filled, silently drop as a successful "RSVP"
      if (website && website.trim() !== '') {
        return res.status(200).json({ success: true, message: 'RSVP received!' })
      }

      // Trim and validate required fields
      const fn = (firstName || '').trim()
      const ln = (lastName || '').trim()
      const em = (email || '').trim().toLowerCase()
      if (!fn || !ln || !em) {
        return res.status(400).json({ error: 'First name, last name, and email are required.' })
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
        return res.status(400).json({ error: 'Please enter a valid email address.' })
      }

      // Phone validation: optional, but if provided must be +1 followed by 10 digits
      let phoneClean = null
      if (phone && phone.trim() !== '') {
        const digitsOnly = phone.replace(/\D/g, '')
        // Accept either 10 digits (national) or 11 digits starting with 1 (country code)
        const digits = digitsOnly.length === 11 && digitsOnly.startsWith('1')
          ? digitsOnly.slice(1)
          : digitsOnly
        if (digits.length !== 10) {
          return res.status(400).json({ error: 'Phone number must be 10 digits.' })
        }
        phoneClean = `+1${digits}`
      }

      // Guest count sanity
      const guests = Math.max(1, Math.min(10, parseInt(guestCount, 10) || 1))

      await sql`
        INSERT INTO rsvps (first_name, last_name, email, phone, guest_count, meal_preferences, submitted_at)
        VALUES (${fn}, ${ln}, ${em}, ${phoneClean}, ${guests}, ${JSON.stringify(mealPreferences)}, NOW())
      `

      if (resend) {
        const fromAddress = process.env.EMAIL_FROM || 'Sethu at 60 <onboarding@resend.dev>'
        const replyTo = process.env.REPLY_TO || process.env.EMAIL_FROM

        await resend.emails.send({
          from: fromAddress,
          to: [em],
          reply_to: replyTo,
          subject: `${fn}, your RSVP is confirmed`,
          html: buildGuestEmail(fn, guests, mealPreferences),
          text: buildGuestEmailText(fn, guests, mealPreferences),
          headers: {
            'X-Entity-Ref-ID': `rsvp-${Date.now()}`,
          },
        }).catch((err) => {
          console.error('Resend error:', err)
        })
      }

      return res.status(200).json({ success: true, message: 'RSVP received!' })
    } catch (err) {
      if (err.code === '23505') {
        return res.status(409).json({ error: 'This email has already been used to RSVP. If you need to update your response, please contact us.' })
      }
      console.error('Server error:', err)
      return res.status(500).json({ error: 'Something went wrong. Please try again.' })
    }
  }

  if (req.method === 'GET') {
    const auth = await checkAdminAuth(req)
    if (!auth.ok) {
      if (auth.locked || auth.lockedUntil) {
        return res.status(429).json({ error: 'Too many attempts. Try again in a few minutes.' })
      }
      return res.status(401).json({ error: 'Unauthorized' })
    }

    try {
      const data = await sql`SELECT * FROM rsvps ORDER BY submitted_at DESC`

      const totalGuests = data.reduce((sum, r) => sum + r.guest_count, 0)
      const totalVeg = data.reduce((sum, r) => {
        return sum + (r.meal_preferences || []).filter((m) => m.preference === 'vegetarian').length
      }, 0)
      const totalNonVeg = data.reduce((sum, r) => {
        return sum + (r.meal_preferences || []).filter((m) => m.preference === 'non-vegetarian').length
      }, 0)

      return res.status(200).json({
        rsvps: data,
        summary: {
          totalRsvps: data.length,
          totalGuests,
          totalVeg,
          totalNonVeg,
        },
      })
    } catch (err) {
      console.error('Database error:', err)
      return res.status(500).json({ error: 'Failed to fetch RSVPs.' })
    }
  }

  if (req.method === 'DELETE') {
    const auth = await checkAdminAuth(req)
    if (!auth.ok) {
      if (auth.locked || auth.lockedUntil) {
        return res.status(429).json({ error: 'Too many attempts. Try again in a few minutes.' })
      }
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const id = parseInt(req.query.id, 10)
    if (!id || Number.isNaN(id)) {
      return res.status(400).json({ error: 'Missing or invalid id.' })
    }

    try {
      const result = await sql`DELETE FROM rsvps WHERE id = ${id} RETURNING id`
      if (result.length === 0) {
        return res.status(404).json({ error: 'RSVP not found.' })
      }
      return res.status(200).json({ success: true, id })
    } catch (err) {
      console.error('Delete error:', err)
      return res.status(500).json({ error: 'Failed to delete RSVP.' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
