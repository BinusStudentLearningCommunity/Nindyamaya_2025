import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./LoginPage.css";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    alert(`Logged in with ${email}, Remember Me: ${rememberMe}`);

    navigate("/home");
  };

  return (
    <section className="login-page">
      <div className="form-section">
        <div className="form-container">
          <img src="../assets/BSLC-logo.png" alt="BSLC logo" />
          <form onSubmit={handleSubmit}>
            <label htmlFor="email">Email</label>
            <div className="input-wrapper">
              <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required aria-label="Email" />
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M3 3H15C15.825 3 16.5 3.675 16.5 4.5V13.5C16.5 14.325 15.825 15 15 15H3C2.175 15 1.5 14.325 1.5 13.5V4.5C1.5 3.675 2.175 3 3 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16.5 4.5L9 9.75L1.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required aria-label="Password" />
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path
                  d="M14.25 8.25H3.75C2.92157 8.25 2.25 8.92157 2.25 9.75V15C2.25 15.8284 2.92157 16.5 3.75 16.5H14.25C15.0784 16.5 15.75 15.8284 15.75 15V9.75C15.75 8.92157 15.0784 8.25 14.25 8.25Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M5.25 8.25V5.25C5.25 4.25544 5.64509 3.30161 6.34835 2.59835C7.05161 1.89509 8.00544 1.5 9 1.5C9.99456 1.5 10.9484 1.89509 11.6517 2.59835C12.3549 3.30161 12.75 4.25544 12.75 5.25V8.25"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="checkbox-container">
              <input type="checkbox" id="remember-me" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} aria-label="Remember Me Checkbox" />
              <label htmlFor="remember-me">Remember Me</label>
            </div>

            <button type="submit">Login</button>
            <Link to="/forgot-password">Forgot Password</Link>
            <p>
             Don't have an account? <Link to="/register">Sign up here</Link>
            </p>

          </form>
        </div>
      </div>

      <div className="hero-section">
        <img src="../assets/BSLC-img.png" alt="Image of BSLC" />
      </div>
    </section>
  );
};

export default LoginPage;
