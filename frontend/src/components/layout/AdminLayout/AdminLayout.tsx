import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import AdminSidebar from '../AdminSidebar/AdminSidebar';
import '../MainLayout.css'; // We can reuse the main layout styles

const AdminLayout = () => {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      // Security Check: If the user is not an admin, log them out and redirect.
      if (parsedUser.role !== 'admin') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        setUser(parsedUser);
      }
    } else {
        // If no user is stored, redirect to login
        navigate('/login');
    }
  }, [navigate]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Render nothing until the user check is complete
  if (!user) {
    return null; 
  }

  return (
    <div className="main-layout">
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
            {/* SVG for hamburger icon */}
          </button>
        </div>
      )}

      <div className="layout-content">
        <AdminSidebar
          user={user}
          isOpen={sidebarOpen}
          onToggle={toggleSidebar}
        />
        <main className="main-content">
          <div className="page-content">
            <Outlet context={{ user }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;