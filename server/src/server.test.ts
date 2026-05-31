import request from 'supertest';
import { describe, it, expect } from '@jest/globals';
import app from './app';

describe('Counselor Student Action Center - Integration Tests', () => {
  
  describe('GET /students/:id/action-center', () => {
    
    it('should successfully retrieve student profile and task list for Maya Patel (stu_001)', async () => {
      const res = await request(app)
        .get('/students/stu_001/action-center')
        .expect('Content-Type', /json/)
        .expect(200);

      // Verify custom request tracer headers
      expect(res.headers['x-request-id']).toBeDefined();
      expect(res.headers['x-request-id']).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i); // UUID v4 format

      // Verify student details
      expect(res.body.student).toBeDefined();
      expect(res.body.student.id).toBe('stu_001');
      expect(res.body.student.name).toBe('Maya Patel');
      expect(res.body.student.grade).toBe(11);
      expect(res.body.student.gpa).toBe(3.2);
      expect(res.body.student.enrollmentStatus).toBe('at_risk');
      expect(res.body.student.unreadMessages).toBe(2); // message msg_001 and msg_002 are unread
      expect(res.body.student.urgencyLevel).toBe('Critical'); // 'at_risk' or unread message threshold triages as Critical

      // Verify tasks list details
      expect(res.body.tasks).toBeDefined();
      expect(Array.isArray(res.body.tasks)).toBe(true);
      expect(res.body.tasks.length).toBe(5); // stu_001 has 5 tasks in mock data
    });

    it('should successfully retrieve active details for Jordan Lee (stu_002)', async () => {
      const res = await request(app)
        .get('/students/stu_002/action-center')
        .expect(200);

      expect(res.body.student.id).toBe('stu_002');
      expect(res.body.student.name).toBe('Jordan Lee');
      expect(res.body.student.gpa).toBe(3.8);
      expect(res.body.student.unreadMessages).toBe(1); // msg_004 is unread
      expect(res.body.student.urgencyLevel).toBe('Medium'); // Active tasks/unreads, not 'at_risk'
    });

    it('should return a 404 error if the student does not exist', async () => {
      const res = await request(app)
        .get('/students/stu_non_existent/action-center')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(res.headers['x-request-id']).toBeDefined();
      expect(res.body.error).toBe('Student with ID stu_non_existent not found');
    });
  });

  describe('PATCH /tasks/:taskId/status', () => {
    
    it('should update the status of tsk_001 and return the updated task record', async () => {
      const res = await request(app)
        .patch('/tasks/tsk_001/status')
        .send({ status: 'completed' })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(res.headers['x-request-id']).toBeDefined();
      expect(res.body.id).toBe('tsk_001');
      expect(res.body.status).toBe('completed');
      expect(res.body.updatedAt).toBeDefined();
      expect(new Date(res.body.updatedAt).getTime()).not.toBeNaN();
    });

    it('should return 400 Bad Request if status is not provided in body', async () => {
      const res = await request(app)
        .patch('/tasks/tsk_001/status')
        .send({})
        .expect(400);

      expect(res.body.error).toBe('Status is required in the request body');
    });

    it('should return 400 Bad Request if status provided is invalid', async () => {
      const res = await request(app)
        .patch('/tasks/tsk_001/status')
        .send({ status: 'invalid_status_value' })
        .expect(400);

      expect(res.body.error).toContain('Invalid status. Must be one of:');
    });

    it('should return 404 Not Found if task ID does not exist', async () => {
      const res = await request(app)
        .patch('/tasks/tsk_invalid_id/status')
        .send({ status: 'completed' })
        .expect(404);

      expect(res.body.error).toBe('Task with ID tsk_invalid_id not found');
    });
  });

  describe('Fallback Middleware & Security Route', () => {
    it('should return a 404 error if route does not exist', async () => {
      const res = await request(app)
        .get('/api/invalid-resource-endpoint')
        .expect(404);

      expect(res.body.error).toBe('Endpoint not found');
    });
  });
});
