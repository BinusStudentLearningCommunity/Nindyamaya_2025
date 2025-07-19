
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Home, BookOpen, User, Users, FilePlus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../CustomDialog';
import { Button } from '../../CustomButton';
import './Sidebar.css';

interface User {
  name: string;
  major: string;
}

interface SidebarProps {
  user: User;
  role: 'mentor' | 'mentee';
  allRoles: string[];
  onRoleChange?: (newRole: 'mentor' | 'mentee') => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, role, onRoleChange, isOpen = true, onToggle }) => {
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const navigate = useNavigate();
  
  const commonLinks = [
    { name: 'Home', path: '/', icon: <Home size={18} /> },
  ];

  const menteeLinks = [
    { name: 'Mentoring Session', path: '/mentoring-session', icon: <BookOpen size={18} /> },
  ];

  const mentorLinks = [
    { name: 'Create Session', path: '/create-session', icon: <FilePlus size={18} /> },
    { name: 'My Mentee', path: '/my-mentee', icon: <Users size={18} /> },
    { name: 'Mentoring Session', path: '/mentoring-session', icon: <BookOpen size={18} /> },
  ];

  const profileLinks = [
    { name: 'Profile Settings', path: '/profile', icon: <User size={18} /> },
  ];

  const mentoringLinks = role === 'mentor' ? mentorLinks : menteeLinks;

  // const handleRoleChange = () => {
  //   if (allRoles.length < 2) {
  //     toast.error("You are not eligible to switch roles.");
  //     return;
  //   }
  //   setShowRoleDialog(true);
  // };

  const confirmRoleChange = () => {
    const newRole = role === 'mentor' ? 'mentee' : 'mentor';
    onRoleChange?.(newRole);
    setShowRoleDialog(false);
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={onToggle} />
      )}
      
      <aside className={`sidebar ${isOpen ? 'is-open' : ''}`}>
        {/* Mobile close button */}

        <div className="sidebar-profile">
          <div className="profile-content">
            <div className="role-tag">{role}</div>
            <h3 className="profile-name">{user.name}</h3>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <span className="nav-section-title">USER</span>
            {commonLinks.map(link => (
              <NavLink to={link.path} key={link.name} className="nav-link" end onClick={onToggle}>
                {link.icon}
                <span>{link.name}</span>
              </NavLink>
            ))}
          </div>

          <div className="nav-section">
            <span className="nav-section-title">MENTORING</span>
            {mentoringLinks.map(link => (
              <NavLink to={link.path} key={link.name} className="nav-link" onClick={onToggle}>
                {link.icon}
                <span>{link.name}</span>
              </NavLink>
            ))}
          </div>

          <div className="nav-section">
            <span className="nav-section-title nav-section-title-last">PROFILE</span>
            {profileLinks.map(link => (
              <NavLink to={link.path} key={link.name} className="nav-link" onClick={onToggle}>
                {link.icon}
                <span>{link.name}</span>
              </NavLink>
            ))}
            {/* <button className="nav-link change-role-btn" onClick={handleRoleChange}>
              <UserCheck size={18} />
              <span>Change Role</span>
            </button> */}
          </div>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleSignOut} className="signout-button">
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Role Change Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent className="role-dialog">
          <DialogHeader>
            <DialogTitle className="role-dialog-title">Change Role</DialogTitle>
            <DialogDescription className="role-dialog-description">
              You are currently in <span className="current-role">{role}</span> role.
              <br />
              Would you like to switch to <span className="target-role">{role === 'mentor' ? 'Mentee' : 'Mentor'}</span> role?
            </DialogDescription>
          </DialogHeader>
          <div className="role-dialog-actions">
            <Button 
              variant="destructive" 
              onClick={() => setShowRoleDialog(false)}
              className="cancel-btn"
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmRoleChange}
              className="confirm-btn"
            >
              Switch to {role === 'mentor' ? 'Mentee' : 'Mentor'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Sidebar;
