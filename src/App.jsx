import React, { useState } from 'react'
import Login from './pages/Login'
import StudentDashboard from './pages/StudentDashboard'
import TeacherDashboard from './pages/TeacherDashboard'
import SubmitAssignment from './pages/SubmitAssignment'
import GradePanel from './pages/GradePanel'

const initialAssignments = []

const initialSubmissions = []

export default function App() {
  const [session, setSession] = useState({
    isLoggedIn: false,
    role: 'student',
    user: { fullName: '', userId: '', email: '' }
  })
  const [view, setView] = useState('dashboard')
  const [assignments, setAssignments] = useState(initialAssignments)
  const [submissions, setSubmissions] = useState(initialSubmissions)

  const handleLogin = (credentials) => {
    const role = credentials?.role === 'teacher' ? 'teacher' : 'student'
    setSession({
      isLoggedIn: true,
      role,
      user: {
        fullName: credentials?.fullName || credentials?.username || '',
        userId: credentials?.username || '',
        email: credentials?.email || ''
      }
    })
    setView('dashboard')
  }

  const handleLogout = () => {
    setSession({
      isLoggedIn: false,
      role: 'student',
      user: { fullName: '', userId: '', email: '' }
    })
    setView('dashboard')
  }

  const handleNavigate = (nextView) => {
    if (!nextView) return
    setView(nextView)
  }

  const handlePublishAssignment = (assignment) => {
    if (!assignment?.title || !assignment?.dueDate) return
    setAssignments((prev) => {
      const nextId = prev.length > 0 ? Math.max(...prev.map((item) => item.id)) + 1 : 1
      return [
        {
          id: nextId,
          title: assignment.title,
          subject: assignment.subject || 'General',
          dueDate: assignment.dueDate,
          points: assignment.points || '100'
        },
        ...prev
      ]
    })
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
            ? { ...item, submitted: 'Just now', status: 'submitted', grade: '-', feedback: '-', fileName: fileName || '-' }
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
        submissions={submissions}
        onGradeSubmission={handleGradeSubmission}
        assignments={assignments}
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
