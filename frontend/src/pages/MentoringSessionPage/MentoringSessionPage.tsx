import React from 'react';
import './MentoringSessionPage.css';
import MentoringTable from '../../components/MentoringSession/MentoringTable'
import { useOutletContext } from 'react-router-dom';

interface PageContext {
  role: 'mentor' | 'mentee';
}

const MentoringSessionPage: React.FC = () => {
    const { role } = useOutletContext<PageContext>();

    return (
        <div className="mentoring-session-page">
            <h1 className="page-title">Mentoring Session</h1>
            <MentoringTable role={role} />
        </div>
    )
};

export default MentoringSessionPage;



