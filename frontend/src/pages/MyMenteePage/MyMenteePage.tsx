import React, { useState, useEffect } from 'react';
import './MyMenteePage.css';
import axios from 'axios';

interface Mentee {
  user_id: number;
  name: string;
  nim: string;
  email: string;
  faculty: string;
}

const MyMenteePage: React.FC = () => {
  const [mentees, setMentees] = useState<Mentee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showEntries, setShowEntries] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchMentees = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Autentikasi gagal.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('/api/users/my-mentees', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMentees(response.data);
      } catch {
        setError("Gagal mengambil data mentee.");
      } finally {
        setLoading(false);
      }
    };

    fetchMentees();
  }, []);

  const filteredMentees = mentees.filter(mentee =>
    mentee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentee.nim.includes(searchTerm) ||
    mentee.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedMentees = filteredMentees.slice(0, showEntries);

  if (loading) {
    return <div className="my-mentee-page"><h1 className="page-title">My Mentee</h1><div className="mentee-content"><p>Loading...</p></div></div>;
  }

  if (error) {
    return <div className="my-mentee-page"><h1 className="page-title">My Mentee</h1><div className="mentee-content"><p>{error}</p></div></div>;
  }

  return (
    <div className="my-mentee-page">
      <h1 className="page-title">My Mentee</h1>
      
      <div className="mentee-content">
        <div className="table-controls">
          <div className="show-entries">
            <label htmlFor="show-select">Show</label>
            <select 
              id="show-select"
              value={showEntries} 
              onChange={(e) => setShowEntries(Number(e.target.value))}
              className="show-select"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={mentees.length}>All</option>
            </select>
            <span>entries</span>
          </div>
          
          <div className="search-container">
            <label htmlFor="search-input">Search:</label>
            <input
              id="search-input"
              type="text"
              placeholder="Search mentee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="table-container">
          <table className="mentee-table">
            <thead>
              <tr>
                <th>NO</th>
                <th>NAME</th>
                <th>NIM</th>
                <th>EMAIL</th>
                <th>FACULTY</th>
              </tr>
            </thead>
            <tbody>
              {displayedMentees.length > 0 ? (
                displayedMentees.map((mentee, index) => (
                  <tr key={mentee.user_id}>
                    <td>{index + 1}</td>
                    <td className="name-cell">{mentee.name}</td>
                    <td>{mentee.nim}</td>
                    <td className="email-cell">{mentee.email}</td>
                    <td>{mentee.faculty}</td>
                  </tr>
                ))
              ) : (
                <tr className="no-results">
                  <td colSpan={5}>
                    {searchTerm ? "No mentees found matching your search." : "You have no mentees assigned for this semester."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-info">
          <span>
            Showing {displayedMentees.length} of {filteredMentees.length} entries
            {searchTerm && ` (filtered from ${mentees.length} total entries)`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MyMenteePage;