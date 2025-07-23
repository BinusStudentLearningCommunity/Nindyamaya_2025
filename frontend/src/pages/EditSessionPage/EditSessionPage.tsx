import React, { useState, useEffect } from 'react';
import './EditSessionPage.css';

const EditSessionPage: React.FC = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const actionButtons = (
    <div className="form-actions">
      <button className="btn black">Complete Session</button>
      <button className="btn green">Cancel Session</button>
    </div>
  );

  return (
    <div className="mentoring-page">
      <h1 className="page-title">Mentoring Session</h1>

      <div className="mentoring-card">
        <div className="mentoring-header-table">
            <div className="header-cell title-cell">
                <h1>Session Detail</h1>
            </div>
        </div>

        <div className="mentoring-body">
          <div className="session-form">
            
              <div>
                  <label htmlFor="course">Course</label>
                  <input type="text" id="course" name="course" />
              </div>

              <div>
                  <label htmlFor="date">Date</label>
                  <input type="date" id="date" name="date" />
              </div>

              <div>
                  <label htmlFor="date">Start Time</label>
                  <input type="time" id="start-time" name="start-time" />
              </div>

              <div>
                  <label htmlFor="date">End Time</label>
                  <input type="time" id="end-time" name="end-time" />
              </div>

              <div>
                  <label htmlFor="platform">Platform</label>
                  <input type="text" id="platform" name="platform" />
              </div>

            {!isMobile && actionButtons}
          </div>

          <div className="upload-section">
            <h4>Upload Recording</h4>

            {/* Hidden File Input */}
            <input
              type="file"
              id="fileUpload"
              accept=".mp4"
              style={{ display: 'none' }}
              onChange={(e) => console.log(e.target.files[0])} // Replace with your upload logic
            />

              {/* Clickable Box */}
              <div
                className="upload-box"
                onClick={() => document.getElementById('fileUpload').click()}
              >
                <p>Click to upload or drag and drop</p>
                <small>Supported format: .mp4 | Max size: 500MB</small>
              </div>

              <button
                className="btn black upload-btn"
                onClick={() => document.getElementById('fileUpload').click()}
              >
                Upload
              </button>
            </div>
          {isMobile && actionButtons}
          </div>
      </div>
    </div>
  );
};

export default EditSessionPage;