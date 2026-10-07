import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grain" />
      <div className="footer-inner">
        <div className="footer-ornament">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="rgba(212,160,85,0.4)" />
          </svg>
        </div>
        <p className="footer-text">
          With love from the family &middot; Omaha, Nebraska &middot; Go Big Red
        </p>
      </div>
    </footer>
  )
}
