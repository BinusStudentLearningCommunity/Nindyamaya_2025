import React, { useState } from 'react'
import '../../pages/MentoringSessionPage/MentoringSessionPage.css'
import { useNavigate } from 'react-router-dom';

interface Session {
  id: number
  course: string
  date: string
  startTime: string
  endTime: string
  platform: string
}

const allSessions: Session[] = [
  {
    id: 1,
    course: 'Computer Network',
    date: '2025-03-07',
    startTime: '12:00',
    endTime: '14:00',
    platform: 'Zoom',
  },
  {
    id: 2,
    course: 'Review UAS Business Economics',
    date: '2025-02-07',
    startTime: '20:30',
    endTime: '22:00',
    platform: 'Google Meet',
  },
  {
    id: 3,
    course: 'Review UAS Management',
    date: '2025-02-07',
    startTime: '20:30',
    endTime: '22:00',
    platform: 'Google Meet',
  },
  {
    id: 4,
    course: 'Review UAS Accounting',
    date: '2025-02-07',
    startTime: '20:30',
    endTime: '22:00',
    platform: 'Zoom',
  },
  {
    id: 5,
    course: 'Bahas Contoh Soal UAS',
    date: '2025-02-07',
    startTime: '18:30',
    endTime: '20:00',
    platform: 'Discord',
  },
    {
    id: 6,
    course: 'Review UAS Data Structures',
    date: '2025-02-07',
    startTime: '18:00',
    endTime: '20:00',
    platform: 'Zoom',
  },
]

interface MentoringTableProps {
  role: 'mentor' | 'mentee';
}

const MentoringTable: React.FC<MentoringTableProps> = ({ role }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [rowsToShow, setRowsToShow] = useState(allSessions.length)
  const navigate = useNavigate();

  const filteredSessions = allSessions
    .filter((session) =>
      session.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.date.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .slice(0, rowsToShow)

  const handleViewDetails = () => {
    if (role === 'mentor') {
      navigate('/edit-session');
    } else {
      navigate('/session-attendance'); 
    }
  };

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
            <th className="col-course">COURSE</th>
            <th className="col-date">DATE</th>
            <th className="col-time">TIME</th>
            <th className="col-platform">PLATFORM</th>
            <th className="col-action">ACTION</th>
          </tr>
        </thead>
        <tbody>
          {filteredSessions.map((session, index) => (
            <tr key={session.id}>
              <td className="col-no">{index + 1}</td>
              <td className="col-course">{session.course}</td>
              <td className="col-date">{session.date}</td>
              <td className="col-time">{`${session.startTime} - ${session.endTime}`}</td>
              <td className="col-platform">{session.platform}</td>
              <td className="col-action">
                <button className="view-button" onClick={handleViewDetails}>View Details</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default MentoringTable
