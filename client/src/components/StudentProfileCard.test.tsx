import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StudentProfileCard } from './StudentProfileCard';
import type { Student } from '../types';

describe('StudentProfileCard Component Tests', () => {
  
  const mockAtRiskStudent: Student = {
    id: 'stu_001',
    name: 'Maya Patel',
    email: 'maya.patel@school.edu',
    grade: 11,
    gpa: 3.2,
    counselorId: 'csl_001',
    enrollmentStatus: 'at_risk',
    unreadMessages: 2,
    urgencyLevel: 'Critical'
  };

  const mockActiveStudent: Student = {
    id: 'stu_002',
    name: 'Jordan Lee',
    email: 'jordan.lee@school.edu',
    grade: 12,
    gpa: 3.8,
    counselorId: 'csl_002',
    enrollmentStatus: 'active',
    unreadMessages: 0,
    urgencyLevel: 'Low'
  };

  it('should render all profile fields correctly for an At Risk / Critical student', () => {
    render(<StudentProfileCard student={mockAtRiskStudent} />);

    // Assert student avatar & basic details
    const avatar = screen.getByAltText("Maya Patel's avatar");
    expect(avatar).toBeInTheDocument();
    expect(screen.getByText('Maya Patel')).toBeInTheDocument();
    expect(screen.getByText('maya.patel@school.edu')).toBeInTheDocument();

    // Assert badges
    expect(screen.getByText('Critical Priority')).toBeInTheDocument();
    expect(screen.getByText('11th Grade')).toBeInTheDocument();
    expect(screen.getByText('At Risk')).toBeInTheDocument();

    // Assert academic cumulative GPA
    expect(screen.getByText('Cumulative GPA')).toBeInTheDocument();
    expect(screen.getByText('3.20 / 4.0')).toBeInTheDocument();

    // Assert unread count indicator
    expect(screen.getByText('Unread Messages')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();

    // Assert counselor and standing messages
    expect(screen.getByText('Academic Counselor')).toBeInTheDocument();
    expect(screen.getByText('Sarah Jenkins (csl_001)')).toBeInTheDocument();
    expect(screen.getByText('Academic intervention recommended')).toBeInTheDocument();
  });

  it('should render standing and credentials correctly for an Active / Low Priority student', () => {
    render(<StudentProfileCard student={mockActiveStudent} />);

    expect(screen.getByText('Jordan Lee')).toBeInTheDocument();
    expect(screen.getByText('jordan.lee@school.edu')).toBeInTheDocument();

    // Assert low urgency levels
    expect(screen.getByText('Low Priority')).toBeInTheDocument();
    expect(screen.getByText('12th Grade')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();

    // GPA
    expect(screen.getByText('3.80 / 4.0')).toBeInTheDocument();

    // Message count should be zero
    expect(screen.getByText('0')).toBeInTheDocument();

    // Portal counselor and general active standing message
    expect(screen.getByText('Portal Counselor (csl_002)')).toBeInTheDocument();
    expect(screen.getByText('Enrollment active and standing good')).toBeInTheDocument();
  });
});
