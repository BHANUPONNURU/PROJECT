import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'

const initialRows = [
  { id: 1, student: 'Aarav', assignment: 'Algebra Quiz', grade: '' },
  { id: 2, student: 'Maya', assignment: 'Physics Homework', grade: '' },
  { id: 3, student: 'Noah', assignment: 'History Essay', grade: 'B+' }
]

export default function GradePanel({ onNavigate, onLogout }) {
  const [rows, setRows] = useState(initialRows)

  const updateGrade = (id, value) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, grade: value } : row)))
  }

  return (
    <div>
      <Navbar role="teacher" onNavigate={onNavigate} onLogout={onLogout} />
      <div style={styles.layout}>
        <Sidebar role="teacher" active="grade" onNavigate={onNavigate} />
        <main style={styles.main}>
          <h2>Grade Panel</h2>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Student</th>
                <th style={styles.th}>Assignment</th>
                <th style={styles.th}>Grade</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td style={styles.td}>{row.student}</td>
                  <td style={styles.td}>{row.assignment}</td>
                  <td style={styles.td}>
                    <input
                      style={styles.input}
                      value={row.grade}
                      onChange={(event) => updateGrade(row.id, event.target.value)}
                      placeholder="e.g. A"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </main>
      </div>
    </div>
  )
}

const styles = {
  layout: {
    display: 'flex'
  },
  main: {
    flex: 1,
    padding: 16
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    background: '#fff'
  },
  th: {
    textAlign: 'left',
    borderBottom: '1px solid #ddd',
    padding: 10
  },
  td: {
    borderBottom: '1px solid #eee',
    padding: 10
  },
  input: {
    width: 120,
    padding: 6,
    borderRadius: 6,
    border: '1px solid #ccc'
  }
}
