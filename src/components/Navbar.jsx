import React from 'react'

export default function Navbar({ role = 'student', title = 'AssignMate', onLogout, onNavigate }) {
  return (
    <nav style={styles.nav}>
      <div style={styles.brand} onClick={() => onNavigate?.('dashboard')}>
        {title}
      </div>
      <div style={styles.right}>
        <span style={styles.role}>{role.toUpperCase()}</span>
        <button style={styles.button} onClick={() => onLogout?.()}>
          Logout
        </button>
      </div>
    </nav>
  )
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid #ddd',
    backgroundColor: '#fff'
  },
  brand: {
    fontWeight: 700,
    cursor: 'pointer'
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: 12
  },
  role: {
    fontSize: 12,
    color: '#666'
  },
  button: {
    border: '1px solid #ccc',
    background: '#f8f8f8',
    padding: '6px 10px',
    borderRadius: 6,
    cursor: 'pointer'
  }
}
