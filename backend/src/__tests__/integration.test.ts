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
import { AuditLog } from '../models/AuditLog';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

let mongoServer: MongoMemoryServer;
let customerToken: string;
let restaurantToken: string;
let adminToken: string;
let deliveryToken: string;

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
  await AuditLog.deleteMany({});

  // Create users
  const customer = await User.create({ name: 'Customer', email: 'customer@test.com', passwordHash: 'hashed', role: 'CUSTOMER' });
  customerToken = jwt.sign({ userId: customer._id.toString(), role: 'CUSTOMER' }, env.jwtSecret);

  const owner = await User.create({ name: 'Owner', email: 'owner@test.com', passwordHash: 'hashed', role: 'RESTAURANT' });
  restaurantToken = jwt.sign({ userId: owner._id.toString(), role: 'RESTAURANT' }, env.jwtSecret);

  const admin = await User.create({ name: 'Admin', email: 'admin@test.com', passwordHash: 'hashed', role: 'ADMIN' });
  adminToken = jwt.sign({ userId: admin._id.toString(), role: 'ADMIN' }, env.jwtSecret);

  const delivery = await User.create({ name: 'Delivery', email: 'delivery@test.com', passwordHash: 'hashed', role: 'DELIVERY' });
  deliveryToken = jwt.sign({ userId: delivery._id.toString(), role: 'DELIVERY' }, env.jwtSecret);
});

describe('Integration Tests', () => {
  describe('Permissions', () => {
    it('CUSTOMER cannot access admin endpoints', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(res.status).toBe(403);
    });

    it('RESTAURANT cannot access admin endpoints', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${restaurantToken}`);
      expect(res.status).toBe(403);
    });

    it('DELIVERY cannot access admin endpoints', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${deliveryToken}`);
      expect(res.status).toBe(403);
    });

    it('CUSTOMER cannot create restaurants', async () => {
      const res = await request(app)
        .post('/api/restaurants')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ name: 'Test', category: 'Comida' });
      expect(res.status).toBe(403);
    });

    it('CUSTOMER cannot update order status', async () => {
      const res = await request(app)
        .patch('/api/orders/some-id/status')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ status: 'CONFIRMED' });
      expect(res.status).toBe(403);
    });
  });

  describe('Order Flow', () => {
    let restaurantId: string;
    let productId: string;

    beforeEach(async () => {
      const owner = await User.findOne({ email: 'owner@test.com' });
      const restaurant = await Restaurant.create({ name: 'Test', category: 'Comida', owner: owner!._id, status: 'ACTIVE' });
      restaurantId = restaurant._id.toString();

      const category = await Category.create({ name: 'Pizzas', restaurant: restaurant._id });
      const product = await Product.create({ restaurant: restaurant._id, category: category._id, name: 'Pizza', price: 10, available: true });
      productId = product._id.toString();

      await Inventory.create({ restaurant: restaurant._id, product: product._id, stock: 10, minimumStock: 2 });
    });

    it('complete order flow: create -> confirm -> prepare -> ready -> deliver', async () => {
      // Create order
      const createRes = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ restaurant: restaurantId, items: [{ product: productId, quantity: 1 }], deliveryType: 'PICKUP' });
      expect(createRes.status).toBe(201);
      const orderId = createRes.body.data._id;

      // Confirm
      const confirmRes = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${restaurantToken}`)
        .send({ status: 'CONFIRMED' });
      expect(confirmRes.status).toBe(200);

      // Prepare
      const prepareRes = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${restaurantToken}`)
        .send({ status: 'PREPARING' });
      expect(prepareRes.status).toBe(200);

      // Ready
      const readyRes = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${restaurantToken}`)
        .send({ status: 'READY' });
      expect(readyRes.status).toBe(200);

      // Deliver (pickup)
      const deliverRes = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${restaurantToken}`)
        .send({ status: 'DELIVERED' });
      expect(deliverRes.status).toBe(200);
      expect(deliverRes.body.data.status).toBe('DELIVERED');
    });
  });
});
