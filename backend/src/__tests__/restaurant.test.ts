import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app';
import { User } from '../models/User';
import { Restaurant } from '../models/Restaurant';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

let mongoServer: MongoMemoryServer;
let customerToken: string;
let restaurantToken: string;
let adminToken: string;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
  await Restaurant.deleteMany({});

  // Create customer via API
  const customerRes = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Customer', email: 'customer@test.com', password: 'Password123!' });
  customerToken = customerRes.body.token;

  // Create restaurant owner directly in DB (public register only allows CUSTOMER)
  const owner = await User.create({
    name: 'Restaurant Owner',
    email: 'owner@test.com',
    passwordHash: 'hashed',
    role: 'RESTAURANT',
  });
  restaurantToken = jwt.sign({ userId: owner._id.toString(), role: 'RESTAURANT' }, env.jwtSecret);

  // Create admin directly in DB
  const admin = await User.create({
    name: 'Admin',
    email: 'admin@test.com',
    passwordHash: 'hashed',
    role: 'ADMIN',
  });
  adminToken = jwt.sign({ userId: admin._id.toString(), role: 'ADMIN' }, env.jwtSecret);
});

describe('Restaurant Endpoints', () => {
  describe('POST /api/restaurants', () => {
    it('should create a restaurant with PENDING_APPROVAL status', async () => {
      const res = await request(app)
        .post('/api/restaurants')
        .set('Authorization', `Bearer ${restaurantToken}`)
        .send({ name: 'Test Restaurant', category: 'Comida' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Test Restaurant');
      expect(res.body.data.status).toBe('PENDING_APPROVAL');
    });

    it('should not create without auth', async () => {
      const res = await request(app)
        .post('/api/restaurants')
        .send({ name: 'Test Restaurant', category: 'Comida' });

      expect(res.status).toBe(401);
    });

    it('should not create as customer', async () => {
      const res = await request(app)
        .post('/api/restaurants')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ name: 'Test Restaurant', category: 'Comida' });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/restaurants', () => {
    it('should list restaurants', async () => {
      await request(app)
        .post('/api/restaurants')
        .set('Authorization', `Bearer ${restaurantToken}`)
        .send({ name: 'Test Restaurant', category: 'Comida' });

      const res = await request(app).get('/api/restaurants');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should filter by status', async () => {
      await request(app)
        .post('/api/restaurants')
        .set('Authorization', `Bearer ${restaurantToken}`)
        .send({ name: 'Test Restaurant', category: 'Comida' });

      const res = await request(app).get('/api/restaurants?status=PENDING_APPROVAL');
      expect(res.status).toBe(200);
      expect(res.body.data.every((r: any) => r.status === 'PENDING_APPROVAL')).toBe(true);
    });
  });

  describe('PATCH /api/restaurants/:id/approve', () => {
    it('should approve a restaurant (admin only)', async () => {
      const createRes = await request(app)
        .post('/api/restaurants')
        .set('Authorization', `Bearer ${restaurantToken}`)
        .send({ name: 'Test Restaurant', category: 'Comida' });

      const restaurantId = createRes.body.data._id;

      const res = await request(app)
        .patch(`/api/restaurants/${restaurantId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('ACTIVE');
    });

    it('should not approve if not admin', async () => {
      const createRes = await request(app)
        .post('/api/restaurants')
        .set('Authorization', `Bearer ${restaurantToken}`)
        .send({ name: 'Test Restaurant', category: 'Comida' });

      const restaurantId = createRes.body.data._id;

      const res = await request(app)
        .patch(`/api/restaurants/${restaurantId}/approve`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
    });

    it('should not approve non-pending restaurant', async () => {
      const createRes = await request(app)
        .post('/api/restaurants')
        .set('Authorization', `Bearer ${restaurantToken}`)
        .send({ name: 'Test Restaurant', category: 'Comida' });

      const restaurantId = createRes.body.data._id;

      await request(app)
        .patch(`/api/restaurants/${restaurantId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);

      const res = await request(app)
        .patch(`/api/restaurants/${restaurantId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
    });
  });

  describe('PATCH /api/restaurants/:id/suspend', () => {
    it('should suspend an active restaurant', async () => {
      const createRes = await request(app)
        .post('/api/restaurants')
        .set('Authorization', `Bearer ${restaurantToken}`)
        .send({ name: 'Test Restaurant', category: 'Comida' });

      const restaurantId = createRes.body.data._id;

      await request(app)
        .patch(`/api/restaurants/${restaurantId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);

      const res = await request(app)
        .patch(`/api/restaurants/${restaurantId}/suspend`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('SUSPENDED');
    });
  });
});
