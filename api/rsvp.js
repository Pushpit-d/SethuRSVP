import { neon } from '@neondatabase/serverless'
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

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
  const mealSummary = mealPreferences
    .map((m) => `Guest ${m.guest}: ${m.preference}`)
    .join('<br>')

  const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(EVENT.title)}&dates=${EVENT.calendarStart}/${EVENT.calendarEnd}&location=${encodeURIComponent(EVENT.venue + ', ' + EVENT.address)}&details=${encodeURIComponent('Join us to celebrate Sethu turning 60!')}`

  return `
    <div style="font-family: 'Georgia', serif; max-width: 560px; margin: 0 auto; color: #2D1F1F;">
      <div style="text-align: center; padding: 40px 24px 32px; background: #6B1D2A; border-radius: 16px 16px 0 0;">
        <div style="width: 56px; height: 56px; border-radius: 50%; background: rgba(255,255,255,0.15); margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
          <span style="color: #fff; font-size: 20px; font-weight: 700;">60</span>
        </div>
        <h1 style="color: #fff; font-size: 24px; margin: 0 0 4px; font-weight: 600;">You're confirmed!</h1>
        <p style="color: rgba(255,255,255,0.7); font-size: 14px; margin: 0;">Thank you for your RSVP, ${firstName}.</p>
      </div>
      <div style="padding: 32px 24px; background: #FDF8F4; border: 1px solid rgba(107,29,42,0.12); border-top: none;">
        <h2 style="font-size: 18px; color: #6B1D2A; margin: 0 0 20px;">Event Details</h2>
        <table style="width: 100%; font-family: -apple-system, sans-serif; font-size: 14px; color: #2D1F1F;">
          <tr><td style="padding: 8px 0; color: #9A8F8F; width: 90px;">Date</td><td style="padding: 8px 0; font-weight: 500;">${EVENT.date}</td></tr>
          <tr><td style="padding: 8px 0; color: #9A8F8F;">Time</td><td style="padding: 8px 0; font-weight: 500;">${EVENT.time}</td></tr>
          <tr><td style="padding: 8px 0; color: #9A8F8F;">Venue</td><td style="padding: 8px 0; font-weight: 500;">${EVENT.venue}<br><span style="font-weight: 400; color: #6B5E5E;">${EVENT.address}</span></td></tr>
          <tr><td style="padding: 8px 0; color: #9A8F8F;">Guests</td><td style="padding: 8px 0; font-weight: 500;">${guestCount}</td></tr>
        </table>
        <div style="margin-top: 16px; padding: 16px; background: #fff; border-radius: 12px; border: 1px solid rgba(107,29,42,0.08);">
          <p style="font-family: -apple-system, sans-serif; font-size: 12px; color: #9A8F8F; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">Meal Preferences</p>
          <p style="font-family: -apple-system, sans-serif; font-size: 14px; margin: 0; line-height: 1.8;">${mealSummary}</p>
        </div>
        <div style="text-align: center; margin-top: 28px;">
          <a href="${googleCalUrl}" target="_blank" style="display: inline-block; background: #6B1D2A; color: #fff; padding: 14px 28px; border-radius: 100px; font-family: -apple-system, sans-serif; font-size: 14px; font-weight: 600; text-decoration: none;">Add to Google Calendar</a>
        </div>
      </div>
      <div style="text-align: center; padding: 20px; font-family: -apple-system, sans-serif; font-size: 12px; color: #9A8F8F; border-radius: 0 0 16px 16px; background: #F5EDE5;">
        With love from the family &middot; Omaha, Nebraska
      </div>
    </div>
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
      const { firstName, lastName, email, phone, guestCount, mealPreferences } = req.body

      if (!firstName || !lastName || !email) {
        return res.status(400).json({ error: 'First name, last name, and email are required.' })
      }

      await sql`
        INSERT INTO rsvps (first_name, last_name, email, phone, guest_count, meal_preferences, submitted_at)
        VALUES (${firstName}, ${lastName}, ${email}, ${phone || null}, ${guestCount}, ${JSON.stringify(mealPreferences)}, NOW())
      `

      if (resend) {
        const fromAddress = process.env.EMAIL_FROM || 'Sethu at 60 <onboarding@resend.dev>'

        await resend.emails.send({
          from: fromAddress,
          to: [email],
          subject: "You're confirmed! Sethu's 60th Birthday - Nov 26, 2026",
          html: buildGuestEmail(firstName, guestCount, mealPreferences),
        }).catch(() => {})
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
    const authHeader = req.headers.authorization
    if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
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

  return res.status(405).json({ error: 'Method not allowed' })
}
