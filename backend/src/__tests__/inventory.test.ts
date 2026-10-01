import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app';
import { User } from '../models/User';
import { Restaurant } from '../models/Restaurant';
import { Category } from '../models/Category';
import { Product } from '../models/Product';
import { Inventory } from '../models/Inventory';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

let mongoServer: MongoMemoryServer;
let restaurantToken: string;
let adminToken: string;
let restaurantId: string;
let productId: string;

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
  await Inventory.deleteMany({});

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

  // Create category
  const category = await Category.create({
    name: 'Pizzas',
    restaurant: restaurant._id,
  });

  // Create product
  const product = await Product.create({
    restaurant: restaurant._id,
    category: category._id,
    name: 'Pizza Pepperoni',
    price: 12.99,
    available: true,
  });
  productId = product._id.toString();
});

describe('Inventory Endpoints', () => {
  describe('POST /api/inventory', () => {
    it('should create inventory for a product', async () => {
      const res = await request(app)
        .post('/api/inventory')
        .set('Authorization', `Bearer ${restaurantToken}`)
        .send({
          product: productId,
          restaurant: restaurantId,
          stock: 10,
          minimumStock: 2,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.stock).toBe(10);
      expect(res.body.data.status).toBe('AVAILABLE');
    });

    it('should not create duplicate inventory', async () => {
      await request(app)
        .post('/api/inventory')
        .set('Authorization', `Bearer ${restaurantToken}`)
        .send({
          product: productId,
          restaurant: restaurantId,
          stock: 10,
          minimumStock: 2,
        });

      const res = await request(app)
        .post('/api/inventory')
        .set('Authorization', `Bearer ${restaurantToken}`)
        .send({
          product: productId,
          restaurant: restaurantId,
          stock: 5,
          minimumStock: 1,
        });

      expect(res.status).toBe(409);
    });
  });

  describe('GET /api/inventory', () => {
    it('should list inventory by restaurant', async () => {
      await request(app)
        .post('/api/inventory')
        .set('Authorization', `Bearer ${restaurantToken}`)
        .send({
          product: productId,
          restaurant: restaurantId,
          stock: 10,
          minimumStock: 2,
        });

      const res = await request(app)
        .get(`/api/inventory?restaurant=${restaurantId}`)
        .set('Authorization', `Bearer ${restaurantToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
    });
  });

  describe('PATCH /api/inventory/:id', () => {
    let inventoryId: string;

    beforeEach(async () => {
      const createRes = await request(app)
        .post('/api/inventory')
        .set('Authorization', `Bearer ${restaurantToken}`)
        .send({
          product: productId,
          restaurant: restaurantId,
          stock: 10,
          minimumStock: 2,
        });
      inventoryId = createRes.body.data._id;
    });

    it('should update stock', async () => {
      const res = await request(app)
        .patch(`/api/inventory/${inventoryId}`)
        .set('Authorization', `Bearer ${restaurantToken}`)
        .send({ stock: 15 });

      expect(res.status).toBe(200);
      expect(res.body.data.stock).toBe(15);
    });

    it('should auto-update status to LOW_STOCK when stock <= minimumStock', async () => {
      const res = await request(app)
        .patch(`/api/inventory/${inventoryId}`)
        .set('Authorization', `Bearer ${restaurantToken}`)
        .send({ stock: 2 });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('LOW_STOCK');
    });

    it('should auto-update status to OUT_OF_STOCK when stock = 0', async () => {
      const res = await request(app)
        .patch(`/api/inventory/${inventoryId}`)
        .set('Authorization', `Bearer ${restaurantToken}`)
        .send({ stock: 0 });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('OUT_OF_STOCK');
    });

    it('should not update with negative stock', async () => {
      const res = await request(app)
        .patch(`/api/inventory/${inventoryId}`)
        .set('Authorization', `Bearer ${restaurantToken}`)
        .send({ stock: -5 });

      expect(res.status).toBe(400);
    });
  });
});
