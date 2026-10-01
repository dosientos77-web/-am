import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app';
import { User } from '../models/User';
import { Restaurant } from '../models/Restaurant';
import { Category } from '../models/Category';
import { Product } from '../models/Product';
import { Inventory } from '../models/Inventory';
import { Order } from '../models/Order';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

let mongoServer: MongoMemoryServer;
let customerToken: string;
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
  await Order.deleteMany({});

  // Create customer
  const customer = await User.create({
    name: 'Customer',
    email: 'customer@test.com',
    passwordHash: 'hashed',
    role: 'CUSTOMER',
  });
  customerToken = jwt.sign({ userId: customer._id.toString(), role: 'CUSTOMER' }, env.jwtSecret);

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

  // Create inventory
  await Inventory.create({
    restaurant: restaurant._id,
    product: product._id,
    stock: 10,
    minimumStock: 2,
  });
});

describe('Order Endpoints', () => {
  describe('POST /api/orders', () => {
    it('should create an order', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          restaurant: restaurantId,
          items: [{ product: productId, quantity: 2 }],
          deliveryType: 'PICKUP',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('PENDING');
      expect(res.body.data.total).toBe(25.98);
    });

    it('should deduct inventory when order is created', async () => {
      await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          restaurant: restaurantId,
          items: [{ product: productId, quantity: 3 }],
          deliveryType: 'PICKUP',
        });

      const inventory = await Inventory.findOne({ product: productId });
      expect(inventory?.stock).toBe(7);
    });

    it('should not create order with insufficient stock', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          restaurant: restaurantId,
          items: [{ product: productId, quantity: 100 }],
          deliveryType: 'PICKUP',
        });

      expect(res.status).toBe(400);
    });

    it('should not create order without auth', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({
          restaurant: restaurantId,
          items: [{ product: productId, quantity: 1 }],
          deliveryType: 'PICKUP',
        });

      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/orders/:id/status', () => {
    let orderId: string;

    beforeEach(async () => {
      const createRes = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          restaurant: restaurantId,
          items: [{ product: productId, quantity: 1 }],
          deliveryType: 'PICKUP',
        });
      orderId = createRes.body.data._id;
    });

    it('should update order status (PENDING -> CONFIRMED)', async () => {
      const res = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${restaurantToken}`)
        .send({ status: 'CONFIRMED' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('CONFIRMED');
    });

    it('should not allow invalid transition (PENDING -> DELIVERED)', async () => {
      const res = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${restaurantToken}`)
        .send({ status: 'DELIVERED' });

      expect(res.status).toBe(400);
    });

    it('should not allow customer to update status', async () => {
      const res = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ status: 'CONFIRMED' });

      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/orders/:id/cancel', () => {
    it('should cancel a pending order', async () => {
      const createRes = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          restaurant: restaurantId,
          items: [{ product: productId, quantity: 1 }],
          deliveryType: 'PICKUP',
        });

      const orderId = createRes.body.data._id;

      const res = await request(app)
        .post(`/api/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('CANCELLED');
    });

    it('should restore inventory when order is cancelled', async () => {
      const createRes = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          restaurant: restaurantId,
          items: [{ product: productId, quantity: 5 }],
          deliveryType: 'PICKUP',
        });

      const orderId = createRes.body.data._id;

      await request(app)
        .post(`/api/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${customerToken}`);

      const inventory = await Inventory.findOne({ product: productId });
      expect(inventory?.stock).toBe(10);
    });
  });
});
