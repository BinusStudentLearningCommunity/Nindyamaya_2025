
import React from 'react';
import './Navbar.css';
import HamburgerMenu from '../../HamburgerMenu';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  return (
    <header className="navbar">
      <div className="navbar-left">
        <HamburgerMenu onClick={onToggleSidebar || (() => {})} />
        <div className="bslc-logo">
          <img src="../../../../assets/03. BSLC-Logo-Navbar.svg" alt="BSLC" />
        </div>
        <div className="navbar-brand">
          <span className="brand-nindya">NINDYA</span>
          <span className="brand-maya">MAYA</span>
        </div>
      </div>
      <div className="navbar-community">
        <span className="community-binus">BINUS</span>
        <span className="community-text"> Student Learning Community</span>
      </div>
    </header>
  );
};

export default Navbar;
