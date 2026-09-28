import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';

describe('Part 1: API Integration Tests', () => {
  // Test user creation (POST /users) and ticket creation (POST /tickets)
  it('creates a user and a ticket', async () => {
    const userResponse = await request(app)
      .post('/users')
      .set('X-User-Id', '1')
      .send({
        name: 'Test User',
        email: `test-${Date.now()}@example.com`,
      });

    expect(userResponse.status).toBe(201);
    expect(userResponse.body.name).toBe('Test User');

    const ticketResponse = await request(app)
      .post('/tickets')
      .set('X-User-Id', String(userResponse.body.id))
      .send({
        title: 'Test ticket',
        description: 'Created by an integration test',
      });

    expect(ticketResponse.status).toBe(201);
    expect(ticketResponse.body.title).toBe('Test ticket');
    expect(ticketResponse.body.creator_id).toBe(userResponse.body.id);
  });

  // Test auth middleware rejection (401 when X-User-Id is missing)
  it('rejects a POST request without the user header', async () => {
    const response = await request(app)
      .post('/tickets')
      .send({ title: 'Unauthorized ticket' });

    expect(response.status).toBe(401);
  });

  // Test 404 responses for non-existent users and tickets
  it('returns 404 for missing users and tickets', async () => {
    const userResponse = await request(app).get('/users/999999999');
    const ticketResponse = await request(app).get('/tickets/999999999');

    expect(userResponse.status).toBe(404);
    expect(ticketResponse.status).toBe(404);
  });

  // Test pagination and filtering on GET /tickets
  it('filters and paginates tickets', async () => {
    const userResponse = await request(app)
      .post('/users')
      .set('X-User-Id', '1')
      .send({
        name: 'Pagination Tester',
        email: `pagination-${Date.now()}@example.com`,
      });

    expect(userResponse.status).toBe(201);
    const userId = String(userResponse.body.id);

    const first = await request(app)
      .post('/tickets')
      .set('X-User-Id', userId)
      .send({ title: 'First pagination ticket' });

    const second = await request(app)
      .post('/tickets')
      .set('X-User-Id', userId)
      .send({ title: 'Second pagination ticket' });

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);

    await request(app)
      .patch(`/tickets/${first.body.id}/status`)
      .set('X-User-Id', userId)
      .send({ status: 'DONE' });

    await request(app)
      .patch(`/tickets/${second.body.id}/status`)
      .set('X-User-Id', userId)
      .send({ status: 'DONE' });

    const response = await request(app).get(
      '/tickets?status=DONE&limit=1&offset=0',
    );

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].status).toBe('DONE');
  });
});
