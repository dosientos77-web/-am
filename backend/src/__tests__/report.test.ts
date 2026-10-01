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
let adminToken: string;
let restaurantToken: string;

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

  // Create admin
  const admin = await User.create({
    name: 'Admin',
    email: 'admin@test.com',
    passwordHash: 'hashed',
    role: 'ADMIN',
  });
  adminToken = jwt.sign({ userId: admin._id.toString(), role: 'ADMIN' }, env.jwtSecret);

  // Create restaurant owner
  const owner = await User.create({
    name: 'Owner',
    email: 'owner@test.com',
    passwordHash: 'hashed',
    role: 'RESTAURANT',
  });
  restaurantToken = jwt.sign({ userId: owner._id.toString(), role: 'RESTAURANT' }, env.jwtSecret);

  // Create restaurant
  const restaurant = await Restaurant.create({
    name: 'Test Restaurant',
    category: 'Comida',
    owner: owner._id,
    status: 'ACTIVE',
  });

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

  // Create inventory
  await Inventory.create({
    restaurant: restaurant._id,
    product: product._id,
    stock: 10,
    minimumStock: 2,
  });

  // Create order
  await Order.create({
    customer: admin._id,
    restaurant: restaurant._id,
    items: [{ product: product._id, name: 'Pizza Pepperoni', price: 12.99, quantity: 2 }],
    subtotal: 25.98,
    deliveryFee: 0,
    total: 25.98,
    deliveryType: 'PICKUP',
    status: 'DELIVERED',
  });
});

describe('Report Endpoints', () => {
  describe('GET /api/admin/stats', () => {
    it('should return dashboard stats', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalUsers).toBe(2);
      expect(res.body.data.totalRestaurants).toBe(1);
      expect(res.body.data.totalOrders).toBe(1);
    });

    it('should not access without admin role', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${restaurantToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/admin/sales', () => {
    it('should return sales report', async () => {
      const res = await request(app)
        .get('/api/admin/sales')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalOrders).toBe(1);
      expect(res.body.data.totalSales).toBe(25.98);
    });
  });

  describe('GET /api/admin/inventory', () => {
    it('should return inventory report', async () => {
      const res = await request(app)
        .get('/api/admin/inventory')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.total).toBe(1);
    });
  });
});
