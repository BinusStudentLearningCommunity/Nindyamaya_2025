import React from 'react';
import { Link } from 'react-router-dom';
import './NotFoundPage.css';

const NotFoundPage: React.FC = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-container">
        <h1 className="error-code">404</h1>
        <p className="error-messages">Oops! Page Not Found.</p>
        <p className="error-description">
          Sorry, the page you are looking for does not exist. It might have been moved or deleted.
        </p>
        <Link to="/" className="home-link">
          Go Back to Homepage
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;