import { NavLink } from 'react-router-dom'
import './Navbar.css'

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-brand">
          <div className="brand-badge">
            <svg className="brand-rings" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle className="ring-outer" cx="26" cy="26" r="24" stroke="#C4956A" strokeWidth="1.5" />
              <circle className="ring-glow" cx="26" cy="26" r="24" stroke="#C4956A" strokeWidth="1.5" />
              <circle className="ring-inner" cx="26" cy="26" r="20" stroke="#C4956A" strokeWidth="0.5" strokeDasharray="3 4" />
            </svg>
            <div className="brand-circle">
              <span className="brand-number">60</span>
            </div>
            <div className="brand-sparkles">
              <span className="sparkle s1" />
              <span className="sparkle s2" />
              <span className="sparkle s3" />
              <span className="sparkle s4" />
            </div>
          </div>
          <div className="brand-label">
            <span className="brand-name">Sethu</span>
            <span className="brand-sub">turning sixty</span>
          </div>
        </NavLink>
        <div className="navbar-links">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/party">Party Details</NavLink>
          <NavLink to="/rsvp" className="nav-rsvp">RSVP</NavLink>
        </div>
      </div>
    </nav>
  )
}
