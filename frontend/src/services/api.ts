import { API_BASE_URL, API_ENDPOINTS } from '../constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@ñamfod_token';

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem(TOKEN_KEY);
  }

  async setToken(token: string): Promise<void> {
    return AsyncStorage.setItem(TOKEN_KEY, token);
  }

  async removeToken(): Promise<void> {
    return AsyncStorage.removeItem(TOKEN_KEY);
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = await this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  }

  // Auth
  async register(name: string, email: string, password: string) {
    return this.request(API_ENDPOINTS.REGISTER, {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  }

  async login(email: string, password: string) {
    const response = await this.request<{ token: string; user: unknown }>(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (response.token) {
      await this.setToken(response.token);
    }
    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.request(API_ENDPOINTS.LOGOUT, { method: 'POST' });
    } finally {
      await this.removeToken();
    }
  }

  async getMe() {
    return this.request(API_ENDPOINTS.ME);
  }

  // Restaurants
  async getRestaurants(filters?: { status?: string }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    const query = params.toString();
    return this.request(`${API_ENDPOINTS.RESTAURANTS}${query ? `?${query}` : ''}`);
  }

  async getRestaurant(id: string) {
    return this.request(API_ENDPOINTS.RESTAURANT_BY_ID(id));
  }

  // Categories
  async getCategories(restaurantId: string) {
    return this.request(`${API_ENDPOINTS.CATEGORIES}?restaurant=${restaurantId}`);
  }

  // Products
  async getProducts(filters?: { restaurant?: string; category?: string; available?: boolean }) {
    const params = new URLSearchParams();
    if (filters?.restaurant) params.append('restaurant', filters.restaurant);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.available !== undefined) params.append('available', String(filters.available));
    const query = params.toString();
    return this.request(`${API_ENDPOINTS.PRODUCTS}${query ? `?${query}` : ''}`);
  }

  async getProduct(id: string) {
    return this.request(API_ENDPOINTS.PRODUCT_BY_ID(id));
  }

  // Orders
  async getOrders() {
    return this.request(API_ENDPOINTS.ORDERS);
  }

  async getOrder(id: string) {
    return this.request(API_ENDPOINTS.ORDER_BY_ID(id));
  }

  async createOrder(orderData: unknown) {
    return this.request(API_ENDPOINTS.ORDERS, {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async updateOrderStatus(orderId: string, status: string) {
    return this.request(API_ENDPOINTS.ORDER_STATUS(orderId), {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async confirmDelivery(orderId: string, code: string) {
    return this.request(API_ENDPOINTS.CONFIRM_DELIVERY(orderId), {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  // Inventory
  async getInventory(filters?: { restaurant?: string; status?: string }) {
    const params = new URLSearchParams();
    if (filters?.restaurant) params.append('restaurant', filters.restaurant);
    if (filters?.status) params.append('status', filters.status);
    const query = params.toString();
    return this.request(`${API_ENDPOINTS.INVENTORY}${query ? `?${query}` : ''}`);
  }

  // Users
  async getUsers() {
    return this.request(API_ENDPOINTS.USERS);
  }

  // Restaurant management
  async approveRestaurant(id: string) {
    return this.request(API_ENDPOINTS.APPROVE_RESTAURANT(id), { method: 'PATCH' });
  }

  // Promotions
  async getPromotions() {
    return this.request(API_ENDPOINTS.PROMOTIONS);
  }

  // Support
  async getSupportTickets() {
    return this.request(API_ENDPOINTS.SUPPORT);
  }

  // Audit
  async getAuditLogs() {
    return this.request(API_ENDPOINTS.AUDIT_LOGS);
  }
}

export const api = new ApiService();
