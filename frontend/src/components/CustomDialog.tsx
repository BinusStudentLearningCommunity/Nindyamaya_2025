
import React from 'react';
import './CustomDialog.css';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

interface DialogContentProps {
  className?: string;
  children: React.ReactNode;
}

interface DialogHeaderProps {
  children: React.ReactNode;
}

interface DialogTitleProps {
  className?: string;
  children: React.ReactNode;
}

interface DialogDescriptionProps {
  className?: string;
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return (
    <div className="dialog-overlay" onClick={() => onOpenChange(false)}>
      {children}
    </div>
  );
};

export const DialogContent: React.FC<DialogContentProps> = ({ className = '', children }) => {
  return (
    <div className={`dialog-content ${className}`} onClick={(e) => e.stopPropagation()}>
      {children}
    </div>
  );
};

export const DialogHeader: React.FC<DialogHeaderProps> = ({ children }) => {
  return <div className="dialog-header">{children}</div>;
};

export const DialogTitle: React.FC<DialogTitleProps> = ({ className = '', children }) => {
  return <h2 className={`dialog-title ${className}`}>{children}</h2>;
};

export const DialogDescription: React.FC<DialogDescriptionProps> = ({ className = '', children }) => {
  return <p className={`dialog-description ${className}`}>{children}</p>;
};
