import React, { useState } from "react";
import "./RegisterPage.css";
import { Link, useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import axios from 'axios';

const RegisterPage: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [nim, setNim] = useState("");
  const [schoolFaculty, setSchoolFaculty] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email.endsWith("@binus.ac.id")) {
      setError("Please use a valid BINUS University email (@binus.ac.id).");
      return;
    }

    if (password.length < 8 || confirmPassword.length < 8){
      setError('Password length must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please try again.");
      return;
    }

    console.log("Passwords match %s",password);
    const userData = {
      name,
      email,
      nim,
      faculty: schoolFaculty,
      password
    };

      try {
        const response = await axios.post('/api/users/register', userData);
        
        if (response.status === 201) {
            toast.success('Registered successfully! Please log in.');
            navigate("/login");
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || 'Registration failed.');
        } else {
          setError('An unexpected error occurred.');
        }
      }  finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="register-page">
      <div className="form-section">
        <div className="form-container">
          <img src="../assets/BSLC-logo.png" alt="BSLC logo" />
          <form onSubmit={handleSubmit}>
            <label htmlFor="name">Name</label>
            <div className="input-wrapper">
              <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required aria-label="Name" />
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path
                  d="M15 15.75V14.25C15 13.4544 14.6839 12.6913 14.1213 12.1287C13.5587 11.5661 12.7956 11.25 12 11.25H6C5.20435 11.25 4.44129 11.5661 3.87868 12.1287C3.31607 12.6913 3 13.4544 3 14.25V15.75"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 8.25C10.6569 8.25 12 6.90685 12 5.25C12 3.59315 10.6569 2.25 9 2.25C7.34315 2.25 6 3.59315 6 5.25C6 6.90685 7.34315 8.25 9 8.25Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <label htmlFor="email">Email (Binusian Email)</label>
            <div className="input-wrapper">
              <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required aria-label="Email" />
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M3 3H15C15.825 3 16.5 3.675 16.5 4.5V13.5C16.5 14.325 15.825 15 15 15H3C2.175 15 1.5 14.325 1.5 13.5V4.5C1.5 3.675 2.175 3 3 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16.5 4.5L9 9.75L1.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <label htmlFor="nim">NIM</label>
            <div className="input-wrapper">
              <input type="text" id="nim" value={nim} onChange={(e) => setNim(e.target.value)} required aria-label="NIM" />
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M3 6.75H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 11.25H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7.5 2.25L6 15.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 2.25L10.5 15.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <label htmlFor="school-faculty">School/Faculty</label>
            <div className="input-wrapper">
            <select
                id="school-faculty"
                value={schoolFaculty}
                onChange={(e) => setSchoolFaculty(e.target.value)}
                required
                aria-label="School/Faculty"
            >
                <option value="" disabled>School / Faculty</option>
                <option value="School of Computer Science">School of Computer Science</option>
                <option value="School of Information System">School of Information System</option>
                <option value="School of Accounting">School of Accounting</option>
                <option value="Faculty of Engineering">Faculty of Engineering</option>
                <option value="BINUS Business School">BINUS Business School</option>
                <option value="Faculty of Digital Communication and Hotel and Tourism">
                Faculty of Digital Communication and Hotel and Tourism
                </option>
                <option value="Faculty of Humanities">Faculty of Humanities</option>
                <option value="School of Design">School of Design</option>
            </select>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path
                d="M2.25 6.75L9 1.5L15.75 6.75V15C15.75 15.3978 15.592 15.7794 15.3107 16.0607C15.0294 16.342 14.6478 16.5 14.25 16.5H3.75C3.35218 16.5 2.97064 16.342 2.68934 16.0607C2.40804 15.7794 2.25 15.3978 2.25 15V6.75Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                />
                <path d="M6.75 16.5V9H11.25V16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

            <label htmlFor="confirm-password">Confirm Password</label>
            <div className="input-wrapper">
              <input type="password" id="confirm-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required aria-label="Confirm Password" />
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

            {error && <p className="error-message">{error}</p>}

            <button type="submit" disabled={isLoading}>{isLoading ? 'Registering...' : 'Register'}</button>
            <p>
              Already have an account? <Link to="/login">Login</Link>
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

export default RegisterPage;
