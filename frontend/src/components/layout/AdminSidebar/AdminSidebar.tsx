import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Home, Calendar, Users, Link as LinkIcon } from 'lucide-react';
import '../Sidebar/Sidebar.css'; // Reuse sidebar styles

interface User {
  name: string;
}

interface AdminSidebarProps {
  user: User;
  isOpen?: boolean;
  onToggle?: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ user, isOpen = true, onToggle }) => {
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <Home size={18} /> },
    { name: 'Semesters', path: '/admin/semesters', icon: <Calendar size={18} /> },
    { name: 'User Roles', path: '/admin/roles', icon: <Users size={18} /> },
    { name: 'Pairing', path: '/admin/pairing', icon: <LinkIcon size={18} /> },
  ];

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onToggle} />}
      <aside className={`sidebar ${isOpen ? 'is-open' : ''}`}>
        <div className="sidebar-profile">
          <div className="profile-content">
            <div className="role-tag" style={{ backgroundColor: '#e74c3c' }}>Admin</div>
            <h3 className="profile-name">{user.name}</h3>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <span className="nav-section-title">MANAGEMENT</span>
            {adminLinks.map(link => (
              <NavLink to={link.path} key={link.name} className="nav-link" end onClick={onToggle}>
                {link.icon}
                <span>{link.name}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleSignOut} className="signout-button">
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;