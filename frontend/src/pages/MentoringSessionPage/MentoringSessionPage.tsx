import React from 'react';
import './MentoringSessionPage.css';
import MentoringTable from '../../components/MentoringSession/MentoringTable'

const MentoringSessionPage: React.FC = () => {
    return (
        <div className="mentoring-session-page">
            <h1 className="page-title">Mentoring Session</h1>
            <MentoringTable />
        </div>
    )
};

export default MentoringSessionPage;



