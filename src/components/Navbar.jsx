import { useState, useEffect } from 'react'
import './Navbar.css'

function BrandMark() {
  return (
    <svg className="brand-svg" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="markFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#991B1B" />
        </linearGradient>
        <linearGradient id="markShimmer" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FBBF24" stopOpacity="0" />
          <stop offset="50%" stopColor="#FBBF24" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#FBBF24" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="markRing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#DC2626" />
        </linearGradient>
      </defs>

      {/* Outer orbit ring - very slow rotation */}
      <circle className="brand-orbit" cx="28" cy="28" r="26" fill="none" stroke="url(#markRing)" strokeWidth="0.8" strokeDasharray="1 4" opacity="0.5" />

      {/* Main red disc */}
      <circle cx="28" cy="28" r="22" fill="url(#markFill)" />

      {/* Shimmer sweep (clipped to disc) */}
      <clipPath id="discClip">
        <circle cx="28" cy="28" r="22" />
      </clipPath>
      <g clipPath="url(#discClip)">
        <rect className="brand-shimmer" x="-30" y="0" width="30" height="56" fill="url(#markShimmer)" />
      </g>

      {/* Inner highlight ring */}
      <circle cx="28" cy="28" r="21" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />

      {/* The 60 */}
      <text x="28" y="35" textAnchor="middle" fontFamily="Fraunces, serif" fontSize="18" fontWeight="700" fill="white" letterSpacing="-0.5">60</text>

      {/* Single orbiting dot */}
      <circle className="brand-orbit-dot" cx="28" cy="2" r="1.6" fill="#FBBF24" />
    </svg>
  )
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function scrollTo(id) {
    setOpen(false)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-inner">
          <button className="navbar-brand" onClick={() => scrollTo('hero')}>
            <BrandMark />
            <span className="brand-text">Sethu</span>
          </button>

          <div className="navbar-links">
            <button onClick={() => scrollTo('about')}>About</button>
            <button onClick={() => scrollTo('details')}>Details</button>
            <button onClick={() => scrollTo('rsvp')} className="nav-cta">RSVP</button>
          </div>

          <button
            className={`menu-btn ${open ? 'open' : ''}`}
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      <div className={`mobile-menu ${open ? 'open' : ''}`}>
        <button onClick={() => scrollTo('about')}>About</button>
        <button onClick={() => scrollTo('details')}>Details</button>
        <button onClick={() => scrollTo('rsvp')} className="mobile-cta">RSVP Now</button>
      </div>
    </>
  )
}
