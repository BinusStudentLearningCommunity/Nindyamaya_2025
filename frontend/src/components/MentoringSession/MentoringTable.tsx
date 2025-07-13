import React, { useState } from 'react'
import '../../pages/MentoringSessionPage/MentoringSessionPage.css'

interface Session {
  id: number
  mentor: string
  mentee: string
  date: string
  course: string
}

const allSessions: Session[] = [
  {
    id: 1,
    mentor: 'Made Abhirama Adwitya Kartika 2702222812',
    mentee: 'Nama Mentee\nNIM',
    date: '2025-03-07 12:27:20',
    course: 'Computer Network',
  },
  {
    id: 2,
    mentor: 'Nicholas Tanuwijaya 2602084350',
    mentee: 'Nama Mentee\nNIM',
    date: '2025-02-07 20:34:35',
    course: 'Review UAS Business Economics',
  },
  {
    id: 3,
    mentor: 'Nicholas Tanuwijaya 2602084350',
    mentee: 'Nama Mentee\nNIM',
    date: '2025-02-07 20:32:43',
    course: 'Review UAS Management',
  },
  {
    id: 4,
    mentor: 'Nicholas Tanuwijaya 2602084350',
    mentee: 'Nama Mentee\nNIM',
    date: '2025-02-07 20:30:39',
    course: 'Review UAS Accounting',
  },
  {
    id: 5,
    mentor: 'Nicholas Sinclair Alfianto 2702208581',
    mentee: 'Nama Mentee\nNIM',
    date: '2025-02-07 18:22:35',
    course: 'Bahas Contoh Soal UAS',
  },
]

const MentoringTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [rowsToShow, setRowsToShow] = useState(allSessions.length)

  const filteredSessions = allSessions
    .filter((session) =>
      session.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.mentor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.mentee.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .slice(0, rowsToShow)

  return (
    <div className="table-wrapper">
      <div className="table-controls">
        <div className="show-control">
          <label htmlFor="show" className="show-label">Show</label>
          <select
            id="show"
            value={rowsToShow}
            onChange={(e) => setRowsToShow(parseInt(e.target.value))}
            className='show-select'
          >
            {[5, 10, 15, 20].map((num) => (
              <option key={num} value={num}>{num}</option>
            ))}
            <option value={allSessions.length}>All</option>
          </select>
        </div>

        <div className="search-control">
          <label htmlFor="search" className="visually-hidden">Search</label>
          <input
            type="text"
            id="search"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

      </div>

      <table className="mentoring-table">
        <thead>
          <tr>
            <th className="col-no">NO</th>
            <th className="col-mentor">MENTOR</th>
            <th className="col-mentee">MENTEE</th>
            <th className="col-course">COURSE</th>
            <th className="col-action">ACTION</th>
          </tr>
        </thead>
        <tbody>
          {filteredSessions.map((session) => (
            <tr key={session.id}>
              <td className="col-no">{session.id}</td>
              <td className="col-mentor">
                {session.mentor}
                <br />
                {session.date}
              </td>
              <td className="col-mentee" style={{ whiteSpace: 'pre-line' }}>
                {session.mentee}
              </td>
              <td className="col-course">{session.course}</td>
              <td className="col-action">
                <button className="view-button">View Details</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default MentoringTable
