import React from 'react';
import type { Task, TaskStatus } from '../types';

interface TaskListProps {
  tasks: Task[];
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, onUpdateTaskStatus }) => {
  // Sort tasks: Urgent first, then High, then Medium, then Low; and put completed tasks at the bottom
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (a.status !== 'completed' && b.status === 'completed') return -1;

    const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
    return priorityWeight[b.priority] - priorityWeight[a.priority];
  });

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'urgent':
      case 'high':
        return 'critical';
      case 'medium':
        return 'medium';
      case 'low':
      default:
        return 'low';
    }
  };

  // Helper to check if task is overdue
  const isOverdue = (dueDateStr: string, status: string) => {
    if (status === 'completed') return false;
    const dueDate = new Date(dueDateStr);
    const today = new Date('2026-05-30'); // Reference local time (May 30, 2026)
    return dueDate < today;
  };

  // Map backend lowercase statuses to existing glassmorphism CSS class selectors
  const getStatusButtonClass = (status: TaskStatus) => {
    switch (status) {
      case 'todo':
        return 'Pending';
      case 'in_progress':
        return 'In-Progress';
      case 'completed':
      default:
        return 'Completed';
    }
  };

  // Human readable labels for buttons
  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case 'todo':
        return 'Todo';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
      default:
        return 'Completed';
    }
  };

  return (
    <div className="tasks-pane">
      <div className="pane-header">
        <h3 className="pane-title">Student Tasks & Action Plan</h3>
        <span className="tasks-count-pill">
          {tasks.filter((t) => t.status !== 'completed').length} Pending Tasks
        </span>
      </div>

      {sortedTasks.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '1rem', fontWeight: 500 }}>No tasks listed for this student.</p>
        </div>
      ) : (
        <div className="tasks-list">
          {sortedTasks.map((task) => (
            <div key={task.id} className={`task-item ${task.status === 'completed' ? 'Completed' : ''}`}>
              <div className="task-top-row">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <span className={`badge ${getPriorityBadgeClass(task.priority)}`}>
                      {task.priority}
                    </span>
                    {isOverdue(task.dueDate, task.status) && (
                      <span className="badge critical" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>
                        Overdue
                      </span>
                    )}
                  </div>
                  <h4 className="task-title">{task.title}</h4>
                </div>
              </div>

              <p className="task-desc">{task.description}</p>

              <div className="task-meta-row">
                <div className="meta-item">
                  <span>Due by:</span>
                  <span style={{
                    fontWeight: 600,
                    color: isOverdue(task.dueDate, task.status) ? 'var(--status-critical-text)' : 'var(--text-dimmed)'
                  }}>
                    {new Date(task.dueDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                
                <span className="meta-bullet" />

                {/* Interactive Status Changer Toggle */}
                <div className="status-control-container">
                  <div className="status-toggle-group">
                    {(['todo', 'in_progress', 'completed'] as TaskStatus[]).map((statusOption) => {
                      const isActive = task.status === statusOption;
                      const buttonClassOption = getStatusButtonClass(statusOption);
                      
                      return (
                        <button
                          key={statusOption}
                          type="button"
                          className={`status-toggle-btn ${buttonClassOption} ${isActive ? 'active' : ''}`}
                          onClick={() => onUpdateTaskStatus(task.id, statusOption)}
                        >
                          {getStatusLabel(statusOption)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
