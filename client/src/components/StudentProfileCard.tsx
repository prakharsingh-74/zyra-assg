import React from 'react';
import type { Student } from '../types';

interface StudentProfileCardProps {
  student: Student;
}

export const StudentProfileCard: React.FC<StudentProfileCardProps> = ({ student }) => {
  const {
    name,
    email,
    grade,
    counselorId,
    unreadMessages = 0,
    gpa,
    enrollmentStatus,
    urgencyLevel = 'Low',
  } = student;

  // Map urgency level to badge style classes
  const getUrgencyClass = (level: string) => {
    switch (level) {
      case 'Critical':
        return 'critical';
      case 'Medium':
        return 'medium';
      case 'Low':
      default:
        return 'low';
    }
  };

  // Convert GPA to percentage out of 4.0 for progress indicator
  const gpaPercentage = Math.min((gpa / 4.0) * 100, 100);

  // Map counselor ID to a human readable counselor name
  const getCounselorName = (id: string) => {
    return id === 'csl_001' ? 'Sarah Jenkins' : 'Portal Counselor';
  };

  return (
    <div className="glass-card">
      <div className="profile-header">
        <div className="avatar-wrapper">
          <img
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${name}&backgroundColor=120e24,7c5dfa,00d2ff`}
            alt={`${name}'s avatar`}
            className="student-avatar"
          />
          <span className={`urgency-pulse ${getUrgencyClass(urgencyLevel)}`} />
        </div>
        <h2 className="student-name">{name}</h2>
        <p className="student-email">{email}</p>

        <div className="badge-container">
          <span className={`badge ${getUrgencyClass(urgencyLevel)}`}>
            {urgencyLevel} Priority
          </span>
          <span className="badge info">{grade}th Grade</span>
          <span className={`badge ${enrollmentStatus === 'at_risk' ? 'critical' : 'low'}`} style={{ textTransform: 'capitalize' }}>
            {enrollmentStatus === 'at_risk' ? 'At Risk' : 'Active'}
          </span>
        </div>
      </div>

      <div className="metrics-section">
        {/* GPA Progress Bar */}
        <div className="metric-row">
          <div className="metric-label-area">
            <span>Cumulative GPA</span>
            <span className="metric-value">{gpa.toFixed(2)} / 4.0</span>
          </div>
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill purple"
              style={{ width: `${gpaPercentage}%` }}
            />
          </div>
        </div>

        {/* Unread Message Indicator */}
        <div className="msg-indicator">
          <span className="msg-text">Unread Messages</span>
          <span className={`msg-count ${unreadMessages === 0 ? 'zero' : ''}`}>
            {unreadMessages}
          </span>
        </div>

        {/* Extra Information */}
        <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Academic Counselor
            </span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-dimmed)' }}>
              {getCounselorName(counselorId)} ({counselorId})
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Caseload Status
            </span>
            <span style={{ fontSize: '0.9rem', color: enrollmentStatus === 'at_risk' ? 'var(--status-critical-text)' : 'var(--status-low-text)', fontWeight: 500 }}>
              {enrollmentStatus === 'at_risk' 
                ? 'Academic intervention recommended' 
                : 'Enrollment active and standing good'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
