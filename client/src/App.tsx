import React, { useState, useEffect, useCallback } from 'react';
import type { Student, Task, TaskStatus } from './types';
import { StudentProfileCard } from './components/StudentProfileCard';
import { TaskList } from './components/TaskList';

const API_BASE_URL = 'http://localhost:5000';

export const App: React.FC = () => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('stu_001');
  const [student, setStudent] = useState<Student | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('zyra-theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
    localStorage.setItem('zyra-theme', theme);
  }, [theme]);

  const fetchStudentData = useCallback(async (studentId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/students/${studentId}/action-center`);
      if (!response.ok) {
        throw new Error(`Failed to load student data. Server responded with ${response.status}`);
      }
      const data = await response.json();
      setStudent(data.student);
      setTasks(data.tasks);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message || 'An error occurred while communicating with the server.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch data on initial load
  useEffect(() => {
    fetchStudentData(selectedStudentId);
  }, [selectedStudentId, fetchStudentData]);

  const handleUpdateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    const originalTasks = [...tasks];

    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, status: newStatus } : task
    );
    setTasks(updatedTasks);

    const originalStudent = student ? { ...student } : null;
    if (student) {
      const today = new Date('2026-05-30');
      const unreadCount = student.unreadMessages ?? 0;
      
      const hasOverdueHighPriority = updatedTasks.some(
        (t) => (t.priority === 'urgent' || t.priority === 'high') && 
               t.status !== 'completed' && 
               new Date(t.dueDate) < today
      );
      
      const hasActive = updatedTasks.some((t) => t.status !== 'completed');
      
      let newUrgency = student.urgencyLevel;
      if (student.enrollmentStatus === 'at_risk' || hasOverdueHighPriority || unreadCount >= 2) {
        newUrgency = 'Critical';
      } else if (hasActive || unreadCount > 0) {
        newUrgency = 'Medium';
      } else {
        newUrgency = 'Low';
      }
      setStudent({ ...student, urgencyLevel: newUrgency });
    }

    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`Server failed to update task status: ${response.status}`);
      }

      const updatedTaskFromServer = await response.json();

      setTasks((prevTasks) =>
        prevTasks.map((t) => (t.id === taskId ? updatedTaskFromServer : t))
      );
    } catch (err: any) {
      console.error('Status patch error, rolling back state:', err);
      setTasks(originalTasks);
      setStudent(originalStudent);
      alert(`Error updating task status. Reverting changes. Details: ${err.message}`);
    }
  };

  return (
    <div className="app-container">
      {/* Top Banner & Selector */}
      <header className="app-header">
        <div className="header-title-area">
          <h1>Zyra Counselor Portal</h1>
          <p>Student Action Center & Early Alert Dashboard</p>
        </div>

        {/* Student selector toggler & Theme Switcher */}
        <div className="header-actions-area">
          <div className="selector-panel">
            <span className="selector-label">Caseload:</span>
            {[
              { id: 'stu_001', label: 'Maya P. (Critical)' },
              { id: 'stu_002', label: 'Jordan L. (Medium)' },
              { id: 'stu_003', label: 'Carlos R. (Critical)' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                className={`selector-btn ${selectedStudentId === item.id ? 'active' : ''}`}
                onClick={() => setSelectedStudentId(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="theme-toggle-btn"
            onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Main content grid */}
      <main>
        {isLoading ? (
          <div className="loading-box">
            <div className="premium-spinner" />
            <p style={{ color: 'var(--text-dimmed)', fontStyle: 'italic', fontSize: '0.95rem' }}>
              Fetching student records and analyzing triage factors...
            </p>
          </div>
        ) : error ? (
          <div className="error-box">
            <h3 className="error-title">Database Connection Error</h3>
            <p className="error-message">{error}</p>
            <button
              type="button"
              className="retry-btn"
              onClick={() => fetchStudentData(selectedStudentId)}
            >
              Retry Connection
            </button>
          </div>
        ) : student ? (
          <div className="dashboard-grid">
            {/* Student Profile summary Column */}
            <StudentProfileCard student={student} />

            {/* Task list and status manager Column */}
            <TaskList
              tasks={tasks}
              onUpdateTaskStatus={handleUpdateTaskStatus}
            />
          </div>
        ) : (
          <div className="error-box">
            <h3 className="error-title">Record Not Found</h3>
            <p className="error-message">Unable to find details for the requested student ID.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
