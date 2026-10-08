import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <svg className="footer-mark" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="footerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#991B1B" />
            </linearGradient>
            <linearGradient id="footerRing" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#EF4444" />
            </linearGradient>
          </defs>
          <circle className="footer-ring" cx="28" cy="28" r="26" fill="none" stroke="url(#footerRing)" strokeWidth="1" strokeDasharray="2 3" />
          <circle cx="28" cy="28" r="21" fill="url(#footerGrad)" />
          <text x="28" y="35" textAnchor="middle" fontFamily="Fraunces, serif" fontSize="18" fontWeight="700" fill="white">60</text>
        </svg>
        <p className="footer-text">
          Made with <em>love</em> by the family &middot; Omaha, Nebraska
        </p>
      </div>
    </footer>
  )
}
