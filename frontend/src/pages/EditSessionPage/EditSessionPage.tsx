import React from 'react';
import './EditSessionPage.css';

const EditSessionPage: React.FC = () => {
  return (
    <div className="mentoring-page">
      <h1 className="page-title">Mentoring Session</h1>

      <div className="mentoring-card">
        <div className="mentoring-header-table">
            <div className="header-cell title-cell">
                <h1>Session Detail</h1>
            </div>
            <div className="header-cell button-cell">
                <button className="notify-btn">Notify Mentee</button>
            </div>
        </div>

        <div className="mentoring-body">
          <div className="session-form">
            
              <div>
                  <label htmlFor="course">Course</label>
                  <input type="text" id="course" name="course" />
              </div>

              <div>
                  <label htmlFor="date">Start Time</label>
                  <input type="date" id="start-time" name="start-time" />
              </div>

              <div>
                  <label htmlFor="date">End Time</label>
                  <input type="date" id="End-time" name="End-time" />
              </div>

              <div>
                  <label htmlFor="platform">Platform</label>
                  <input type="text" id="platform" name="platform" />
              </div>

            <div className="form-actions">
              <button className="btn black">Complete Session</button>
              <button className="btn green">Cancel Session</button>
            </div>
          </div>

          <div className="upload-section">
            <h4>Upload Recording</h4>
            <div className="upload-box">
              <p>Click to upload or drag and drop</p>
              <small>Supported format: .mp4 | Max size: 500MB</small>
            </div>
            <button className="btn black upload-btn">Upload</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditSessionPage;
