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

    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${this.baseUrl}${endpoint}`, { ...options, headers });
    const data = await response.json();

    if (!response.ok) throw new Error(data.message || 'Request failed');
    return data;
  }

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
    if (response.token) await this.setToken(response.token);
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

  async getRestaurants(filters?: { status?: string; owner?: string }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.owner) params.append('owner', filters.owner);
    const query = params.toString();
    return this.request(`${API_ENDPOINTS.RESTAURANTS}${query ? `?${query}` : ''}`);
  }

  async getRestaurant(id: string) { return this.request(API_ENDPOINTS.RESTAURANT_BY_ID(id)); }

  async getCategories(restaurantId: string) {
    return this.request(`${API_ENDPOINTS.CATEGORIES}?restaurant=${restaurantId}`);
  }

  async createCategory(categoryData: { name: string; description?: string; restaurant: string }) {
    return this.request(API_ENDPOINTS.CATEGORIES, {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  async getProducts(filters?: { restaurant?: string; category?: string; available?: boolean }) {
    const params = new URLSearchParams();
    if (filters?.restaurant) params.append('restaurant', filters.restaurant);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.available !== undefined) params.append('available', String(filters.available));
    const query = params.toString();
    return this.request(`${API_ENDPOINTS.PRODUCTS}${query ? `?${query}` : ''}`);
  }

  async getProduct(id: string) { return this.request(API_ENDPOINTS.PRODUCT_BY_ID(id)); }

  async createProduct(productData: {
    restaurant: string;
    category: string;
    name: string;
    description?: string;
    image?: string;
    price: number;
  }) {
    return this.request(API_ENDPOINTS.PRODUCTS, {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async getOrders(filters?: { status?: string }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    const query = params.toString();
    return this.request(`${API_ENDPOINTS.ORDERS}${query ? `?${query}` : ''}`);
  }

  async getOrder(id: string) { return this.request(API_ENDPOINTS.ORDER_BY_ID(id)); }

  async createOrder(orderData: {
    restaurant: string;
    items: { product: string; quantity: number }[];
    deliveryType: 'PICKUP' | 'DELIVERY';
    deliveryAddress?: string;
    pickupTime?: string;
    paymentMethod?: 'CASH' | 'CARD' | 'TRANSFER';
  }) {
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

  async cancelOrder(orderId: string) {
    return this.request(API_ENDPOINTS.CANCEL_ORDER(orderId), { method: 'POST' });
  }

  async confirmDelivery(orderId: string, code: string) {
    return this.request(API_ENDPOINTS.CONFIRM_DELIVERY(orderId), {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  async getInventory(filters?: { restaurant?: string; status?: string }) {
    const params = new URLSearchParams();
    if (filters?.restaurant) params.append('restaurant', filters.restaurant);
    if (filters?.status) params.append('status', filters.status);
    const query = params.toString();
    return this.request(`${API_ENDPOINTS.INVENTORY}${query ? `?${query}` : ''}`);
  }

  async createInventory(inventoryData: { product: string; restaurant: string; stock: number; minimumStock: number }) {
    return this.request(API_ENDPOINTS.INVENTORY, {
      method: 'POST',
      body: JSON.stringify(inventoryData),
    });
  }

  async getUsers() { return this.request(API_ENDPOINTS.USERS); }
  async approveRestaurant(id: string) { return this.request(API_ENDPOINTS.APPROVE_RESTAURANT(id), { method: 'PATCH' }); }
  async getPromotions() { return this.request(API_ENDPOINTS.PROMOTIONS); }
  async getSupportTickets() { return this.request(API_ENDPOINTS.SUPPORT); }
  async getAuditLogs() { return this.request(API_ENDPOINTS.AUDIT_LOGS); }
}

export const api = new ApiService();
