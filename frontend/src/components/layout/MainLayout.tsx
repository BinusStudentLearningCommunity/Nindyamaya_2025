
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar/Sidebar';
import Navbar from './Navbar/Navbar';
import { useState, useEffect } from 'react';
import './MainLayout.css';

const MainLayout = () => {
  const [user, setUser] = useState(null);
  const [viewingRole, setViewingRole] = useState<'mentor' | 'mentee'>('mentee');
  const [allRoles, setAllRoles] = useState<string[]>([]);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const fetchRoles = async () => {
      if (token) {
        try {
          const res = await fetch('/api/users/roles', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setViewingRole(data.currentRole);
            setAllRoles(data.allRoles);      
          }
        } catch (error) {
          console.error("Failed to fetch roles", error);
        }
      }
    };

    fetchRoles();
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="main-layout">
      {/* Hide navbar on mobile */}
      <div className="hidden lg:block">
        <Navbar onToggleSidebar={toggleSidebar} />
      </div>
      
      {!sidebarOpen && (
        <div className="lg:hidden fixed top-4 left-4 z-50">
          <button 
            className="hamburger-menu"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" x2="20" y1="6" y2="6"/>
              <line x1="4" x2="20" y1="12" y2="12"/>
              <line x1="4" x2="20" y1="18" y2="18"/>
            </svg>
          </button>
        </div>
      )}

      <div className="layout-content">
        {user && (
          <Sidebar
            user={user}
            role={viewingRole}
            allRoles={allRoles}
            onRoleChange={setViewingRole}
            isOpen={sidebarOpen}
            onToggle={toggleSidebar}
          />
        )}
        <main className="main-content">
          <div className="page-content">
            <Outlet context={{ role: viewingRole }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
