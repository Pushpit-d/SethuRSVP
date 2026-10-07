import { Link } from 'react-router-dom'
import './PartyDetails.css'

const details = [
  { label: 'Date', value: 'Thursday, November 26, 2026', icon: 'calendar' },
  { label: 'Start Time', value: '10:00 AM', icon: 'clock' },
  { label: 'Lunch Feast', value: '12:30 – 1:00 PM', icon: 'utensils' },
  { label: 'Venue', value: 'Jewish Community Center', sub: 'Omaha, Nebraska', icon: 'map' },
]

const icons = {
  calendar: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  clock: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  utensils: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2v0a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
    </svg>
  ),
  map: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
}

export default function PartyDetails() {
  return (
    <main className="party">
      <section className="party-hero">
        <span className="party-eyebrow">Party Details</span>
        <h1>Join us for a morning of celebration</h1>
        <p className="party-subtitle">We would be honored to have you with us as Sethu turns 60.</p>
      </section>

      <section className="party-details">
        <div className="details-grid">
          {details.map((d) => (
            <div key={d.label} className="detail-card">
              <div className="detail-icon">{icons[d.icon]}</div>
              <p className="detail-label">{d.label}</p>
              <p className="detail-value">{d.value}</p>
              {d.sub && <p className="detail-sub">{d.sub}</p>}
              {d.icon === 'map' && (
                <a
                  href="https://maps.google.com/?q=Jewish+Community+Center+Omaha+Nebraska"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="detail-link"
                >
                  Open in Maps &rarr;
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="agenda-section">
        <div className="agenda-card">
          <div className="agenda-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <h2>Agenda</h2>
          <p className="agenda-placeholder">The detailed program for the day will be shared here soon.</p>
        </div>
      </section>

      <section className="party-rsvp">
        <div className="rsvp-prompt">
          <div className="rsvp-prompt-grain" />
          <div className="rsvp-prompt-content">
            <div>
              <h3>Ready to join us?</h3>
              <p>Please RSVP so we can plan the lunch feast for you and your family.</p>
            </div>
            <Link to="/rsvp" className="rsvp-cta">RSVP Now</Link>
          </div>
        </div>
      </section>
    </main>
  )
}
