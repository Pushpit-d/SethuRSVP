import { useState } from 'react'
import './Admin.css'

export default function Admin() {
  const [secret, setSecret] = useState('')
  const [authed, setAuthed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null) // the rsvp row to delete
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [viewMessage, setViewMessage] = useState(null) // the rsvp whose message to view

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/rsvp', {
        headers: { Authorization: `Bearer ${secret}` },
      })

      if (!res.ok) {
        if (res.status === 429) {
          const body = await res.json().catch(() => ({}))
          setError(body.error || 'Too many attempts. Try again later.')
        } else {
          setError('Invalid password.')
        }
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

  function exportCsv() {
    if (!data?.rsvps?.length) return

    const escape = (val) => {
      const s = val == null ? '' : String(val)
      // Wrap in quotes and escape any embedded quotes if the value contains a
      // comma, quote or newline (Excel-safe CSV).
      if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
      return s
    }

    const headers = [
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Guests',
      'Vegetarian',
      'Non-Vegetarian',
      'Meal Breakdown',
      'Message',
      'Submitted At',
    ]

    const rows = data.rsvps.map((r) => {
      const meals = r.meal_preferences || []
      const veg = meals.filter((m) => m.preference === 'vegetarian').length
      const nonVeg = meals.filter((m) => m.preference === 'non-vegetarian').length
      const breakdown = meals
        .map((m) => `Guest ${m.guest}: ${m.preference}`)
        .join(' | ')
      return [
        r.first_name,
        r.last_name,
        r.email,
        r.phone || '',
        r.guest_count,
        veg,
        nonVeg,
        breakdown,
        r.message || '',
        new Date(r.submitted_at).toISOString(),
      ].map(escape).join(',')
    })

    const csv = [headers.map(escape).join(','), ...rows].join('\n')
    // Prepend UTF-8 BOM so Excel reads the file as UTF-8 (handles em-dashes,
    // accented names, etc.).
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const timestamp = new Date().toISOString().slice(0, 10)
    a.href = url
    a.download = `sethu60-rsvps-${timestamp}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  async function handleDelete() {
    if (!confirmDelete) return
    setDeleting(true)
    setDeleteError('')
    try {
      const res = await fetch(`/api/rsvp?id=${confirmDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${secret}` },
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setDeleteError(body.error || 'Failed to delete.')
        setDeleting(false)
        return
      }
      // Remove from local state
      setData((prev) => {
        if (!prev) return prev
        const remaining = prev.rsvps.filter((r) => r.id !== confirmDelete.id)
        const totalGuests = remaining.reduce((sum, r) => sum + r.guest_count, 0)
        const totalVeg = remaining.reduce(
          (sum, r) => sum + (r.meal_preferences || []).filter((m) => m.preference === 'vegetarian').length,
          0
        )
        const totalNonVeg = remaining.reduce(
          (sum, r) => sum + (r.meal_preferences || []).filter((m) => m.preference === 'non-vegetarian').length,
          0
        )
        return {
          rsvps: remaining,
          summary: {
            totalRsvps: remaining.length,
            totalGuests,
            totalVeg,
            totalNonVeg,
          },
        }
      })
      setConfirmDelete(null)
    } catch {
      setDeleteError('Unable to connect. Please try again.')
    }
    setDeleting(false)
  }

  function cancelDelete() {
    if (deleting) return
    setConfirmDelete(null)
    setDeleteError('')
  }

  if (!authed) {
    return (
      <main className="admin-page">
        <section className="admin-login">
          <div className="login-card">
            <div className="login-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h1>Admin Dashboard</h1>
            <p>Enter your password to view RSVPs.</p>
            <form onSubmit={handleLogin} className="login-form">
              <input
                type="password"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="Password"
                required
                autoFocus
              />
              {error && <p className="login-error">{error}</p>}
              <button type="submit" disabled={loading}>
                {loading ? 'Checking...' : 'View RSVPs'}
              </button>
            </form>
          </div>
        </section>
      </main>
    )
  }

  const { rsvps, summary } = data

  return (
    <main className="admin-page">
      <div className="admin-shell">
        <section className="admin-header">
          <div className="admin-header-left">
            <div className="admin-badge">60</div>
            <div className="admin-header-text">
              <h1>RSVP Dashboard</h1>
              <p>{rsvps.length} {rsvps.length === 1 ? 'response' : 'responses'} received</p>
            </div>
          </div>
          <div className="header-actions">
            <button
              onClick={exportCsv}
              className="refresh-btn"
              disabled={!rsvps.length}
              title="Download RSVPs as CSV"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Export</span>
            </button>
            <button onClick={refresh} className="refresh-btn" disabled={loading}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              <span>{loading ? 'Refreshing' : 'Refresh'}</span>
            </button>
          </div>
        </section>

        <section className="stats-grid">
          <div className="stat-card stat-purple">
            <div className="stat-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <p className="stat-label">Total RSVPs</p>
            <p className="stat-value">{summary.totalRsvps}</p>
          </div>
          <div className="stat-card stat-purple">
            <div className="stat-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <p className="stat-label">Total Guests</p>
            <p className="stat-value">{summary.totalGuests}</p>
          </div>
          <div className="stat-card stat-green">
            <div className="stat-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a9 9 0 0 1 9 9c0 3.5-2 7-5 9-1.5-2-3-4-4-7-1 3-2.5 5-4 7-3-2-5-5.5-5-9a9 9 0 0 1 9-9z" />
              </svg>
            </div>
            <p className="stat-label">Vegetarian</p>
            <p className="stat-value">{summary.totalVeg}</p>
          </div>
          <div className="stat-card stat-purple">
            <div className="stat-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>
            <p className="stat-label">Non-Vegetarian</p>
            <p className="stat-value">{summary.totalNonVeg}</p>
          </div>
        </section>

        <section className="rsvp-table-section">
        {rsvps.length === 0 ? (
          <div className="empty-state">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <p>No RSVPs yet.<br />Share your invitation link to start collecting responses.</p>
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
                  <th>Message</th>
                  <th>Date</th>
                  <th></th>
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
                    <td className="td-message">
                      {r.message ? (
                        <button
                          type="button"
                          className="message-cell"
                          onClick={() => setViewMessage(r)}
                          title="Click to read full message"
                        >
                          <span className="message-preview">{r.message}</span>
                          <span className="message-more">Read full</span>
                        </button>
                      ) : (
                        <span className="td-empty">—</span>
                      )}
                    </td>
                    <td className="td-date">
                      {new Date(r.submitted_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="td-actions">
                      <button
                        className="delete-btn"
                        onClick={() => setConfirmDelete(r)}
                        aria-label={`Delete RSVP from ${r.first_name} ${r.last_name}`}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      </div>

      {confirmDelete && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
              </svg>
            </div>
            <h2>Delete this RSVP?</h2>
            <p className="modal-body">
              This will permanently remove the RSVP from <strong>{confirmDelete.first_name} {confirmDelete.last_name}</strong>
              {' '}({confirmDelete.email}).
              <br />This action cannot be undone.
            </p>
            {deleteError && <p className="modal-error">{deleteError}</p>}
            <div className="modal-actions">
              <button
                type="button"
                className="modal-btn modal-btn-cancel"
                onClick={cancelDelete}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="modal-btn modal-btn-delete"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete RSVP'}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewMessage && (
        <div className="modal-overlay" onClick={() => setViewMessage(null)}>
          <div className="modal modal-message" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon modal-icon-message">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h2>Note from {viewMessage.first_name} {viewMessage.last_name}</h2>
            <p className="message-full">{viewMessage.message}</p>
            <div className="modal-actions">
              <button
                type="button"
                className="modal-btn modal-btn-cancel"
                onClick={() => setViewMessage(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
