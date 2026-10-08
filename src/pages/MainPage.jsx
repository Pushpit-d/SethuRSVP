import { useState, useEffect, useRef } from 'react'
import Confetti, { Scatter } from '../components/Confetti'
import './MainPage.css'

const ABOUT_SCATTER = [
  { shape: 'rect', top: '8%', left: '6%', rot: 15, delay: 0 },
  { shape: 'circle', top: '14%', right: '8%', rot: 0, delay: 1 },
  { shape: 'tri', bottom: '20%', left: '4%', rot: -20, delay: 2 },
  { shape: 'rect', bottom: '10%', right: '10%', rot: -35, delay: 0.5 },
]

const DETAILS_SCATTER = [
  { shape: 'tri', top: '6%', right: '6%', rot: 10, delay: 0 },
  { shape: 'circle', top: '20%', left: '4%', rot: 0, delay: 1.5 },
  { shape: 'rect', bottom: '14%', right: '5%', rot: 25, delay: 0.8 },
  { shape: 'rect', bottom: '28%', left: '7%', rot: -15, delay: 2.2 },
]

const RSVP_SCATTER = [
  { shape: 'circle', top: '10%', left: '6%', rot: 0, delay: 0.3 },
  { shape: 'rect', top: '18%', right: '7%', rot: 30, delay: 1.2 },
  { shape: 'tri', bottom: '18%', right: '5%', rot: -10, delay: 2 },
  { shape: 'rect', bottom: '12%', left: '5%', rot: 20, delay: 0.6 },
]

