import React, { useState } from 'react'

export default function SubmitAssignment({ onNavigate, onLogout }) {
  const [form, setForm] = useState({ title: '', link: '', notes: '' })
  const [message, setMessage] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setMessage(`Assignment "${form.title}" submitted successfully.`)
    setForm({ title: '', link: '', notes: '' })
  }

  return (
    <div style={styles.page}>
      <aside style={styles.sidebar}>
        <div style={styles.sidebarBrand}>
          <div style={styles.sidebarLogo}>A</div>
          <div>
            <p style={styles.sidebarTitle}>AssignMate</p>
            <p style={styles.sidebarSub}>Student Portal</p>
          </div>
        </div>

        <nav style={styles.menu}>
          <button type="button" style={styles.menuItem} onClick={() => onNavigate?.('dashboard')}>
            Dashboard
          </button>
          <button type="button" style={{ ...styles.menuItem, ...styles.menuItemActive }}>
            Submit Assignment
          </button>
        </nav>

        <button style={styles.sidebarLogout} type="button" onClick={onLogout}>
          Logout
        </button>
      </aside>

      <div style={styles.contentArea}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.heading}>Submit Assignment</h1>
            <p style={styles.headingSub}>Upload your work and share submission details</p>
          </div>
        </header>

        <main style={styles.main}>
          <section style={styles.card}>
            <div style={styles.cardHeader}>Assignment Submission Form</div>
            <form style={styles.formBody} onSubmit={handleSubmit}>
              <label style={styles.label}>Assignment Title</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                style={styles.input}
                placeholder="Enter assignment title"
                required
              />

              <label style={styles.label}>Submission Link</label>
              <input
                name="link"
                value={form.link}
                onChange={handleChange}
                style={styles.input}
                placeholder="Paste your document/repo link"
                required
              />

              <label style={styles.label}>Notes</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                style={styles.textarea}
                rows="5"
                placeholder="Any comments for the faculty..."
              />

              <div style={styles.actionRow}>
                <button style={styles.submitBtn} type="submit">
                  Submit Assignment
                </button>
              </div>
            </form>
          </section>

          {message ? <p style={styles.successMessage}>{message}</p> : null}
        </main>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'grid',
    gridTemplateColumns: '240px 1fr',
    background: 'linear-gradient(180deg, #edf4ff 0%, #e6efff 100%)'
  },
  sidebar: {
    background: '#ffffff',
    borderRight: '1px solid #dbeafe',
    display: 'flex',
    flexDirection: 'column',
    padding: 14,
    gap: 12
  },
  sidebarBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 12,
    borderBottom: '1px solid #e2e8f0'
  },
  sidebarLogo: {
    width: 36,
    height: 36,
    borderRadius: 8,
    background: '#2563eb',
    color: '#fff',
    display: 'grid',
    placeItems: 'center',
    fontWeight: 800
  },
  sidebarTitle: {
    margin: 0,
    fontWeight: 700,
    color: '#0f172a'
  },
  sidebarSub: {
    margin: '2px 0 0',
    color: '#64748b',
    fontSize: 12
  },
  menu: {
    display: 'grid',
    gap: 6
  },
  menuItem: {
    border: 'none',
    background: 'transparent',
    color: '#334155',
    textAlign: 'left',
    borderRadius: 8,
    padding: '10px 12px',
    fontWeight: 600,
    cursor: 'pointer'
  },
  menuItemActive: {
    background: '#2563eb',
    color: '#fff'
  },
  sidebarLogout: {
    marginTop: 'auto',
    border: '1px solid #bfdbfe',
    background: '#eff6ff',
    color: '#1e3a8a',
    borderRadius: 8,
    padding: '10px 12px',
    fontWeight: 700,
    cursor: 'pointer'
  },
  contentArea: {
    background: 'linear-gradient(135deg, #f9fbff 0%, #eef5ff 45%, #e8f0ff 100%)'
  },
  header: {
    background: '#fff',
    borderBottom: '1px solid #dbeafe',
    padding: '20px 28px'
  },
  heading: {
    margin: 0,
    display: 'inline-block',
    padding: '6px 14px',
    borderRadius: 10,
    borderLeft: '5px solid #2563eb',
    background: '#eaf2ff',
    fontSize: 34,
    color: '#0f172a'
  },
  headingSub: {
    margin: '6px 0 0',
    color: '#475569',
    fontSize: 18
  },
  main: {
    padding: 24
  },
  card: {
    maxWidth: 900,
    background: '#fff',
    border: '1px solid #dbeafe',
    borderRadius: 12,
    overflow: 'hidden'
  },
  cardHeader: {
    borderBottom: '1px solid #dbeafe',
    background: '#f8fbff',
    padding: '14px 16px',
    fontWeight: 700,
    color: '#0f172a',
    fontSize: 18
  },
  formBody: {
    padding: 16
  },
  label: {
    display: 'block',
    margin: '10px 0 6px',
    fontSize: 14,
    fontWeight: 600,
    color: '#334155'
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    height: 42,
    border: '1px solid #cbd5e1',
    borderRadius: 8,
    padding: '0 12px',
    fontSize: 14
  },
  textarea: {
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid #cbd5e1',
    borderRadius: 8,
    padding: '10px 12px',
    fontSize: 14,
    resize: 'vertical'
  },
  actionRow: {
    marginTop: 14,
    display: 'flex',
    justifyContent: 'flex-end'
  },
  submitBtn: {
    border: 'none',
    borderRadius: 8,
    height: 40,
    padding: '0 16px',
    background: '#2563eb',
    color: '#fff',
    fontWeight: 700,
    cursor: 'pointer'
  },
  successMessage: {
    marginTop: 12,
    color: '#1e40af',
    fontWeight: 600
  }
}
