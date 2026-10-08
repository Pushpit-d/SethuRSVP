import { useState, useEffect } from 'react'
import './Navbar.css'

function BrandMark() {
  return (
    <svg className="brand-svg" viewBox="0 0 52 60" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="medalFill" x1="20%" y1="10%" x2="80%" y2="90%">
          <stop offset="0%" stopColor="#F87171" />
          <stop offset="55%" stopColor="#DC2626" />
          <stop offset="100%" stopColor="#7F1D1D" />
        </linearGradient>
        <linearGradient id="ribbonLeft" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#991B1B" />
        </linearGradient>
        <linearGradient id="ribbonRight" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#DC2626" />
          <stop offset="100%" stopColor="#7F1D1D" />
        </linearGradient>
        <linearGradient id="goldRing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
        <radialGradient id="shineGlow" cx="35%" cy="30%" r="55%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>

      {/* Left ribbon tail */}
      <path
        className="brand-ribbon brand-ribbon-left"
        d="M14 34 L24 28 L26 40 L24 56 L18 50 L13 54 Z"
        fill="url(#ribbonLeft)"
      />

      {/* Right ribbon tail */}
      <path
        className="brand-ribbon brand-ribbon-right"
        d="M38 34 L28 28 L26 40 L28 56 L34 50 L39 54 Z"
        fill="url(#ribbonRight)"
      />

      {/* Outer gold laurel ring */}
      <circle
        className="brand-ring"
        cx="26"
        cy="24"
        r="22"
        fill="none"
        stroke="url(#goldRing)"
        strokeWidth="1"
        strokeDasharray="1.5 3"
      />

      {/* Medal body */}
      <circle cx="26" cy="24" r="19" fill="url(#medalFill)" />

      {/* Inner highlight ring */}
      <circle cx="26" cy="24" r="17" fill="none" stroke="rgba(251, 191, 36, 0.5)" strokeWidth="0.8" />

      {/* Shine */}
      <circle cx="26" cy="24" r="19" fill="url(#shineGlow)" />

      {/* "60" numeral */}
      <text
        x="26"
        y="30.5"
        textAnchor="middle"
        fontFamily="'Fraunces', 'Playfair Display', serif"
        fontWeight="700"
        fontSize="18"
        fill="#FFFFFF"
        letterSpacing="-0.5"
      >
        60
      </text>

      {/* Orbiting amber spark */}
      <circle className="brand-spark" cx="26" cy="2" r="1.8" fill="#FBBF24" />
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