// Event is pinned to Omaha, Nebraska (America/Chicago).
// Use ISO Z form so the moment-in-time is unambiguous regardless of
// where the user is viewing from. Nov 26, 2026 is in CST (UTC-6).
const EVENT_TZ = 'America/Chicago'
const EVENT_TZ_SHORT = 'CST'
const EVENT = {
  title: "Sethu's 60th Birthday Celebration",
  date: 'Thursday, November 26, 2026',
  time: '10:00 AM',
  venue: 'Jewish Community Center, Omaha, Nebraska',
  start: '20261126T160000Z',
  end: '20261126T190000Z',
  description: 'Join us to celebrate Sethu turning 60!',
  // 2026-11-26 10:00 AM Omaha time (CST, UTC-6) → 16:00 UTC
  targetDate: new Date(Date.UTC(2026, 10, 26, 16, 0, 0)),
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

const HERO_PHOTOS = [
  '/Sethu60-1.webp',
  '/Sethu60-2.webp',
  '/Sethu60-3.webp',
]
const PHOTO_INTERVAL_MS = 4200
const RESUME_AFTER_MS = 6000

function HeroPhotos() {
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchStart = useRef(null)
  const resumeTimer = useRef(null)

  useEffect(() => {
    if (paused || HERO_PHOTOS.length <= 1) return
    const id = setInterval(() => {
      setIdx((i) => (i + 1) % HERO_PHOTOS.length)
    }, PHOTO_INTERVAL_MS)
    return () => clearInterval(id)
  }, [paused])

  // Clean up any pending resume timer on unmount
  useEffect(() => () => clearTimeout(resumeTimer.current), [])

  function pauseThenResume(delay = RESUME_AFTER_MS) {
    setPaused(true)
    clearTimeout(resumeTimer.current)
    resumeTimer.current = setTimeout(() => setPaused(false), delay)
  }

  function handleEnter() {
    clearTimeout(resumeTimer.current)
    setPaused(true)
  }
  function handleLeave() {
    setPaused(false)
  }

  function handleTouchStart(e) {
    touchStart.current = e.touches[0].clientX
    handleEnter()
  }
  function handleTouchEnd(e) {
    if (touchStart.current == null) {
      pauseThenResume()
      return
    }
    const diff = touchStart.current - e.changedTouches[0].clientX
    touchStart.current = null
    if (Math.abs(diff) > 40) {
      if (diff > 0) setIdx((i) => (i + 1) % HERO_PHOTOS.length)
      else setIdx((i) => (i - 1 + HERO_PHOTOS.length) % HERO_PHOTOS.length)
    }
    pauseThenResume()
  }

  function goTo(i, e) {
    e?.stopPropagation()
    setIdx(i)
    pauseThenResume()
  }

  return (
    <div
      className="hero-photo-wrap"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="hero-photo-ring" />
      <div className="hero-photo-frame">
        {HERO_PHOTOS.map((src, i) => (
          <img
            key={src + i}
            src={src}
            alt={`Sethu ${i + 1}`}
            className={`hero-photo ${i === idx ? 'is-active' : ''}`}
            loading={i === 0 ? 'eager' : 'lazy'}
            draggable="false"
          />
        ))}
      </div>
      <div className="hero-photo-badge">
        <span className="hpb-num">60</span>
        <span className="hpb-text">years</span>
      </div>
      {HERO_PHOTOS.length > 1 && (
        <div className="hero-dots" role="tablist" aria-label="Photos">
          {HERO_PHOTOS.map((_, i) => (
            <button
              key={i}
              className={`hero-dot ${i === idx ? 'is-active' : ''}`}
              onClick={(e) => goTo(i, e)}
              aria-label={`Show photo ${i + 1}`}
              aria-selected={i === idx}
              role="tab"
            />
          ))}
        </div>
      )}
    </div>
  )
}

function Chapters({ items }) {
  const containerRef = useRef(null)
  const [activeIdx, setActiveIdx] = useState(-1)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const chapterEls = container.querySelectorAll('.chapter')

    function update() {
      const rect = container.getBoundingClientRect()
      const triggerY = window.innerHeight * 0.55

      // Progress: 0% when top enters trigger line, 100% when bottom passes it
      const total = rect.height
      const traveled = triggerY - rect.top
      const pct = Math.max(0, Math.min(100, (traveled / total) * 100))
      // Only grow — never shrink when the user scrolls back up
      setProgress((prev) => Math.max(prev, pct))

      // Active index: last chapter whose center has crossed the trigger
      let idx = -1
      chapterEls.forEach((el, i) => {
        const r = el.getBoundingClientRect()
        if (r.top + r.height / 2 <= triggerY) idx = i
      })
      // Latch: once a chapter has lit up, it stays lit
      setActiveIdx((prev) => Math.max(prev, idx))
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <div
      className="chapters"
      ref={containerRef}
      style={{ '--progress': `${progress}%` }}
    >
      <span className="chapters-track" />
      <span className="chapters-fill" />
      {items.map((c, i) => (
        <div
          key={i}
          className={`chapter ${i <= activeIdx ? 'is-active' : ''} ${c.highlight ? 'chapter-hl' : ''}`}
        >
          <div className="chapter-year">{c.year}</div>
          <div className="chapter-connector">
            <span className="chapter-dot" />
          </div>
          <div className="chapter-text">{c.text}</div>
        </div>
      ))}
    </div>
  )
}

function useCountdown(target) {
  // Returns time remaining until a fixed point in time.
  // Because target.getTime() is a UTC millisecond and Date.now() is also UTC,
  // the result is identical for every viewer regardless of their timezone —
  // the countdown reflects "how long until the event happens in Omaha" even
  // if the viewer is in a different time zone.
  const calc = () => {
    const diff = Math.max(0, target.getTime() - Date.now())
    const days = Math.floor(diff / 86400000)
    const hours = Math.floor((diff % 86400000) / 3600000)
    const minutes = Math.floor((diff % 3600000) / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)
    return { days, hours, minutes, seconds, diff }
  }
  const [time, setTime] = useState(calc)
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000)
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
  const [phoneDigits, setPhoneDigits] = useState('')
  const [phoneError, setPhoneError] = useState('')

  function formatPhone(digits) {
    const d = digits.slice(0, 10)
    if (d.length === 0) return ''
    if (d.length <= 3) return `(${d}`
    if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
  }

  function handlePhoneChange(e) {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10)
    setPhoneDigits(digits)
    if (phoneError) setPhoneError('')
  }

  function handlePhoneKeyDown(e) {
    const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End']
    if (allowed.includes(e.key)) return
    if (e.metaKey || e.ctrlKey) return
    if (!/^[0-9]$/.test(e.key)) e.preventDefault()
  }

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
    setError('')
    setPhoneError('')

    // Phone is optional, but if provided must be exactly 10 digits
    if (phoneDigits.length > 0 && phoneDigits.length !== 10) {
      setPhoneError('Please enter a 10-digit phone number.')
      return
    }

    setSubmitting(true)
    const formData = new FormData(e.target)
    const mealPreferences = Array.from({ length: guestCount }, (_, i) => ({
      guest: i + 1,
      preference: mealPrefs[i],
    }))
    const phoneValue = phoneDigits.length === 10 ? `+1${phoneDigits}` : ''
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.get('firstName'),
          lastName: formData.get('lastName'),
          email: formData.get('email'),
          phone: phoneValue,
          guestCount,
          mealPreferences,
          website: formData.get('website') || '',
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
        <Confetti count={75} />

        <div className="hero-content">
          <div className="hero-badge">
            <span className="pulse-dot" />
            You're Invited
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
              <span className="count-num">{String(countdown.hours).padStart(2, '0')}</span>
              <span className="count-label">hrs</span>
            </div>
            <div className="count-divider" />
            <div className="count-item">
              <span className="count-num">{String(countdown.minutes).padStart(2, '0')}</span>
              <span className="count-label">min</span>
            </div>
            <div className="count-divider" />
            <div className="count-item">
              <span className="count-num">{String(countdown.seconds).padStart(2, '0')}</span>
              <span className="count-label">sec</span>
            </div>
          </div>
          <p className="countdown-tz">All times {EVENT_TZ_SHORT} (Omaha, Nebraska)</p>

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

        <HeroPhotos />
      </section>

      {/* ─── ABOUT / JOURNEY ─── */}
      <section id="about" className="section about">
        <Scatter positions={ABOUT_SCATTER} />
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

        <Chapters items={chapters} />
      </section>

      {/* ─── DETAILS ─── */}
      <section id="details" className="section details">
        <Scatter positions={DETAILS_SCATTER} />
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
              <div className={`detail-card ${d.icon === 'calendar' ? 'card-red' : ''}`}>
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
                    href="https://maps.app.goo.gl/USaBXxAK7aGaHS8p6"
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
        <Scatter positions={RSVP_SCATTER} />
        {submitted ? (
          <div className="success">
            <div className="success-sparkle">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l1.76 6.24L20 10l-6.24 1.76L12 18l-1.76-6.24L4 10l6.24-1.76L12 2z" />
              </svg>
            </div>
            <h2 className="success-title">You're in!</h2>
            <p className="success-body">
              Your RSVP has been received. We can't wait to celebrate with you on November 26, 2026.
            </p>
            <div className="success-note">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <span>
                A confirmation email has been sent to your inbox. If you don't see it,
                please check your <strong>spam</strong> or <strong>promotions</strong> folder.
              </span>
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
              <form className="rsvp-form" onSubmit={handleSubmit} autoComplete="off">
                {/* Honeypot: hidden from humans, bots will fill it */}
                <div className="hp-field" aria-hidden="true">
                  <label htmlFor="website">Website</label>
                  <input
                    type="text"
                    id="website"
                    name="website"
                    tabIndex="-1"
                    autoComplete="off"
                  />
                </div>

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
                  <div className={`phone-input ${phoneError ? 'has-error' : ''}`}>
                    <span className="phone-prefix">+1</span>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      maxLength="14"
                      placeholder="(402) 555-0123"
                      value={formatPhone(phoneDigits)}
                      onChange={handlePhoneChange}
                      onKeyDown={handlePhoneKeyDown}
                    />
                  </div>
                  {phoneError && <p className="field-error">{phoneError}</p>}
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
