import { useState, useEffect, useRef } from 'react'
import './MainPage.css'

const EVENT = {
  title: "Sethu's 60th Birthday Celebration",
  date: 'Thursday, November 26, 2026',
  time: '10:00 AM',
  venue: 'Jewish Community Center, Omaha, Nebraska',
  start: '20261126T160000Z',
  end: '20261126T190000Z',
  description: 'Join us to celebrate Sethu turning 60!',
  targetDate: new Date('2026-11-26T10:00:00-06:00'),
}

function getGoogleCalUrl() {
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(EVENT.title)}&dates=${EVENT.start}/${EVENT.end}&location=${encodeURIComponent(EVENT.venue)}&details=${encodeURIComponent(EVENT.description)}`
}

function getIcsContent() {
  return `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:${EVENT.start}\nDTEND:${EVENT.end}\nSUMMARY:${EVENT.title}\nLOCATION:${EVENT.venue}\nDESCRIPTION:${EVENT.description}\nEND:VEVENT\nEND:VCALENDAR`
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

const chapters = [
  { year: '1966', text: 'Born on November 20' },
  { year: '1989', text: 'Moved to the United States for his master\'s' },
  { year: '1990s', text: 'Settled in Nebraska and made it home' },
  { year: '1997', text: 'Married in December' },
  { year: '2026', text: 'Turning sixty this November', highlight: true },
]

const details = [
  { label: 'Date', value: 'Nov 26, 2026', sub: 'Thursday', icon: 'calendar' },
  { label: 'Time', value: '10:00 AM', sub: 'Lunch at 12:30', icon: 'clock' },
  { label: 'Venue', value: 'Jewish Community Center', sub: 'Omaha, Nebraska', icon: 'map', link: true },
  { label: 'Dress', value: 'Festive', sub: 'Wear what makes you happy', icon: 'sparkle' },
]

function useReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); obs.unobserve(el) } },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return ref
}

function Reveal({ children, className = '', delay = 0 }) {
  const ref = useReveal()
  return (
    <div ref={ref} className={`reveal ${className}`} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </div>
  )
}

function useCountdown(target) {
  const calc = () => {
    const diff = Math.max(0, target.getTime() - Date.now())
    const days = Math.floor(diff / 86400000)
    const hours = Math.floor((diff % 86400000) / 3600000)
    const minutes = Math.floor((diff % 3600000) / 60000)
    return { days, hours, minutes }
  }
  const [time, setTime] = useState(calc)
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 60000)
    return () => clearInterval(id)
  }, [])
  return time
}

const iconPaths = {
  calendar: <><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>,
  clock: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
  map: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></>,
  sparkle: <><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" /></>,
}

export default function MainPage() {
  const countdown = useCountdown(EVENT.targetDate)
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
      for (let i = 0; i < count; i++) next[i] = prev[i] || 'vegetarian'
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
    } catch {
      setError('Unable to connect. Please check your internet and try again.')
      setSubmitting(false)
    }
  }

  return (
    <main>
      {/* ─── HERO ─── */}
      <section id="hero" className="hero">
        <div className="hero-mesh" />
        <div className="hero-blob hero-blob-1" />
        <div className="hero-blob hero-blob-2" />
        <div className="hero-blob hero-blob-3" />

        <div className="hero-content">
          <div className="hero-badge">
            <span className="pulse-dot" />
            Save the Date
          </div>

          <h1 className="hero-title">
            <span className="title-line">Sethu</span>
            <span className="title-sixty">
              <span className="sixty-text">turns</span>
              <span className="sixty-big">60</span>
            </span>
          </h1>

          <p className="hero-sub">
            Thursday, November 26, 2026 &middot; Omaha, Nebraska
          </p>

          <div className="countdown">
            <div className="count-item">
              <span className="count-num">{countdown.days}</span>
              <span className="count-label">days</span>
            </div>
            <div className="count-divider" />
            <div className="count-item">
              <span className="count-num">{countdown.hours}</span>
              <span className="count-label">hrs</span>
            </div>
            <div className="count-divider" />
            <div className="count-item">
              <span className="count-num">{countdown.minutes}</span>
              <span className="count-label">min</span>
            </div>
          </div>

          <div className="hero-actions">
            <button className="btn-primary" onClick={() => document.getElementById('rsvp').scrollIntoView({ behavior: 'smooth' })}>
              <span>RSVP Now</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
            <button className="btn-ghost" onClick={() => document.getElementById('details').scrollIntoView({ behavior: 'smooth' })}>
              Event details
            </button>
          </div>
        </div>

        <div className="scroll-hint">
          <span>Scroll</span>
          <svg width="12" height="20" viewBox="0 0 12 20" fill="none">
            <path d="M6 1v16m0 0l5-5m-5 5l-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      </section>

      {/* ─── ABOUT / JOURNEY ─── */}
      <section id="about" className="section about">
        <Reveal>
          <div className="section-head">
            <span className="section-tag">The Journey</span>
            <h2 className="section-title">
              <em>Six</em> remarkable<br />decades
            </h2>
            <p className="section-sub">
              Family, friendship, Nebraska, and a life well built.
            </p>
          </div>
        </Reveal>

        <div className="chapters">
          {chapters.map((c, i) => (
            <Reveal key={i} delay={i * 80}>
              <div className={`chapter ${c.highlight ? 'chapter-hl' : ''}`}>
                <div className="chapter-year">{c.year}</div>
                <div className="chapter-connector">
                  <span className="chapter-dot" />
                </div>
                <div className="chapter-text">{c.text}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─── DETAILS ─── */}
      <section id="details" className="section details">
        <Reveal>
          <div className="section-head">
            <span className="section-tag">Join Us</span>
            <h2 className="section-title">
              A morning of<br /><em>celebration</em>
            </h2>
            <p className="section-sub">
              Here is what you need to know for the day.
            </p>
          </div>
        </Reveal>

        <div className="detail-grid">
          {details.map((d, i) => (
            <Reveal key={d.label} delay={i * 70}>
              <div className={`detail-card ${d.icon === 'calendar' ? 'card-garnet' : ''}`}>
                <div className="detail-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    {iconPaths[d.icon]}
                  </svg>
                </div>
                <div className="detail-body">
                  <p className="detail-label">{d.label}</p>
                  <p className="detail-value">{d.value}</p>
                  <p className="detail-sub">{d.sub}</p>
                </div>
                {d.link && (
                  <a
                    href="https://maps.google.com/?q=Jewish+Community+Center+Omaha+Nebraska"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="detail-link"
                  >
                    Open in Maps
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                    </svg>
                  </a>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─── RSVP ─── */}
      <section id="rsvp" className="section rsvp">
        {submitted ? (
          <div className="success">
            <div className="success-sparkle">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l1.76 6.24L20 10l-6.24 1.76L12 18l-1.76-6.24L4 10l6.24-1.76L12 2z" />
              </svg>
            </div>
            <h2 className="success-title">You're in!</h2>
            <p className="success-body">
              Your RSVP has landed. A confirmation email is on its way.
              We cannot wait to celebrate with you.
            </p>
            <div className="calendar-row">
              <p className="calendar-label">Add to your calendar</p>
              <div className="cal-btns">
                <a href={getGoogleCalUrl()} target="_blank" rel="noopener noreferrer" className="cal-btn">Google</a>
                <button type="button" onClick={downloadIcs} className="cal-btn">Apple</button>
                <a href={getOutlookUrl()} target="_blank" rel="noopener noreferrer" className="cal-btn">Outlook</a>
              </div>
            </div>
          </div>
        ) : (
          <>
            <Reveal>
              <div className="section-head">
                <span className="section-tag">RSVP</span>
                <h2 className="section-title">
                  Will you<br /><em>be there?</em>
                </h2>
                <p className="section-sub">
                  Let us know by filling in a few details below.
                </p>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <form className="rsvp-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="field">
                    <label htmlFor="firstName">First name</label>
                    <input type="text" id="firstName" name="firstName" required placeholder="Jane" />
                  </div>
                  <div className="field">
                    <label htmlFor="lastName">Last name</label>
                    <input type="text" id="lastName" name="lastName" required placeholder="Doe" />
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="email">Email</label>
                  <input type="email" id="email" name="email" required placeholder="you@example.com" />
                </div>

                <div className="field">
                  <label htmlFor="phone">Phone <span className="opt">optional</span></label>
                  <input type="tel" id="phone" name="phone" placeholder="(402) 555-0123" />
                </div>

                <div className="field">
                  <label htmlFor="guests">How many are coming?</label>
                  <select id="guests" name="guests" value={guestCount} onChange={handleGuestChange}>
                    {Array.from({ length: 10 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i === 0 ? 'guest (just me)' : i === 1 ? 'guests' : 'guests'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label>Meal preferences</label>
                  <div className="meal-list">
                    {Array.from({ length: guestCount }, (_, i) => (
                      <div key={i} className="meal-row">
                        <span className="meal-name">Guest {i + 1}{i === 0 ? ' (you)' : ''}</span>
                        <div className="meal-pills">
                          <button
                            type="button"
                            className={`pill ${mealPrefs[i] === 'vegetarian' ? 'active' : ''}`}
                            onClick={() => handleMealPref(i, 'vegetarian')}
                          >Veg</button>
                          <button
                            type="button"
                            className={`pill ${mealPrefs[i] === 'non-vegetarian' ? 'active' : ''}`}
                            onClick={() => handleMealPref(i, 'non-vegetarian')}
                          >Non-Veg</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {error && <p className="form-error">{error}</p>}

                <button type="submit" className="btn-primary btn-submit" disabled={submitting}>
                  <span>{submitting ? 'Sending...' : 'Confirm RSVP'}</span>
                  {!submitting && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              </form>
            </Reveal>
          </>
        )}
      </section>
    </main>
  )
}
