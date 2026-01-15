import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cart/');
      // Handle both paginated and direct array responses
      const cartData = Array.isArray(response.data.results) 
        ? response.data.results 
        : (Array.isArray(response.data) ? response.data : []);
      setCartItems(cartData);
    } catch (error) {
      // If user is not authenticated, cart will be empty
      if (error.response?.status !== 401) {
        console.error('Error fetching cart:', error);
      }
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const addToCart = async (productId, quantity = 1) => {
    try {
      await api.post('/cart/', {
        product_id: productId,
        quantity: quantity,
      });
      await fetchCart();
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const updateCartItem = async (cartItemId, quantity) => {
    try {
      await api.patch(`/cart/${cartItemId}/`, { quantity });
      await fetchCart();
    } catch (error) {
      console.error('Error updating cart:', error);
      throw error;
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      await api.delete(`/cart/${cartItemId}/`);
      await fetchCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  };

  const getCartTotal = () => {
    if (!Array.isArray(cartItems)) return 0;
    return cartItems.reduce((total, item) => total + (item.total_price || 0), 0);
  };

  const getCartCount = () => {
    if (!Array.isArray(cartItems)) return 0;
    return cartItems.reduce((count, item) => count + (item.quantity || 0), 0);
  };

  const value = {
    cartItems,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    getCartTotal,
    getCartCount,
    fetchCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

