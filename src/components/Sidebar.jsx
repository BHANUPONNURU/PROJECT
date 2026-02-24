import React from 'react'

export default function Sidebar({ role = 'student', active = 'dashboard', onNavigate }) {
  const studentItems = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'submit', label: 'Submit Assignment' }
  ]

  const teacherItems = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'grade', label: 'Grade Panel' }
  ]

  const items = role === 'teacher' ? teacherItems : studentItems

  return (
    <aside style={styles.sidebar}>
      {items.map((item) => (
        <button
          key={item.key}
          style={{
            ...styles.item,
            ...(active === item.key ? styles.activeItem : {})
          }}
          onClick={() => onNavigate?.(item.key)}
        >
          {item.label}
        </button>
      ))}
    </aside>
  )
}

const styles = {
  sidebar: {
    width: 220,
    minHeight: 'calc(100vh - 50px)',
    borderRight: '1px solid #ddd',
    padding: 12,
    background: '#fafafa',
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  },
  item: {
    textAlign: 'left',
    border: '1px solid #ddd',
    padding: '8px 10px',
    borderRadius: 6,
    background: '#fff',
    cursor: 'pointer'
  },
  activeItem: {
    background: '#eef4ff',
    borderColor: '#9bbcff'
  }
}
