import { useState } from 'react'
import './RSVP.css'

const EVENT = {
  title: "Sethu's 60th Birthday Celebration",
  date: 'Thursday, November 26, 2026',
  time: '10:00 AM',
  venue: 'Jewish Community Center, Omaha, Nebraska',
  start: '20261126T160000Z',
  end: '20261126T190000Z',
  description: 'Join us to celebrate Sethu turning 60!',
}

function getGoogleCalUrl() {
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(EVENT.title)}&dates=${EVENT.start}/${EVENT.end}&location=${encodeURIComponent(EVENT.venue)}&details=${encodeURIComponent(EVENT.description)}`
}

function getIcsContent() {
  return `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${EVENT.start}
DTEND:${EVENT.end}
SUMMARY:${EVENT.title}
LOCATION:${EVENT.venue}
DESCRIPTION:${EVENT.description}
END:VEVENT
END:VCALENDAR`
}

function downloadIcs() {
  const blob = new Blob([getIcsContent()], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'sethu-60th-birthday.ics'
  a.click()
  URL.revokeObjectURL(url)
}

function getOutlookUrl() {
  return `https://outlook.live.com/calendar/0/action/compose?subject=${encodeURIComponent(EVENT.title)}&startdt=2026-11-26T10:00:00&enddt=2026-11-26T13:00:00&location=${encodeURIComponent(EVENT.venue)}&body=${encodeURIComponent(EVENT.description)}`
}

export default function RSVP() {
  const [guestCount, setGuestCount] = useState(1)
  const [mealPrefs, setMealPrefs] = useState({ 0: 'vegetarian' })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function handleGuestChange(e) {
    const count = parseInt(e.target.value, 10)
    setGuestCount(count)
    setMealPrefs((prev) => {
      const next = {}
      for (let i = 0; i < count; i++) {
        next[i] = prev[i] || 'vegetarian'
      }
      return next
    })
  }

  function handleMealPref(index, pref) {
    setMealPrefs((prev) => ({ ...prev, [index]: pref }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    const formData = new FormData(e.target)
    const mealPreferences = Array.from({ length: guestCount }, (_, i) => ({
      guest: i + 1,
      preference: mealPrefs[i],
    }))

    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.get('firstName'),
          lastName: formData.get('lastName'),
          email: formData.get('email'),
          phone: formData.get('phone'),
          guestCount,
          mealPreferences,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
        setSubmitting(false)
        return
      }

      setSubmitted(true)
    } catch (err) {
      setError('Unable to connect. Please check your internet and try again.')
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <main className="rsvp-page">
        <section className="rsvp-success">
          <div className="success-icon">&#10003;</div>
          <h1>Thank you!</h1>
          <p className="success-message">
            Your RSVP has been received. A confirmation email is on its way.
            We look forward to celebrating with you on November 26, 2026.
          </p>

          <div className="calendar-buttons">
            <p className="calendar-label">Add to your calendar</p>
            <div className="calendar-links">
              <a href={getGoogleCalUrl()} target="_blank" rel="noopener noreferrer" className="cal-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Google Calendar
              </a>
              <button type="button" onClick={downloadIcs} className="cal-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 17V3"/><path d="m6 11 6 6 6-6"/><path d="M19 21H5"/></svg>
                Apple Calendar
              </button>
              <a href={getOutlookUrl()} target="_blank" rel="noopener noreferrer" className="cal-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Outlook
              </a>
            </div>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="rsvp-page">
      <section className="rsvp-hero">
        <p className="rsvp-eyebrow">RSVP</p>
        <h1>Will you join us?</h1>
        <p className="rsvp-subtitle">Thursday, November 26, 2026 &middot; 10:00 AM &middot; Jewish Community Center, Omaha</p>
      </section>

      <section className="rsvp-form-section">
        <form className="rsvp-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input type="text" id="firstName" name="firstName" required />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input type="text" id="lastName" name="lastName" required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input type="email" id="email" name="email" required />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input type="tel" id="phone" name="phone" placeholder="(402) 555-0123" />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="guests">Number of Guests (including yourself)</label>
            <select id="guests" name="guests" value={guestCount} onChange={handleGuestChange}>
              {Array.from({ length: 10 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}{i === 0 ? ' (just me)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="meal-section">
            <label className="meal-heading">Meal preference for each guest</label>
            {Array.from({ length: guestCount }, (_, i) => (
              <div key={i} className="meal-guest">
                <span className="meal-guest-label">
                  Guest {i + 1} {i === 0 ? '(you)' : ''}
                </span>
                <div className="meal-toggle">
                  <button
                    type="button"
                    className={`toggle-btn ${mealPrefs[i] === 'vegetarian' ? 'active' : ''}`}
                    onClick={() => handleMealPref(i, 'vegetarian')}
                  >
                    Vegetarian
                  </button>
                  <button
                    type="button"
                    className={`toggle-btn ${mealPrefs[i] === 'non-vegetarian' ? 'active' : ''}`}
                    onClick={() => handleMealPref(i, 'non-vegetarian')}
                  >
                    Non-Vegetarian
                  </button>
                </div>
              </div>
            ))}
          </div>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? 'Sending...' : 'Send My RSVP'}
          </button>
        </form>
      </section>
    </main>
  )
}
