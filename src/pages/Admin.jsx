import { useState } from 'react'
import './Admin.css'

export default function Admin() {
  const [secret, setSecret] = useState('')
  const [authed, setAuthed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/rsvp', {
        headers: { Authorization: `Bearer ${secret}` },
      })

      if (!res.ok) {
        setError('Invalid password.')
        setLoading(false)
        return
      }

      const json = await res.json()
      setData(json)
      setAuthed(true)
    } catch {
      setError('Unable to connect.')
    }
    setLoading(false)
  }

  async function refresh() {
    setLoading(true)
    try {
      const res = await fetch('/api/rsvp', {
        headers: { Authorization: `Bearer ${secret}` },
      })
      const json = await res.json()
      setData(json)
    } catch {
      /* silent */
    }
    setLoading(false)
  }

  if (!authed) {
    return (
      <main className="admin-page">
        <section className="admin-login">
          <div className="login-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1>Admin Dashboard</h1>
          <p>Enter your admin password to view RSVPs.</p>
          <form onSubmit={handleLogin} className="login-form">
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Admin password"
              required
              autoFocus
            />
            {error && <p className="login-error">{error}</p>}
            <button type="submit" disabled={loading}>
              {loading ? 'Checking...' : 'View RSVPs'}
            </button>
          </form>
        </section>
      </main>
    )
  }

  const { rsvps, summary } = data

  return (
    <main className="admin-page">
      <section className="admin-header">
        <div>
          <h1>RSVP Dashboard</h1>
          <p>{rsvps.length} {rsvps.length === 1 ? 'response' : 'responses'} received</p>
        </div>
        <button onClick={refresh} className="refresh-btn" disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </section>

      <section className="stats-grid">
        <div className="stat-card">
          <p className="stat-label">Total RSVPs</p>
          <p className="stat-value">{summary.totalRsvps}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Total Guests</p>
          <p className="stat-value">{summary.totalGuests}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Vegetarian</p>
          <p className="stat-value">{summary.totalVeg}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Non-Vegetarian</p>
          <p className="stat-value">{summary.totalNonVeg}</p>
        </div>
      </section>

      <section className="rsvp-table-section">
        {rsvps.length === 0 ? (
          <div className="empty-state">
            <p>No RSVPs yet. Share your invitation link to start collecting responses.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="rsvp-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Guests</th>
                  <th>Meals</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {rsvps.map((r) => (
                  <tr key={r.id}>
                    <td className="td-name">{r.first_name} {r.last_name}</td>
                    <td>{r.email}</td>
                    <td>{r.phone || '—'}</td>
                    <td className="td-center">{r.guest_count}</td>
                    <td>
                      {(r.meal_preferences || []).map((m, i) => (
                        <span key={i} className={`meal-badge ${m.preference === 'vegetarian' ? 'veg' : 'non-veg'}`}>
                          {m.preference === 'vegetarian' ? 'V' : 'NV'}
                        </span>
                      ))}
                    </td>
                    <td className="td-date">
                      {new Date(r.submitted_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}
