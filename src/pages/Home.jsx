import { Link } from 'react-router-dom'
import './Home.css'

const milestones = [
  { year: '1966', text: 'Born on November 20, 1966.' },
  { year: '1989', text: 'Moved to the United States to pursue his master\'s degree.' },
  { year: 'Nebraska', text: 'First settled in Nebraska, and still proudly calls it home.' },
  { year: '1997', text: 'Married in December 1997.' },
  { year: '2026', text: 'Turning 60 this November.', highlight: true },
]

export default function Home() {
  return (
    <main className="home">
      <section className="hero">
        <div className="hero-content">
          <p className="hero-eyebrow">You're Invited &middot; November 26, 2026</p>
          <h1 className="hero-title">
            Celebrating<br />
            <em>Sethu's</em> 60th<br />
            Birthday!
          </h1>
          <p className="hero-body">
            Six decades of family, friendship, and a life well built, with Nebraska at the heart of it. Come celebrate with us in Omaha.
          </p>
          <Link to="/party" className="hero-cta">
            Learn More About the Party
            <span className="cta-arrow">&rarr;</span>
          </Link>
        </div>
        <div className="hero-visual">
          <div className="hero-photo-frame">
            <div className="photo-placeholder">
              <div className="photo-sixty">60</div>
              <p className="photo-label">Photos coming soon</p>
              <p className="photo-sublabel">Favorite moments of Sethu will appear here.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="timeline-section">
        <div className="timeline-header">
          <h2>A life in a few chapters</h2>
          <p>A few of the milestones that brought us to this celebration.</p>
        </div>
        <div className="timeline">
          {milestones.map((m, i) => (
            <div key={i} className={`timeline-card ${m.highlight ? 'highlight' : ''}`}>
              <div className="timeline-year">{m.year}</div>
              <p className="timeline-text">{m.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="event-banner">
        <div className="banner-inner">
          <div className="banner-details">
            <h3>Thursday, November 26, 2026</h3>
            <p>10:00 AM &middot; Jewish Community Center, Omaha</p>
          </div>
          <Link to="/party" className="banner-cta">Learn More About the Party</Link>
        </div>
      </section>
    </main>
  )
}
