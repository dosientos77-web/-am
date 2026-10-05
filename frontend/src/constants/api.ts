/**
 * ÑamFod - Configuración de API
 */
export const API_BASE_URL =
  typeof process !== 'undefined' && process.env?.API_URL
    ? process.env.API_URL
    : 'http://localhost:5001/api';

export const API_ENDPOINTS = {
  // Auth
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  ME: '/auth/me',
  FORGOT_PASSWORD: '/auth/forgot-password',

  // Users
  USERS: '/users',
  USER_BY_ID: (id: string) => `/users/${id}`,

  // Restaurants
  RESTAURANTS: '/restaurants',
  RESTAURANT_BY_ID: (id: string) => `/restaurants/${id}`,
  APPROVE_RESTAURANT: (id: string) => `/restaurants/${id}/approve`,
  SUSPEND_RESTAURANT: (id: string) => `/restaurants/${id}/suspend`,

  // Categories
  CATEGORIES: '/categories',
  CATEGORY_BY_ID: (id: string) => `/categories/${id}`,

  // Products
  PRODUCTS: '/products',
  PRODUCT_BY_ID: (id: string) => `/products/${id}`,

  // Inventory
  INVENTORY: '/inventory',
  INVENTORY_BY_ID: (id: string) => `/inventory/${id}`,

  // Orders
  ORDERS: '/orders',
  ORDER_BY_ID: (id: string) => `/orders/${id}`,
  ORDER_STATUS: (id: string) => `/orders/${id}/status`,
  CANCEL_ORDER: (id: string) => `/orders/${id}/cancel`,
  CONFIRM_DELIVERY: (id: string) => `/orders/${id}/confirm-delivery`,

  // Deliveries
  DELIVERIES: '/deliveries',
  DELIVERY_BY_ID: (id: string) => `/deliveries/${id}`,

  // Reviews
  REVIEWS: '/reviews',

  // Promotions
  PROMOTIONS: '/promotions',

  // Notifications
  NOTIFICATIONS: '/notifications',

  // Support
  SUPPORT: '/support',

  // Admin
  ADMIN_STATS: '/admin/stats',
  AUDIT_LOGS: '/admin/audit-logs',
} as const;
