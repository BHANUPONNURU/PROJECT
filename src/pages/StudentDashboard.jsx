import React, { useMemo, useState } from 'react'

const fallbackAssignments = []
const fallbackSubmissions = []

export default function StudentDashboard({ onNavigate, onLogout, assignments = fallbackAssignments, submissions = fallbackSubmissions, onSubmitAssignment, user }) {
  const [activeMenu, setActiveMenu] = useState('dashboard')
  const [query, setQuery] = useState('')
  const [selectedFiles, setSelectedFiles] = useState({})
  const [uploadErrors, setUploadErrors] = useState({})
  const [detailRow, setDetailRow] = useState(null)
  const displayName = user?.userId || user?.fullName || 'Student'
  const displayId = user?.userId || '-'
  const avatarText = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'ST'

  const assignmentRows = useMemo(() => {
    const ownSubmissions = submissions.filter((item) => (item.studentId || item.student) === displayId)
    const submissionMap = new Map()
    ownSubmissions.forEach((item) => {
      if (!submissionMap.has(item.assignmentId)) {
        submissionMap.set(item.assignmentId, item)
      }
    })

    return assignments.map((assignment) => {
      const ownSubmission = submissionMap.get(assignment.id)
      const status = ownSubmission ? (ownSubmission.status === 'graded' ? 'graded' : 'submitted') : 'pending'
      const score = ownSubmission?.grade && ownSubmission.grade !== '-' ? `${ownSubmission.grade}/100` : '-'
      return {
        ...assignment,
        status,
        score,
        feedback: ownSubmission?.feedback || '-',
        fileName: ownSubmission?.fileName || '-',
        submittedAt: ownSubmission?.submitted || '-'
      }
    })
  }, [assignments, submissions, displayId])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return assignmentRows
    return assignmentRows.filter((a) =>
      `${a.title} ${a.subject} ${a.dueDate} ${a.status}`.toLowerCase().includes(q)
    )
  }, [assignmentRows, query])

  const pendingCount = assignmentRows.filter((a) => a.status === 'pending').length
  const submittedCount = assignmentRows.filter((a) => a.status === 'submitted').length
  const gradedCount = assignmentRows.filter((a) => a.status === 'graded').length

  const titleMap = {
    dashboard: 'Student Dashboard',
    assignments: 'Assignments',
    progress: 'Progress',
    profile: 'Profile'
  }

  const subTitleMap = {
    dashboard: 'Track assignments and monitor your academic progress',
    assignments: 'View and submit pending assignments',
    progress: 'Review grades and submission history',
    profile: 'Student account information'
  }

  const handleFilePick = (id, file) => {
    setSelectedFiles((prev) => ({ ...prev, [id]: file?.name || '' }))
    setUploadErrors((prev) => ({ ...prev, [id]: '' }))
  }

  const handleUpload = (id) => {
    const fileName = selectedFiles[id]
    if (!fileName) {
      setUploadErrors((prev) => ({ ...prev, [id]: 'Please choose a file before uploading.' }))
      return
    }
    setUploadErrors((prev) => ({ ...prev, [id]: '' }))
    onSubmitAssignment?.(id, fileName)
    setSelectedFiles((prev) => ({ ...prev, [id]: '' }))
  }

  const handleViewDetails = (row) => {
    setDetailRow(row)
  }

  const handleCloseDetails = () => {
    setDetailRow(null)
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
            onClick={() => setActiveMenu('progress')}
            style={{ ...styles.menuItem, ...(activeMenu === 'progress' ? styles.menuItemActive : {}) }}
          >
            Progress
          </button>
          <button
            type="button"
            onClick={() => setActiveMenu('profile')}
            style={{ ...styles.menuItem, ...(activeMenu === 'profile' ? styles.menuItemActive : {}) }}
          >
            Profile
          </button>
        </nav>

        <button style={styles.sidebarLogout} type="button" onClick={onLogout}>
          Logout
        </button>
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
              <p style={styles.userSub}>{displayId}</p>
            </div>
            <div style={styles.avatar}>{avatarText}</div>
          </div>
        </header>

        <main style={styles.main}>
          {activeMenu === 'dashboard' ? (
            <section style={styles.statsGrid}>
              <article style={styles.statCard}>
                <p style={styles.statLabel}>Total Assignments</p>
                <p style={styles.statValue}>{assignmentRows.length}</p>
              </article>
              <article style={styles.statCard}>
                <p style={styles.statLabel}>Pending</p>
                <p style={styles.statValue}>{pendingCount}</p>
              </article>
              <article style={styles.statCard}>
                <p style={styles.statLabel}>Submitted</p>
                <p style={styles.statValue}>{submittedCount}</p>
              </article>
              <article style={styles.statCard}>
                <p style={styles.statLabel}>Graded</p>
                <p style={styles.statValue}>{gradedCount}</p>
              </article>
            </section>
          ) : null}

          {activeMenu === 'dashboard' || activeMenu === 'assignments' ? (
            <section style={styles.card}>
              <div style={styles.tableHeader}>
                <p style={styles.tableTitle}>Assignment List</p>
                <input
                  style={styles.search}
                  placeholder="Search..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
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
                    {filtered.map((a) => (
                      <tr key={a.id}>
                        <td style={styles.tdStrong}>{a.title}</td>
                        <td style={styles.td}>{a.subject}</td>
                        <td style={styles.td}>{a.dueDate}</td>
                        <td style={styles.td}>
                          <span
                            style={
                              a.status === 'pending'
                                ? styles.badgePending
                                : a.status === 'submitted'
                                  ? styles.badgeSubmitted
                                  : styles.badgeGraded
                            }
                          >
                            {a.status}
                          </span>
                        </td>
                        <td style={styles.td}>
                          {a.status === 'pending' ? (
                            <div style={styles.uploadWrap}>
                              <div style={styles.uploadCell}>
                                <input
                                  style={styles.fileInput}
                                  type="file"
                                  onChange={(event) => handleFilePick(a.id, event.target.files?.[0])}
                                />
                                <button
                                  style={{
                                    ...styles.primaryBtnSmall,
                                    ...(selectedFiles[a.id] ? {} : styles.primaryBtnDisabled)
                                  }}
                                  type="button"
                                  onClick={() => handleUpload(a.id)}
                                  disabled={!selectedFiles[a.id]}
                                >
                                  Upload
                                </button>
                              </div>
                              {uploadErrors[a.id] ? <p style={styles.uploadError}>{uploadErrors[a.id]}</p> : null}
                            </div>
                          ) : (
                            <button style={styles.secondaryBtnSmall} type="button" onClick={() => handleViewDetails(a)}>
                              View
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          {activeMenu === 'progress' ? (
            <section style={styles.card}>
              <div style={styles.cardHeader}>Grade Overview</div>
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Assignment</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Score</th>
                      <th style={styles.th}>Feedback</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignmentRows.map((a) => (
                      <tr key={a.id}>
                        <td style={styles.tdStrong}>{a.title}</td>
                        <td style={styles.td}>{a.status}</td>
                        <td style={styles.tdStrong}>{a.score}</td>
                        <td style={styles.td}>{a.feedback || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          {activeMenu === 'profile' ? (
            <section style={styles.card}>
              <div style={styles.cardHeader}>Student Profile</div>
              <div style={styles.profileBody}>
                <p style={styles.profileText}>Name: {user?.fullName || '-'}</p>
                <p style={styles.profileText}>Student ID: {displayId}</p>
                <p style={styles.profileText}>Email: {user?.email || '-'}</p>
                <p style={styles.profileText}>Role: Student</p>
              </div>
            </section>
          ) : null}

          {detailRow ? (
            <div style={styles.modalOverlay}>
              <div style={styles.modalCard}>
                <p style={styles.modalTitle}>Submission Details</p>
                <div style={styles.detailsGrid}>
                  <p style={styles.detailRow}><strong>Assignment:</strong> {detailRow.title}</p>
                  <p style={styles.detailRow}><strong>Subject:</strong> {detailRow.subject}</p>
                  <p style={styles.detailRow}><strong>Due Date:</strong> {detailRow.dueDate}</p>
                  <p style={styles.detailRow}><strong>Status:</strong> {detailRow.status}</p>
                  <p style={styles.detailRow}><strong>Submitted:</strong> {detailRow.submittedAt}</p>
                  <p style={styles.detailRow}><strong>Uploaded File:</strong> {detailRow.fileName}</p>
                  <p style={styles.detailRow}><strong>Grade:</strong> {detailRow.score}</p>
                  <p style={styles.detailRow}><strong>Feedback:</strong> {detailRow.feedback || '-'}</p>
                </div>
                <div style={styles.modalActions}>
                  <button type="button" style={styles.primaryBtnSmall} onClick={handleCloseDetails}>
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
    gap: 12
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
    gap: 10
  },
  userText: {
    textAlign: 'right'
  },
  userName: {
    margin: 0,
    fontWeight: 700,
    fontSize: 14
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
    padding: 16
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
  search: {
    width: 230,
    height: 36,
    border: '1px solid #cbd5e1',
    borderRadius: 8,
    padding: '0 10px'
  },
  tableWrap: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    minWidth: 760,
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
  uploadCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 8
  },
  uploadWrap: {
    display: 'grid',
    gap: 4
  },
  fileInput: {
    maxWidth: 180,
    fontSize: 12
  },
  primaryBtnDisabled: {
    opacity: 0.55,
    cursor: 'not-allowed'
  },
  uploadError: {
    margin: 0,
    color: '#b91c1c',
    fontSize: 12,
    fontWeight: 600
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
  detailsGrid: {
    display: 'grid',
    gap: 6,
    marginTop: 10
  },
  detailRow: {
    margin: 0,
    color: '#334155',
    fontSize: 14
  },
  modalActions: {
    marginTop: 12,
    display: 'flex',
    justifyContent: 'flex-end'
  },
  profileBody: {
    padding: 16
  },
  profileText: {
    margin: '0 0 10px',
    color: '#334155'
  },
}
