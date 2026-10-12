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

function buildGuestEmail(firstName, guestCount, mealPreferences, siteUrl = 'https://sethu60.vercel.app') {
  const mealRows = mealPreferences
    .map(
      (m) =>
        `<tr>
           <td style="padding:8px 0;font-family:-apple-system,'Segoe UI',Roboto,sans-serif;font-size:14px;color:#1A0F2E;">Guest ${m.guest}</td>
           <td style="padding:8px 0;font-family:-apple-system,'Segoe UI',Roboto,sans-serif;font-size:14px;color:#4C1D95;text-align:right;text-transform:capitalize;font-weight:600;">${m.preference}</td>
         </tr>`
    )
    .join('')

  // Build with explicit color-scheme + bgcolor attributes so it survives both
  // light and dark modes across Gmail, Apple Mail, Outlook. Use solid colors
  // (not gradients) in critical zones so clients that drop CSS backgrounds
  // still render the brand.
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Your RSVP is confirmed</title>
  <style>
    /* Hard-pin colors so dark-mode auto-inversion doesn't eat the hero. */
    :root { color-scheme: light dark; supported-color-schemes: light dark; }
    body, table, td, p, h1, span, div { -webkit-font-smoothing: antialiased; }
    .hero-bg { background-color: #4C1D95 !important; }
    .hero-title { color: #FFFFFF !important; }
    .hero-sub { color: #E9D5FF !important; }
    .card-bg { background-color: #FFFFFF !important; }
    .ink { color: #1A0F2E !important; }
    .muted { color: #6B5B7A !important; }
    .accent { color: #9333EA !important; }
    .footer-bg { background-color: #F5F0FF !important; }
    .footer-title { color: #6B21A8 !important; }
    .meal-card { background-color: #F5F0FF !important; }
    .divider { border-top: 1px solid #E9D5FF !important; }
    /* Mobile */
    @media only screen and (max-width: 480px) {
      .wrapper { padding: 16px 10px !important; }
      .hero-bg { padding: 32px 20px !important; border-radius: 16px 16px 0 0 !important; }
      .card-bg { padding: 24px 20px !important; }
      .footer-bg { padding: 20px 20px !important; border-radius: 0 0 16px 16px !important; }
      .hero-title { font-size: 24px !important; }
      .detail-value { font-size: 15px !important; }
      .detail-label { width: auto !important; }
      .hero-logo { width: 96px !important; max-width: 96px !important; }
    }
    /* True dark mode (where supported): slightly tweak the body wash so the
       card doesn't look flat against pure black. The hero stays dark purple
       which already works in both modes. */
    @media (prefers-color-scheme: dark) {
      body { background-color: #0F0A1F !important; }
      .wash { background-color: #0F0A1F !important; }
    }
  </style>
</head>
<body class="wash" style="margin:0;padding:0;background-color:#F5F0FF;font-family:-apple-system,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="wash" bgcolor="#F5F0FF" style="background-color:#F5F0FF;">
    <tr>
      <td align="center" class="wrapper" style="padding:28px 16px;">

        <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;">

          <!-- Hero (solid deep purple that survives dark mode) -->
          <tr>
            <td class="hero-bg" bgcolor="#4C1D95" align="center" style="background-color:#4C1D95;padding:40px 32px 36px;border-radius:20px 20px 0 0;">
              <img src="${siteUrl}/logo-mark.png" alt="Sethu turns 60" width="120" height="120" class="hero-logo" style="display:block;margin:0 auto 16px;width:120px;height:auto;max-width:120px;border:0;outline:none;" />
              <h1 class="hero-title" style="color:#FFFFFF;font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:500;margin:0 0 10px;letter-spacing:-0.4px;line-height:1.2;">You're all set, ${firstName}!</h1>
              <p class="hero-sub" style="color:#E9D5FF;font-size:15px;margin:0;line-height:1.5;font-family:-apple-system,'Segoe UI',Roboto,sans-serif;">Your RSVP has been received. We can't wait to celebrate with you.</p>
            </td>
          </tr>

          <!-- Body card -->
          <tr>
            <td class="card-bg" bgcolor="#FFFFFF" style="background-color:#FFFFFF;padding:28px 32px;">

              <p class="accent" style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#9333EA;margin:0 0 14px;">Event Details</p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:24px;">
                <tr>
                  <td class="muted detail-label" style="padding:10px 0;font-size:13px;color:#6B5B7A;width:80px;vertical-align:top;">Date</td>
                  <td class="ink detail-value" style="padding:10px 0;font-family:Georgia,serif;font-size:17px;color:#1A0F2E;font-weight:500;">${EVENT.date}</td>
                </tr>
                <tr>
                  <td class="muted divider detail-label" style="padding:10px 0;font-size:13px;color:#6B5B7A;border-top:1px solid #E9D5FF;vertical-align:top;">Time</td>
                  <td class="ink divider detail-value" style="padding:10px 0;font-family:Georgia,serif;font-size:17px;color:#1A0F2E;font-weight:500;border-top:1px solid #E9D5FF;">${EVENT.time}</td>
                </tr>
                <tr>
                  <td class="muted divider detail-label" style="padding:10px 0;font-size:13px;color:#6B5B7A;border-top:1px solid #E9D5FF;vertical-align:top;">Venue</td>
                  <td class="ink divider detail-value" style="padding:10px 0;font-family:Georgia,serif;font-size:17px;color:#1A0F2E;font-weight:500;border-top:1px solid #E9D5FF;line-height:1.4;">
                    ${EVENT.venue}<br>
                    <span class="muted" style="font-family:-apple-system,sans-serif;font-size:14px;color:#6B5B7A;font-weight:400;">${EVENT.address}</span>
                  </td>
                </tr>
                <tr>
                  <td class="muted divider detail-label" style="padding:10px 0;font-size:13px;color:#6B5B7A;border-top:1px solid #E9D5FF;vertical-align:top;">Guests</td>
                  <td class="ink divider detail-value" style="padding:10px 0;font-family:Georgia,serif;font-size:17px;color:#1A0F2E;font-weight:500;border-top:1px solid #E9D5FF;">${guestCount}</td>
                </tr>
              </table>

              <!-- Meals -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="meal-card" bgcolor="#F5F0FF" style="background-color:#F5F0FF;border-radius:14px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p class="muted" style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#6B5B7A;margin:0 0 10px;">Meal Preferences</p>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                      ${mealRows}
                    </table>
                  </td>
                </tr>
              </table>

              <p class="muted" style="font-size:14px;color:#6B5B7A;line-height:1.6;margin:24px 0 0;">
                We'll send any updates to this email address closer to the day. If anything changes, just reply to this email and let us know.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="footer-bg" bgcolor="#F5F0FF" align="center" style="background-color:#F5F0FF;padding:22px 32px;border-radius:0 0 20px 20px;">
              <p class="footer-title" style="font-family:Georgia,serif;font-style:italic;font-size:15px;color:#6B21A8;margin:0 0 4px;">With love from the family</p>
              <p class="muted" style="font-size:12px;color:#6B5B7A;margin:0;letter-spacing:0.5px;">Omaha, Nebraska</p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
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
      const { firstName, lastName, email, phone, guestCount, mealPreferences, message, website } = req.body

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

      // Personal message (optional, capped at 240 chars)
      const msg = typeof message === 'string' && message.trim()
        ? message.trim().slice(0, 240)
        : null

      await sql`
        INSERT INTO rsvps (first_name, last_name, email, phone, guest_count, meal_preferences, message, submitted_at)
        VALUES (${fn}, ${ln}, ${em}, ${phoneClean}, ${guests}, ${JSON.stringify(mealPreferences)}, ${msg}, NOW())
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
