import { useState, useEffect } from 'react'
import './Navbar.css'

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
            <span className="brand-mark">60</span>
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
