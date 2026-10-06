import { NavLink } from 'react-router-dom'
import './Navbar.css'

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-brand">
          <span className="brand-icon">60</span>
          <span className="brand-text">Sethu at 60</span>
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
