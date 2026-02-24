import React, { useEffect, useState } from 'react'
import Login from './pages/Login'
import StudentDashboard from './pages/StudentDashboard'
import TeacherDashboard from './pages/TeacherDashboard'
import SubmitAssignment from './pages/SubmitAssignment'
import GradePanel from './pages/GradePanel'

const initialAssignments = []

const initialSubmissions = []
const ASSIGNMENTS_STORAGE_KEY = 'assignmate_assignments_v1'
const SUBMISSIONS_STORAGE_KEY = 'assignmate_submissions_v1'

const normalizeTeacherKey = (value) => String(value || '').trim().toLowerCase()

const loadStoredList = (storageKey, fallback) => {
  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

export default function App() {
  const [session, setSession] = useState({
    isLoggedIn: false,
    role: 'student',
    user: { fullName: '', userId: '', email: '', subject: '' }
  })
  const [view, setView] = useState('dashboard')
  const [assignments, setAssignments] = useState(() =>
    loadStoredList(ASSIGNMENTS_STORAGE_KEY, initialAssignments)
  )
  const [submissions, setSubmissions] = useState(() =>
    loadStoredList(SUBMISSIONS_STORAGE_KEY, initialSubmissions)
  )

  useEffect(() => {
    setAssignments((prev) =>
      prev.map((item) => {
        const teacherId = String(item.teacherId || '').trim()
        const ownerKey = normalizeTeacherKey(item.ownerKey || teacherId)
        if (item.ownerKey === ownerKey && item.teacherId === teacherId && item.status) return item
        return {
          ...item,
          teacherId,
          ownerKey,
          status: item.status || 'published'
        }
      })
    )
  }, [])

  useEffect(() => {
    window.localStorage.setItem(ASSIGNMENTS_STORAGE_KEY, JSON.stringify(assignments))
  }, [assignments])

  useEffect(() => {
    window.localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(submissions))
  }, [submissions])

  const handleLogin = (credentials) => {
    const role = credentials?.role === 'teacher' ? 'teacher' : 'student'
    setSession({
      isLoggedIn: true,
      role,
      user: {
        fullName: credentials?.fullName || credentials?.username || '',
        userId: credentials?.username || '',
        email: credentials?.email || '',
        subject: credentials?.subject || ''
      }
    })
    setView('dashboard')
  }

  const handleLogout = () => {
    setSession({
      isLoggedIn: false,
      role: 'student',
      user: { fullName: '', userId: '', email: '', subject: '' }
    })
    setView('dashboard')
  }

  const handleNavigate = (nextView) => {
    if (!nextView) return
    setView(nextView)
  }

  const handlePublishAssignment = (assignment) => {
    const title = assignment?.title?.trim()
    if (!title || !assignment?.dueDate) return false
    const teacherId = String(session.user?.userId || '').trim()
    const ownerKey = normalizeTeacherKey(teacherId)
    const teacherName = session.user?.fullName || teacherId || 'Teacher'
    const teacherSubject = session.user?.subject || ''
    setAssignments((prev) => {
      const nextId = prev.length > 0 ? Math.max(...prev.map((item) => item.id)) + 1 : 1
      return [
        {
          id: nextId,
          title,
          subject: teacherSubject || assignment.subject || 'General',
          dueDate: assignment.dueDate,
          points: assignment.points || '100',
          teacherId,
          teacherName,
          ownerKey,
          status: 'published'
        },
        ...prev
      ]
    })
    return true
  }

  const handleUpdateAssignment = (updatedAssignment) => {
    if (!updatedAssignment?.id) return
    setAssignments((prev) =>
      prev.map((item) =>
        item.id === updatedAssignment.id
          ? {
              ...item,
              title: updatedAssignment.title,
              subject: updatedAssignment.subject,
              dueDate: updatedAssignment.dueDate,
              points: updatedAssignment.points
            }
          : item
      )
    )

    setSubmissions((prev) =>
      prev.map((item) =>
        item.assignmentId === updatedAssignment.id
          ? { ...item, assignment: updatedAssignment.title }
          : item
      )
    )
  }

  const handleDeleteAssignment = (assignmentId) => {
    if (!assignmentId) return
    setAssignments((prev) => prev.filter((item) => item.id !== assignmentId))
    setSubmissions((prev) => prev.filter((item) => item.assignmentId !== assignmentId))
  }

  const handleStudentSubmit = (id, fileName) => {
    const studentId = session.user?.userId || 'Student'
    const studentName = session.user?.fullName || studentId
    const submittedAssignment = assignments.find((item) => item.id === id)

    if (!submittedAssignment) return

    setSubmissions((prev) => {
      const existing = prev.find(
        (item) => item.assignmentId === submittedAssignment.id && (item.studentId || item.student) === studentId
      )
      if (existing) {
        return prev.map((item) =>
          item.id === existing.id
            ? {
                ...item,
                assignment: submittedAssignment.title,
                subject: submittedAssignment.subject || item.subject || 'General',
                teacherId: submittedAssignment.teacherId || item.teacherId || '',
                teacherName: submittedAssignment.teacherName || item.teacherName || '',
                submitted: 'Just now',
                status: 'submitted',
                grade: '-',
                feedback: '-',
                fileName: fileName || '-'
              }
            : item
        )
      }
      const nextId = prev.length > 0 ? Math.max(...prev.map((item) => item.id)) + 1 : 1
      return [
        {
          id: nextId,
          assignmentId: submittedAssignment.id,
          student: studentName,
          studentId,
          assignment: submittedAssignment.title,
          subject: submittedAssignment.subject || 'General',
          teacherId: submittedAssignment.teacherId || '',
          teacherName: submittedAssignment.teacherName || '',
          submitted: 'Just now',
          status: 'submitted',
          grade: '-',
          feedback: '-',
          fileName: fileName || '-'
        },
        ...prev
      ]
    })
  }

  const handleGradeSubmission = (id, grade, feedback) => {
    setSubmissions((prev) => prev.map((item) => {
      if (item.id === id) {
        return { ...item, status: 'graded', grade: String(grade), feedback: feedback || '-' }
      }
      return item
    }))
  }

  if (!session.isLoggedIn) {
    return <Login onLogin={handleLogin} />
  }

  const normalize = (value) => String(value || '').trim().toLowerCase()

  const teacherAssignments = assignments.filter((item) => {
    const currentTeacherId = String(session.user?.userId || '').trim()
    const currentTeacherKey = normalizeTeacherKey(currentTeacherId)
    const currentSubject = session.user?.subject
    const itemOwnerKey = normalizeTeacherKey(item.ownerKey || item.teacherId)
    if (itemOwnerKey) return itemOwnerKey === currentTeacherKey
    if (item.teacherId) return normalizeTeacherKey(item.teacherId) === currentTeacherKey
    if (currentSubject) return normalize(item.subject) === normalize(currentSubject)
    return true
  })

  const teacherSubmissions = submissions.filter((item) => {
    const currentTeacherId = String(session.user?.userId || '').trim()
    const currentTeacherKey = normalizeTeacherKey(currentTeacherId)
    const currentSubject = session.user?.subject
    if (item.teacherId) return normalizeTeacherKey(item.teacherId) === currentTeacherKey
    if (currentSubject) return normalize(item.subject) === normalize(currentSubject)
    return true
  })

  if (session.role === 'teacher') {
    if (view === 'grade') {
      return <GradePanel onNavigate={handleNavigate} onLogout={handleLogout} />
    }
    return (
      <TeacherDashboard
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        onPublishAssignment={handlePublishAssignment}
        onUpdateAssignment={handleUpdateAssignment}
        onDeleteAssignment={handleDeleteAssignment}
        submissions={teacherSubmissions}
        onGradeSubmission={handleGradeSubmission}
        assignments={teacherAssignments}
        user={session.user}
      />
    )
  }

  if (view === 'submit') {
    return <SubmitAssignment onNavigate={handleNavigate} onLogout={handleLogout} />
  }

  return (
    <StudentDashboard
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      assignments={assignments}
      submissions={submissions}
      onSubmitAssignment={handleStudentSubmit}
      user={session.user}
    />
  )
}
