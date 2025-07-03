import React, { useState } from "react";
import "./ForgotPasswordPage.css";
import { useNavigate } from "react-router-dom";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.endsWith("@binus.ac.id")) {
      setError("Please use a valid BINUS University email (@binus.ac.id).");
      return; // Stop the submission
    }
    // Handle password reset logic here
    alert(`Password reset link sent to: ${email}`);

    navigate('/');
  };

  return (
    <section className="forgot-password-page">
      <div className="form-section">
        <div className="form-container">
          <img src="/assets/BSLC-logo.png" alt="BSLC logo" />

          <form onSubmit={handleSubmit}>
            <label htmlFor="email">Enter your email</label>
            <div className="input-wrapper">
              <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required aria-label="Email" />
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M3 3H15C15.825 3 16.5 3.675 16.5 4.5V13.5C16.5 14.325 15.825 15 15 15H3C2.175 15 1.5 14.325 1.5 13.5V4.5C1.5 3.675 2.175 3 3 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16.5 4.5L9 9.75L1.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {error && <p className="error-message">{error}</p>}

            <button type="submit">Reset Password</button>
            <a href="/">Back to Login</a>
          </form>
        </div>
      </div>

      <div className="hero-section">
        <img src="/assets/BSLC-img.png" alt="Image of BSLC" />
      </div>
    </section>
  );
};

export default ForgotPassword;
