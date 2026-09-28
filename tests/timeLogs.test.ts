import { randomUUID } from 'node:crypto';
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';

describe('Part 2: Time Logs Tests', () => {
  it('adds multiple time logs and returns their total', async () => {
    // TODO: Student implementation - Part 2: Time Logging Tests
    const userResponse = await request(app)
      .post('/users')
      .set('X-User-Id', '1')
      .send({
        name: 'Time Log Tester',
        email: `time-test-${randomUUID()}@example.com`,
      });

    expect(userResponse.status).toBe(201);
    const userId = userResponse.body.id;

    const ticketResponse = await request(app)
      .post('/tickets')
      .set('X-User-Id', String(userId))
      .send({ title: 'Track development time' });

    expect(ticketResponse.status).toBe(201);
    const ticketId = ticketResponse.body.id;

    // Log hours for a ticket (POST /tickets/:id/time)
    const firstLog = await request(app)
      .post(`/tickets/${ticketId}/time`)
      .set('X-User-Id', String(userId))
      .send({ hours: 2 });

    const secondLog = await request(app)
      .post(`/tickets/${ticketId}/time`)
      .set('X-User-Id', String(userId))
      .send({ hours: 3 });

    expect(firstLog.status).toBe(201);
    expect(secondLog.status).toBe(201);

    // Fetch total hours for a ticket (GET /tickets/:id/time)
    const totalResponse = await request(app).get(`/tickets/${ticketId}/time`);

    expect(totalResponse.status).toBe(200);

    // Verify aggregation math
    expect(totalResponse.body).toEqual({
      ticket_id: ticketId,
      total_hours: 5,
    });
  });
});
