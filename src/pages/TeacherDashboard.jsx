import React, { useEffect, useMemo, useState } from 'react'

export default function TeacherDashboard({ onLogout, onPublishAssignment, onUpdateAssignment, onDeleteAssignment, submissions = [], onGradeSubmission, assignments = [], user }) {
  const teacherSubject = user?.subject?.trim() || 'General'
  const [activeMenu, setActiveMenu] = useState('dashboard')
  const [query, setQuery] = useState('')
  const [selectedFile, setSelectedFile] = useState('')
  const [gradingSubmission, setGradingSubmission] = useState(null)
  const [detailSubmission, setDetailSubmission] = useState(null)
  const [editingAssignment, setEditingAssignment] = useState(null)
  const [publishNotice, setPublishNotice] = useState('')
  const [gradeInput, setGradeInput] = useState('')
  const [feedbackInput, setFeedbackInput] = useState('')
  const [form, setForm] = useState({
    title: '',
    subject: teacherSubject,
    dueDate: '',
    points: '100'
  })
  const displayName = user?.userId || user?.fullName || 'Teacher'
  const displaySub = teacherSubject || user?.email || user?.userId || 'Teacher Portal'
  const avatarText = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'TR'

  useEffect(() => {
    setForm((prev) => ({ ...prev, subject: teacherSubject }))
  }, [teacherSubject])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return submissions
    return submissions.filter((item) =>
      `${item.student} ${item.assignment} ${item.submitted}`.toLowerCase().includes(q)
    )
  }, [query, submissions])

  const students = useMemo(() => {
    const map = new Map()
    submissions.forEach((item) => {
      const key = item.studentId || item.student
      if (!key) return
      if (!map.has(key)) {
        map.set(key, {
          id: key,
          name: item.student || key,
          roll: item.studentId || key,
          section: '-',
          pending: 0
        })
      }
      if (item.status !== 'graded') {
        map.get(key).pending += 1
      }
    })
    return Array.from(map.values())
  }, [submissions])

  const stats = useMemo(() => {
    const pendingReviews = submissions.filter((item) => item.status !== 'graded').length
    const gradedRows = submissions.filter((item) => item.status === 'graded' && item.grade !== '-')
    const avgGrade = gradedRows.length > 0
      ? `${(gradedRows.reduce((sum, item) => sum + Number(item.grade), 0) / gradedRows.length).toFixed(1)}%`
      : '0%'

    return [
      { label: 'Total Assignments', value: String(assignments.length), color: '#2563eb', icon: 'doc' },
      { label: 'Total Students', value: String(students.length), color: '#0ea5e9', icon: 'users' },
      { label: 'Pending Reviews', value: String(pendingReviews), color: '#0284c7', icon: 'clock' },
      { label: 'Average Grade', value: avgGrade, color: '#1d4ed8', icon: 'trend' }
    ]
  }, [assignments, submissions, students])

  const handleFormChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handlePublish = (event) => {
    event.preventDefault()
    const assignmentTitle = form.title.trim()
    if (!assignmentTitle || !form.dueDate) {
      window.alert('Title and due date are required.')
      return
    }
    const published = onPublishAssignment?.({
      title: assignmentTitle,
      dueDate: form.dueDate,
      subject: teacherSubject,
      points: form.points
    })
    if (!published) {
      window.alert('Unable to publish assignment. Please try again.')
      return
    }
    setPublishNotice(`Assignment "${assignmentTitle}" published successfully.`)
    setForm({ title: '', subject: teacherSubject, dueDate: '', points: '100' })
    setSelectedFile('')
  }

  const handleStartEditAssignment = (assignment) => {
    setEditingAssignment({
      ...assignment,
      points: assignment?.points || '100'
    })
  }

  const handleEditAssignmentChange = (event) => {
    const { name, value } = event.target
    setEditingAssignment((prev) => (prev ? { ...prev, [name]: value } : prev))
  }

  const handleCloseEditModal = () => {
    setEditingAssignment(null)
  }

  const handleSaveAssignment = (event) => {
    event.preventDefault()
    if (!editingAssignment?.id) return

    const nextAssignment = {
      ...editingAssignment,
      title: editingAssignment.title?.trim(),
      subject: teacherSubject,
      dueDate: editingAssignment.dueDate,
      points: editingAssignment.points || '100'
    }

    if (!nextAssignment.title || !nextAssignment.dueDate) {
      window.alert('Title and due date are required.')
      return
    }

    onUpdateAssignment?.(nextAssignment)
    setEditingAssignment(null)
  }

  const handleDeletePublishedAssignment = (assignmentId) => {
    const confirmed = window.confirm('Delete this published assignment?')
    if (!confirmed) return
    onDeleteAssignment?.(assignmentId)
  }

  const handleGradeNow = (submission) => {
    setGradingSubmission(submission)
    setGradeInput('')
    setFeedbackInput('')
  }

  const handleCloseGradeModal = () => {
    setGradingSubmission(null)
    setGradeInput('')
    setFeedbackInput('')
  }

  const handleSubmitGrade = (event) => {
    event.preventDefault()
    if (!gradingSubmission) return

    const score = Number(gradeInput)
    if (Number.isNaN(score) || score < 0 || score > 100) {
      window.alert('Please enter a valid grade between 0 and 100.')
      return
    }

    onGradeSubmission?.(gradingSubmission.id, Math.round(score), feedbackInput.trim())
    handleCloseGradeModal()
  }

  const handleViewDetails = (submission) => {
    setDetailSubmission(submission)
  }

  const handleCloseDetailsModal = () => {
    setDetailSubmission(null)
  }

  const titleMap = {
    dashboard: 'Teacher Dashboard',
    assignments: 'Assignments',
    submissions: 'Submissions',
    students: 'Students'
  }

  const subTitleMap = {
    dashboard: 'Manage assignments and grade submissions',
    assignments: 'Create and manage assignment details',
    submissions: 'Review latest student submissions',
    students: 'Track student performance and pending work'
  }

  return (
    <div style={styles.page}>
      <aside style={styles.sidebar}>
        <div style={styles.sidebarBrand}>
          <div style={styles.sidebarLogo}>A</div>
          <div>
            <p style={styles.sidebarTitle}>AssignMate</p>
            <p style={styles.sidebarSub}>Teacher Portal</p>
          </div>
        </div>
        <nav style={styles.menu}>
          <button
            type="button"
            onClick={() => setActiveMenu('dashboard')}
            style={{ ...styles.menuItem, ...(activeMenu === 'dashboard' ? styles.menuItemActive : {}) }}
          >
            Dashboard
          </button>
          <button
            type="button"
            onClick={() => setActiveMenu('assignments')}
            style={{ ...styles.menuItem, ...(activeMenu === 'assignments' ? styles.menuItemActive : {}) }}
          >
            Assignments
          </button>
          <button
            type="button"
            onClick={() => setActiveMenu('submissions')}
            style={{ ...styles.menuItem, ...(activeMenu === 'submissions' ? styles.menuItemActive : {}) }}
          >
            Submissions
          </button>
          <button
            type="button"
            onClick={() => setActiveMenu('students')}
            style={{ ...styles.menuItem, ...(activeMenu === 'students' ? styles.menuItemActive : {}) }}
          >
            Students
          </button>
        </nav>
        <button style={styles.sidebarLogout} onClick={onLogout} type="button">Logout</button>
      </aside>

      <div style={styles.contentArea}>
        <div style={styles.backgroundA} />
        <div style={styles.backgroundB} />

        <header style={styles.header}>
          <div>
            <h1 style={styles.heading}>{titleMap[activeMenu]}</h1>
            <p style={styles.headingSub}>{subTitleMap[activeMenu]}</p>
          </div>
          <div style={styles.headerRight}>
            <div style={styles.userText}>
              <p style={styles.userName}>{displayName}</p>
              <p style={styles.userSub}>{displaySub}</p>
            </div>
            <div style={styles.avatar}>{avatarText}</div>
          </div>
        </header>

        <main style={styles.main}>
        {activeMenu === 'dashboard' ? <section style={styles.statsGrid}>
          {stats.map((item) => (
            <article key={item.label} style={styles.statCard}>
              <div>
                <p style={styles.statLabel}>{item.label}</p>
                <p style={styles.statValue}>{item.value}</p>
              </div>
              <div style={{ ...styles.statIcon, background: item.color }}>
                {item.icon === 'doc' ? 'DOC' : item.icon === 'users' ? 'USR' : item.icon === 'clock' ? 'CLK' : 'AVG'}
              </div>
            </article>
          ))}
        </section> : null}

        {activeMenu === 'dashboard' || activeMenu === 'assignments' ? <section style={styles.card}>
          <div style={styles.cardHeader}>Upload New Assignment</div>
          <form style={styles.cardBody} onSubmit={handlePublish}>
            <div style={styles.formGrid}>
              <div>
                <label style={styles.label}>Assignment Title</label>
                <input
                  style={styles.input}
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleFormChange}
                  placeholder="Enter assignment title"
                  required
                />
              </div>
              <div>
                <label style={styles.label}>Subject</label>
                <input
                  style={styles.input}
                  type="text"
                  name="subject"
                  value={teacherSubject}
                  readOnly
                  title="Subject is mapped to your teacher account"
                  required
                />
              </div>
              <div>
                <label style={styles.label}>Max Points</label>
                <input
                  style={styles.input}
                  type="number"
                  name="points"
                  value={form.points}
                  onChange={handleFormChange}
                  placeholder="100"
                />
              </div>
              <div>
                <label style={styles.label}>Due Date</label>
                <input
                  style={styles.input}
                  type="date"
                  name="dueDate"
                  value={form.dueDate}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div>
                <label style={styles.label}>Assignment File</label>
                <input
                  style={styles.input}
                  type="file"
                  onChange={(event) => setSelectedFile(event.target.files?.[0]?.name || '')}
                />
                {selectedFile ? <p style={styles.fileText}>Selected: {selectedFile}</p> : null}
              </div>
            </div>
            <div style={styles.publishRow}>
              {publishNotice ? <p style={styles.noticeText}>{publishNotice}</p> : null}
              <button style={styles.primaryBtn} type="submit">
                Publish Assignment
              </button>
            </div>
          </form>
        </section> : null}

        {activeMenu === 'dashboard' || activeMenu === 'assignments' ? <section style={styles.card}>
          <div style={styles.cardHeader}>Published Assignments</div>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Title</th>
                  <th style={styles.th}>Subject</th>
                  <th style={styles.th}>Due Date</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {assignments.length === 0 ? (
                  <tr>
                    <td style={styles.td} colSpan={5}>No published assignments.</td>
                  </tr>
                ) : (
                  assignments.map((item) => (
                    <tr key={item.id}>
                      <td style={styles.tdStrong}>{item.title}</td>
                      <td style={styles.td}>{item.subject}</td>
                      <td style={styles.td}>{item.dueDate}</td>
                      <td style={styles.td}>
                        <span
                          style={
                            item.status === 'pending'
                              ? styles.badgePending
                              : item.status === 'submitted'
                                ? styles.badgeSubmitted
                                : styles.badgeGraded
                          }
                        >
                          {item.status}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.actionGroup}>
                          <button type="button" style={styles.secondaryBtnSmall} onClick={() => handleStartEditAssignment(item)}>
                            Modify
                          </button>
                          <button type="button" style={styles.dangerBtnSmall} onClick={() => handleDeletePublishedAssignment(item.id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section> : null}

        {activeMenu === 'dashboard' || activeMenu === 'submissions' ? <section style={styles.card}>
          <div style={styles.tableHeader}>
            <p style={styles.tableTitle}>Recent Submissions</p>
            <div style={styles.searchBox}>
              <input
                style={styles.search}
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search..."
              />
              <button style={styles.filterBtn} type="button">
                Filter
              </button>
            </div>
          </div>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Student Name</th>
                  <th style={styles.th}>Assignment</th>
                  <th style={styles.th}>Submitted</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Grade</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((submission) => (
                  <tr key={submission.id}>
                    <td style={styles.tdStrong}>{submission.student}</td>
                    <td style={styles.td}>{submission.assignment}</td>
                    <td style={styles.td}>{submission.submitted}</td>
                    <td style={styles.td}>
                      <span style={submission.status !== 'graded' ? styles.badgePending : styles.badgeGraded}>
                        {submission.status !== 'graded' ? 'Pending Review' : 'Graded'}
                      </span>
                    </td>
                    <td style={styles.tdStrong}>
                      {submission.grade === '-' ? <span style={styles.muted}>-</span> : `${submission.grade}/100`}
                    </td>
                    <td style={styles.td}>
                      {submission.status !== 'graded' ? (
                        <button style={styles.primaryBtnSmall} type="button" onClick={() => handleGradeNow(submission)}>
                          Grade Now
                        </button>
                      ) : (
                        <button style={styles.secondaryBtnSmall} type="button" onClick={() => handleViewDetails(submission)}>
                          View Details
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section> : null}

        {activeMenu === 'students' ? <section style={styles.card}>
          <div style={styles.cardHeader}>Student List</div>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Roll No</th>
                  <th style={styles.th}>Section</th>
                  <th style={styles.th}>Pending Reviews</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td style={styles.tdStrong}>{student.name}</td>
                    <td style={styles.td}>{student.roll}</td>
                    <td style={styles.td}>{student.section}</td>
                    <td style={styles.td}>
                      {student.pending > 0 ? <span style={styles.badgePending}>{student.pending} Pending</span> : <span style={styles.badgeGraded}>Up to date</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section> : null}

        {editingAssignment ? (
          <div style={styles.modalOverlay}>
            <div style={styles.modalCard}>
              <p style={styles.modalTitle}>Modify Assignment</p>
              <p style={styles.modalSub}>Update published assignment details</p>
              <form onSubmit={handleSaveAssignment} style={styles.modalForm}>
                <label style={styles.label}>Assignment Title</label>
                <input
                  style={styles.input}
                  type="text"
                  name="title"
                  value={editingAssignment.title || ''}
                  onChange={handleEditAssignmentChange}
                  required
                />
                <label style={styles.label}>Subject</label>
                <input
                  style={styles.input}
                  type="text"
                  name="subject"
                  value={teacherSubject}
                  readOnly
                  title="Subject is mapped to your teacher account"
                  required
                />
                <label style={styles.label}>Due Date</label>
                <input
                  style={styles.input}
                  type="date"
                  name="dueDate"
                  value={editingAssignment.dueDate || ''}
                  onChange={handleEditAssignmentChange}
                  required
                />
                <label style={styles.label}>Max Points</label>
                <input
                  style={styles.input}
                  type="number"
                  name="points"
                  value={editingAssignment.points || '100'}
                  onChange={handleEditAssignmentChange}
                />
                <div style={styles.modalActions}>
                  <button type="button" style={styles.secondaryBtnSmall} onClick={handleCloseEditModal}>
                    Cancel
                  </button>
                  <button type="submit" style={styles.primaryBtnSmall}>
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}

        {gradingSubmission ? (
          <div style={styles.modalOverlay}>
            <div style={styles.modalCard}>
              <p style={styles.modalTitle}>Grade Submission</p>
              <p style={styles.modalSub}>
                {gradingSubmission.student} - {gradingSubmission.assignment}
              </p>
              <form onSubmit={handleSubmitGrade} style={styles.modalForm}>
                <label style={styles.label}>Grade (0-100)</label>
                <input
                  style={styles.input}
                  type="number"
                  min="0"
                  max="100"
                  value={gradeInput}
                  onChange={(event) => setGradeInput(event.target.value)}
                  required
                />
                <label style={styles.label}>Feedback</label>
                <textarea
                  style={styles.textArea}
                  value={feedbackInput}
                  onChange={(event) => setFeedbackInput(event.target.value)}
                  placeholder="Enter feedback"
                />
                <div style={styles.modalActions}>
                  <button type="button" style={styles.secondaryBtnSmall} onClick={handleCloseGradeModal}>
                    Cancel
                  </button>
                  <button type="submit" style={styles.primaryBtnSmall}>
                    Save Grade
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}

        {detailSubmission ? (
          <div style={styles.modalOverlay}>
            <div style={styles.modalCard}>
              <p style={styles.modalTitle}>Submission Details</p>
              <p style={styles.modalSub}>{detailSubmission.assignment}</p>
              <div style={styles.detailsGrid}>
                <p style={styles.detailRow}><strong>Student:</strong> {detailSubmission.student}</p>
                <p style={styles.detailRow}><strong>Submitted:</strong> {detailSubmission.submitted}</p>
                <p style={styles.detailRow}><strong>Uploaded File:</strong> {detailSubmission.fileName || '-'}</p>
                <p style={styles.detailRow}><strong>Status:</strong> {detailSubmission.status}</p>
                <p style={styles.detailRow}><strong>Grade:</strong> {detailSubmission.grade === '-' ? '-' : `${detailSubmission.grade}/100`}</p>
                <p style={styles.detailRow}><strong>Feedback:</strong> {detailSubmission.feedback || '-'}</p>
              </div>
              <div style={styles.modalActions}>
                <button type="button" style={styles.primaryBtnSmall} onClick={handleCloseDetailsModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        ) : null}

        </main>
      </div>
    </div>
  )
}

const styles = {
  page: {
    height: '100vh',
    display: 'grid',
    gridTemplateColumns: '240px 1fr',
    background: 'linear-gradient(180deg, #edf4ff 0%, #e6efff 100%)',
    position: 'relative',
    overflow: 'hidden'
  },
  sidebar: {
    background: '#ffffff',
    borderRight: '1px solid #dbeafe',
    display: 'flex',
    flexDirection: 'column',
    padding: 14,
    gap: 12,
    overflowY: 'auto'
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
    position: 'relative',
    overflowY: 'auto',
    background:
      'radial-gradient(circle at 12% 12%, rgba(96, 165, 250, 0.16), transparent 30%), radial-gradient(circle at 86% 84%, rgba(14, 165, 233, 0.14), transparent 34%), linear-gradient(135deg, #f9fbff 0%, #eef5ff 45%, #e8f0ff 100%)'
  },
  backgroundA: {
    position: 'absolute',
    right: -70,
    top: 30,
    width: 300,
    height: 300,
    borderRadius: 999,
    background: 'rgba(59,130,246,0.18)',
    filter: 'blur(34px)'
  },
  backgroundB: {
    position: 'absolute',
    left: -90,
    bottom: -60,
    width: 320,
    height: 320,
    borderRadius: 999,
    background: 'rgba(14,165,233,0.2)',
    filter: 'blur(36px)'
  },
  header: {
    position: 'relative',
    zIndex: 1,
    background: '#fff',
    borderBottom: '1px solid #dbeafe',
    padding: '20px 28px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap'
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
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginLeft: 'auto'
  },
  userText: {
    textAlign: 'right'
  },
  userName: {
    margin: 0,
    fontWeight: 700,
    fontSize: 14,
    whiteSpace: 'nowrap'
  },
  userSub: {
    margin: '3px 0 0',
    color: '#64748b',
    fontSize: 12
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 999,
    background: '#2563eb',
    color: '#fff',
    display: 'grid',
    placeItems: 'center',
    fontWeight: 700
  },
  main: {
    position: 'relative',
    zIndex: 1,
    padding: 24,
    display: 'grid',
    gap: 16
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 12
  },
  statCard: {
    background: '#fff',
    border: '1px solid #dbeafe',
    borderRadius: 12,
    padding: 16,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  statLabel: {
    margin: 0,
    color: '#475569',
    fontSize: 14
  },
  statValue: {
    margin: '8px 0 0',
    fontSize: 36,
    fontWeight: 700,
    color: '#0f172a'
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    color: '#fff',
    display: 'grid',
    placeItems: 'center',
    fontWeight: 700
  },
  card: {
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
  cardBody: {
    padding: 16
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: 14
  },
  label: {
    display: 'block',
    marginBottom: 6,
    fontSize: 14,
    fontWeight: 600,
    color: '#334155'
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    height: 40,
    border: '1px solid #cbd5e1',
    borderRadius: 8,
    padding: '0 12px',
    fontSize: 14
  },
  fileText: {
    margin: '6px 0 0',
    color: '#1d4ed8',
    fontSize: 12
  },
  publishRow: {
    marginTop: 14,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12
  },
  noticeText: {
    margin: 0,
    color: '#166534',
    fontSize: 13,
    fontWeight: 600
  },
  primaryBtn: {
    border: 'none',
    borderRadius: 8,
    height: 40,
    padding: '0 16px',
    background: '#2563eb',
    color: '#fff',
    fontWeight: 700,
    cursor: 'pointer'
  },
  tableHeader: {
    borderBottom: '1px solid #dbeafe',
    background: '#f8fbff',
    padding: '14px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center'
  },
  tableTitle: {
    margin: 0,
    fontWeight: 700,
    color: '#0f172a',
    fontSize: 18
  },
  searchBox: {
    display: 'flex',
    gap: 8
  },
  search: {
    width: 230,
    height: 36,
    border: '1px solid #cbd5e1',
    borderRadius: 8,
    padding: '0 10px'
  },
  filterBtn: {
    height: 36,
    border: '1px solid #bfdbfe',
    borderRadius: 8,
    background: '#eff6ff',
    color: '#1e3a8a',
    fontWeight: 700,
    padding: '0 10px',
    cursor: 'pointer'
  },
  tableWrap: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    minWidth: 820,
    borderCollapse: 'collapse'
  },
  th: {
    textAlign: 'left',
    borderBottom: '1px solid #dbeafe',
    padding: '12px 10px',
    color: '#475569',
    fontSize: 13
  },
  td: {
    borderBottom: '1px solid #e2e8f0',
    padding: '12px 10px',
    color: '#475569',
    fontSize: 14
  },
  tdStrong: {
    borderBottom: '1px solid #e2e8f0',
    padding: '12px 10px',
    color: '#0f172a',
    fontSize: 14,
    fontWeight: 600
  },
  badgePending: {
    display: 'inline-block',
    borderRadius: 999,
    background: '#e0f2fe',
    color: '#0369a1',
    padding: '4px 8px',
    fontSize: 12,
    fontWeight: 700
  },
  badgeSubmitted: {
    display: 'inline-block',
    borderRadius: 999,
    background: '#ede9fe',
    color: '#5b21b6',
    padding: '4px 8px',
    fontSize: 12,
    fontWeight: 700
  },
  badgeGraded: {
    display: 'inline-block',
    borderRadius: 999,
    background: '#dbeafe',
    color: '#1e40af',
    padding: '4px 8px',
    fontSize: 12,
    fontWeight: 700
  },
  muted: {
    color: '#94a3b8'
  },
  actionGroup: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap'
  },
  primaryBtnSmall: {
    border: 'none',
    borderRadius: 7,
    height: 32,
    padding: '0 11px',
    background: '#2563eb',
    color: '#fff',
    fontWeight: 700,
    cursor: 'pointer'
  },
  secondaryBtnSmall: {
    border: '1px solid #cbd5e1',
    borderRadius: 7,
    height: 32,
    padding: '0 11px',
    background: '#fff',
    color: '#334155',
    fontWeight: 700,
    cursor: 'pointer'
  },
  dangerBtnSmall: {
    border: '1px solid #fecaca',
    borderRadius: 7,
    height: 32,
    padding: '0 11px',
    background: '#fee2e2',
    color: '#b91c1c',
    fontWeight: 700,
    cursor: 'pointer'
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15, 23, 42, 0.45)',
    display: 'grid',
    placeItems: 'center',
    zIndex: 50,
    padding: 16
  },
  modalCard: {
    width: 'min(96vw, 520px)',
    background: '#fff',
    borderRadius: 12,
    border: '1px solid #dbeafe',
    boxShadow: '0 14px 30px rgba(15,23,42,0.24)',
    padding: 16
  },
  modalTitle: {
    margin: 0,
    fontSize: 20,
    fontWeight: 700,
    color: '#0f172a'
  },
  modalSub: {
    margin: '4px 0 12px',
    color: '#475569',
    fontSize: 14
  },
  modalForm: {
    display: 'grid',
    gap: 8
  },
  textArea: {
    width: '100%',
    boxSizing: 'border-box',
    minHeight: 90,
    border: '1px solid #cbd5e1',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    resize: 'vertical'
  },
  modalActions: {
    marginTop: 6,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 8
  },
  detailsGrid: {
    display: 'grid',
    gap: 6
  },
  detailRow: {
    margin: 0,
    color: '#334155',
    fontSize: 14
  }
}



