import React from 'react'

export default function AssignmentCard({ assignment, onPrimaryAction, onView }) {
  if (!assignment) return null

  const isSubmitted = assignment.status === 'submitted' || assignment.status === 'graded'

  return (
    <article style={styles.card}>
      <h3 style={styles.title}>{assignment.title}</h3>
      <p style={styles.meta}>Subject: {assignment.subject}</p>
      <p style={styles.meta}>Due: {assignment.dueDate}</p>
      <p style={styles.meta}>Status: {assignment.status}</p>
      {assignment.grade ? <p style={styles.grade}>Grade: {assignment.grade}</p> : null}

      <div style={styles.actions}>
        <button style={styles.secondaryButton} onClick={() => onView?.(assignment)}>
          View
        </button>
        <button
          style={styles.primaryButton}
          onClick={() => onPrimaryAction?.(assignment)}
          disabled={isSubmitted && !assignment.grade}
        >
          {assignment.grade ? 'Recheck' : isSubmitted ? 'Submitted' : 'Submit'}
        </button>
      </div>
    </article>
  )
}

const styles = {
  card: {
    border: '1px solid #ddd',
    borderRadius: 10,
    padding: 14,
    background: '#fff'
  },
  title: {
    margin: '0 0 10px'
  },
  meta: {
    margin: '4px 0',
    color: '#444'
  },
  grade: {
    margin: '8px 0',
    fontWeight: 700,
    color: '#0a6b2b'
  },
  actions: {
    display: 'flex',
    gap: 8,
    marginTop: 10
  },
  primaryButton: {
    border: 'none',
    borderRadius: 6,
    padding: '8px 10px',
    background: '#2563eb',
    color: '#fff',
    cursor: 'pointer'
  },
  secondaryButton: {
    border: '1px solid #ccc',
    borderRadius: 6,
    padding: '8px 10px',
    background: '#fff',
    cursor: 'pointer'
  }
}
