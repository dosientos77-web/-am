import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app';
import { User } from '../models/User';
import { Restaurant } from '../models/Restaurant';
import { Category } from '../models/Category';
import { Product } from '../models/Product';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

let mongoServer: MongoMemoryServer;
let restaurantToken: string;
let adminToken: string;
let restaurantId: string;

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
  await Category.deleteMany({});
  await Product.deleteMany({});

  // Create restaurant owner
  const owner = await User.create({
    name: 'Owner',
    email: 'owner@test.com',
    passwordHash: 'hashed',
    role: 'RESTAURANT',
  });
  restaurantToken = jwt.sign({ userId: owner._id.toString(), role: 'RESTAURANT' }, env.jwtSecret);

  // Create admin
  const admin = await User.create({
    name: 'Admin',
    email: 'admin@test.com',
    passwordHash: 'hashed',
    role: 'ADMIN',
  });
  adminToken = jwt.sign({ userId: admin._id.toString(), role: 'ADMIN' }, env.jwtSecret);

  // Create restaurant
  const restaurant = await Restaurant.create({
    name: 'Test Restaurant',
    category: 'Comida',
    owner: owner._id,
    status: 'ACTIVE',
  });
  restaurantId = restaurant._id.toString();
});

describe('Category Endpoints', () => {
  describe('POST /api/categories', () => {
    it('should create a category', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${restaurantToken}`)
        .send({ name: 'Pizzas', restaurant: restaurantId });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Pizzas');
    });

    it('should not create without auth', async () => {
      const res = await request(app)
        .post('/api/categories')
        .send({ name: 'Pizzas', restaurant: restaurantId });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/categories', () => {
    it('should list categories by restaurant', async () => {
      await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${restaurantToken}`)
        .send({ name: 'Pizzas', restaurant: restaurantId });

      const res = await request(app).get(`/api/categories?restaurant=${restaurantId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
    });
  });
});

describe('Product Endpoints', () => {
  let categoryId: string;

  beforeEach(async () => {
    const catRes = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${restaurantToken}`)
      .send({ name: 'Pizzas', restaurant: restaurantId });
    categoryId = catRes.body.data._id;
  });

  describe('POST /api/products', () => {
    it('should create a product', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${restaurantToken}`)
        .send({
          restaurant: restaurantId,
          category: categoryId,
          name: 'Pizza Pepperoni',
          price: 12.99,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Pizza Pepperoni');
      expect(res.body.data.price).toBe(12.99);
      expect(res.body.data.available).toBe(true);
    });

    it('should not create with invalid category', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${restaurantToken}`)
        .send({
          restaurant: restaurantId,
          category: '507f1f77bcf86cd799439011',
          name: 'Pizza',
          price: 12.99,
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/products', () => {
    it('should list products by restaurant', async () => {
      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${restaurantToken}`)
        .send({
          restaurant: restaurantId,
          category: categoryId,
          name: 'Pizza Pepperoni',
          price: 12.99,
        });

      const res = await request(app).get(`/api/products?restaurant=${restaurantId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
    });

    it('should filter by availability', async () => {
      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${restaurantToken}`)
        .send({
          restaurant: restaurantId,
          category: categoryId,
          name: 'Pizza Pepperoni',
          price: 12.99,
        });

      const res = await request(app).get(`/api/products?restaurant=${restaurantId}&available=true`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
    });
  });

  describe('PATCH /api/products/:id', () => {
    it('should update a product', async () => {
      const createRes = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${restaurantToken}`)
        .send({
          restaurant: restaurantId,
          category: categoryId,
          name: 'Pizza Pepperoni',
          price: 12.99,
        });

      const productId = createRes.body.data._id;

      const res = await request(app)
        .patch(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${restaurantToken}`)
        .send({ price: 14.99, available: false });

      expect(res.status).toBe(200);
      expect(res.body.data.price).toBe(14.99);
      expect(res.body.data.available).toBe(false);
    });
  });
});
