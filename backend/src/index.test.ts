import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from './index';

describe('Backend API', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/lifehub-test');
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('GET /health should return ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it('POST /auth/register and /auth/login flow', async () => {
    const email = `test${Date.now()}@example.com`;
    const password = 'password123';

    // Register
    const registerRes = await request(app).post('/auth/register').send({ email, password });
    expect(registerRes.status).toBe(201);
    expect(registerRes.body).toHaveProperty('token');
    expect(registerRes.body.user.email).toBe(email);

    // Login
    const loginRes = await request(app).post('/auth/login').send({ email, password });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toHaveProperty('token');
    expect(loginRes.body.user.email).toBe(email);
  });
});
