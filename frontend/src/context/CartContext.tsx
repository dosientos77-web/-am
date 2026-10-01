import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem, Product } from '../types';

interface CartState {
  items: CartItem[];
  restaurantId: string | null;
}

type CartAction =
  | { type: 'ADD_ITEM'; product: Product; quantity: number }
  | { type: 'REMOVE_ITEM'; productId: string }
  | { type: 'UPDATE_QUANTITY'; productId: string; quantity: number }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; state: CartState };

interface CartContextType {
  state: CartState;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = '@ñamfod_cart';

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, quantity } = action;
      // If cart has items from a different restaurant, clear first
      if (state.restaurantId && state.restaurantId !== product.restaurant) {
        return {
          items: [{ product, quantity }],
          restaurantId: product.restaurant,
        };
      }
      const existingIndex = state.items.findIndex((item) => item.product._id === product._id);
      if (existingIndex >= 0) {
        const newItems = [...state.items];
        newItems[existingIndex] = { ...newItems[existingIndex], quantity: newItems[existingIndex].quantity + quantity };
        return { items: newItems, restaurantId: product.restaurant };
      }
      return {
        items: [...state.items, { product, quantity }],
        restaurantId: product.restaurant,
      };
    }
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter((item) => item.product._id !== action.productId);
      return {
        items: newItems,
        restaurantId: newItems.length === 0 ? null : state.restaurantId,
      };
    }
    case 'UPDATE_QUANTITY': {
      if (action.quantity <= 0) {
        const newItems = state.items.filter((item) => item.product._id !== action.productId);
        return {
          items: newItems,
          restaurantId: newItems.length === 0 ? null : state.restaurantId,
        };
      }
      return {
        ...state,
        items: state.items.map((item) =>
          item.product._id === action.productId ? { ...item, quantity: action.quantity } : item
        ),
      };
    }
    case 'CLEAR_CART':
      return { items: [], restaurantId: null };
    case 'LOAD_CART':
      return action.state;
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], restaurantId: null });

  // Load cart from storage on mount
  useEffect(() => {
    AsyncStorage.getItem(CART_STORAGE_KEY).then((saved) => {
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          dispatch({ type: 'LOAD_CART', state: parsed });
        } catch {
          // Invalid data, ignore
        }
      }
    });
  }, []);

  // Save cart to storage on change
  useEffect(() => {
    AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const addItem = (product: Product, quantity = 1) => {
    dispatch({ type: 'ADD_ITEM', product, quantity });
  };

  const removeItem = (productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', productId });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', productId, quantity });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = state.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ state, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
