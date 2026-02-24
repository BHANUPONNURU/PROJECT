import React from 'react'
import './StudentList.css'

const students = [
  { name: 'Rahul Sharma', rollNo: '23CSE101', section: 'CSE-A', pendingReviews: 2 },
  { name: 'Ananya Singh', rollNo: '23CSE118', section: 'CSE-A', pendingReviews: 0 },
  { name: 'Arjun Kumar', rollNo: '23CSE127', section: 'CSE-B', pendingReviews: 1 },
  { name: 'Priya Patel', rollNo: '23CSE136', section: 'CSE-B', pendingReviews: 0 }
]

export default function StudentList() {
  return (
    <section className="student-list-page">
      <div className="student-list-container">
        <header className="student-list-header">
          <h2>AssignMate Student Performance</h2>
          <p>Academic dashboard view for assignment review tracking</p>
        </header>

        <div className="student-list-card">
          <div className="student-list-table-wrap">
            <table className="student-list-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Roll No</th>
                  <th>Section</th>
                  <th>Pending Reviews</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const isPending = student.pendingReviews > 0
                  return (
                    <tr key={student.rollNo}>
                      <td>{student.name}</td>
                      <td>{student.rollNo}</td>
                      <td>{student.section}</td>
                      <td>
                        <span className={`status-badge ${isPending ? 'pending' : 'completed'}`}>
                          {isPending ? `Pending (${student.pendingReviews})` : 'Completed'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
