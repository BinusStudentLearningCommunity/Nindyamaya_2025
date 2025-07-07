
import React from 'react';
import { Menu } from 'lucide-react';

interface HamburgerMenuProps {
  onClick: () => void;
  className?: string;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ onClick, className = '' }) => {
  return (
    <button 
      className={`hamburger-menu ${className}`}
      onClick={onClick}
      aria-label="Toggle sidebar menu"
    >
      <Menu size={24} />
    </button>
  );
};

export default HamburgerMenu;
