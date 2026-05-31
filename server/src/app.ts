import express, { Request, Response } from 'express';
import cors from 'cors';
import { mockStudents, mockTasks, mockMessages } from './mockData';
import { UrgencyLevel, TaskStatus } from './types';
import { loggerMiddleware } from './middleware/logger';
import { errorHandlerMiddleware } from './middleware/errorHandler';

const app = express();

app.use(cors());
app.use(express.json());

// Bind Request Logger Middleware at the very top of the stack
app.use(loggerMiddleware);

// Helper function to calculate urgency level dynamically
const calculateUrgency = (
  studentId: string,
  enrollmentStatus: 'at_risk' | 'active',
  unreadMessages: number
): UrgencyLevel => {
  const studentTasks = mockTasks.filter(t => t.studentId === studentId);
  const today = new Date('2026-05-30'); // Reference local time (May 30, 2026)
  
  const hasOverdueHighPriorityTask = studentTasks.some(task => {
    if ((task.priority === 'urgent' || task.priority === 'high') && task.status !== 'completed') {
      const dueDate = new Date(task.dueDate);
      return dueDate < today;
    }
    return false;
  });

  if (enrollmentStatus === 'at_risk' || hasOverdueHighPriorityTask || unreadMessages >= 2) {
    return 'Critical';
  }

  const hasActiveTasks = studentTasks.some(task => task.status !== 'completed');
  if (hasActiveTasks || unreadMessages > 0) {
    return 'Medium';
  }

  return 'Low';
};

// Route: GET /students/:id/action-center
const getActionCenterHandler = (req: Request, res: Response) => {
  const studentId = req.params.id;
  const student = mockStudents.find(s => s.id === studentId);

  if (!student) {
    return res.status(404).json({ error: `Student with ID ${studentId} not found` });
  }

  const unreadMessagesCount = mockMessages.filter(
    m => m.studentId === studentId && !m.read
  ).length;

  const studentTasks = mockTasks.filter(t => t.studentId === studentId);
  const urgencyLevel = calculateUrgency(student.id, student.enrollmentStatus, unreadMessagesCount);

  return res.json({
    student: {
      ...student,
      unreadMessages: unreadMessagesCount,
      urgencyLevel
    },
    tasks: studentTasks
  });
};

app.get('/students/:id/action-center', getActionCenterHandler);
app.get('/api/students/:id/action-center', getActionCenterHandler);

// Route: PATCH /tasks/:taskId/status
const patchTaskStatusHandler = (req: Request, res: Response) => {
  const { taskId } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status is required in the request body' });
  }

  const validStatuses: TaskStatus[] = ['todo', 'in_progress', 'completed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  const taskIndex = mockTasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) {
    return res.status(404).json({ error: `Task with ID ${taskId} not found` });
  }

  mockTasks[taskIndex].status = status;
  mockTasks[taskIndex].updatedAt = new Date().toISOString();

  return res.json(mockTasks[taskIndex]);
};

app.patch('/tasks/:taskId/status', patchTaskStatusHandler);
app.patch('/api/tasks/:taskId/status', patchTaskStatusHandler);

// Fallback 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Bind Global Error Handler Middleware at the very bottom of the Express pipeline
app.use(errorHandlerMiddleware);

export default app;
