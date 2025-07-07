
import React from 'react';
import './CustomButton.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'default', 
  className = '', 
  children, 
  ...props 
}) => {
  return (
    <button 
      className={`custom-button custom-button--${variant} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
