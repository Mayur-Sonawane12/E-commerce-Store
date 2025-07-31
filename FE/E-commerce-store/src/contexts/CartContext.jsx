import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      // Load cart from localStorage for non-authenticated users
      const savedCart = localStorage.getItem('cart');
      console.log('CartContext - Loading from localStorage:', savedCart);
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          console.log('CartContext - Parsed cart from localStorage:', parsedCart);
          setCart(parsedCart);
        } catch (error) {
          console.error('CartContext - Error parsing cart from localStorage:', error);
          setCart([]);
        }
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      console.log('CartContext - Saving to localStorage:', cart);
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, isAuthenticated]);

  const fetchCart = async () => {
    console.log('CartContext - fetchCart called, isAuthenticated:', isAuthenticated);
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/cart/getcart', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      console.log('CartContext - fetchCart API response:', response.data);
      console.log('CartContext - fetchCart items structure:', response.data.items);
      
      // Log each item to see its structure
      if (response.data.items && Array.isArray(response.data.items)) {
        response.data.items.forEach((item, index) => {
          console.log(`CartContext - item ${index}:`, item);
          console.log(`CartContext - item ${index} keys:`, Object.keys(item));
        });
      }
      
      // The API returns cart items with productId references, not full product data
      // We need to fetch the product details for each item
      const cartItemsWithProducts = await Promise.all(
        (response.data.items || []).map(async (item) => {
          try {
            const productResponse = await axios.get(`http://localhost:5000/api/products/${item.productId}`);
            return {
              ...item,
              product: productResponse.data
            };
          } catch (error) {
            console.error(`Error fetching product ${item.productId}:`, error);
            // Return item with placeholder product data if fetch fails
            return {
              ...item,
              product: {
                _id: item.productId,
                name: 'Product Not Found',
                price: 0,
                image: 'https://via.placeholder.com/100x100?text=Not+Found',
                category: 'Unknown',
                stock: 0
              }
            };
          }
        })
      );
      
      console.log('CartContext - cartItemsWithProducts:', cartItemsWithProducts);
      setCart(cartItemsWithProducts);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCart([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    console.log('CartContext - addToCart called with:', { product, quantity, isAuthenticated });
    try {
      if (isAuthenticated) {
        console.log('CartContext - Adding to cart via API for authenticated user');
        const response = await axios.post('http://localhost:5000/api/cart/addcart', {
          productId: product._id,
          quantity
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        console.log('CartContext - API response:', response.data);
        
        // The API returns cart items with productId references, not full product data
        // We need to fetch the product details for each item
        const cartItemsWithProducts = await Promise.all(
          (response.data.items || []).map(async (item) => {
            try {
              const productResponse = await axios.get(`http://localhost:5000/api/products/${item.productId}`);
              return {
                ...item,
                product: productResponse.data
              };
            } catch (error) {
              console.error(`Error fetching product ${item.productId}:`, error);
              // Return item with placeholder product data if fetch fails
              return {
                ...item,
                product: {
                  _id: item.productId,
                  name: 'Product Not Found',
                  price: 0,
                  image: 'https://via.placeholder.com/100x100?text=Not+Found',
                  category: 'Unknown',
                  stock: 0
                }
              };
            }
          })
        );
        
        console.log('CartContext - cartItemsWithProducts after add:', cartItemsWithProducts);
        setCart(cartItemsWithProducts);
      } else {
        console.log('CartContext - Adding to local cart for non-authenticated user');
        // Handle local cart for non-authenticated users
        const existingItem = cart.find(item => item.product._id === product._id);
        if (existingItem) {
          console.log('CartContext - Updating existing item quantity');
          setCart(cart.map(item => 
            item.product._id === product._id 
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ));
        } else {
          console.log('CartContext - Adding new item to cart');
          setCart([...cart, { product, quantity }]);
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const updateCartItem = async (productId, quantity) => {
    try {
      if (isAuthenticated) {
        // For update, we use the same endpoint as add but with the new quantity
        const response = await axios.post('http://localhost:5000/api/cart/addcart', {
          productId,
          quantity
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        // The API returns cart items with productId references, not full product data
        // We need to fetch the product details for each item
        const cartItemsWithProducts = await Promise.all(
          (response.data.items || []).map(async (item) => {
            try {
              const productResponse = await axios.get(`http://localhost:5000/api/products/${item.productId}`);
              return {
                ...item,
                product: productResponse.data
              };
            } catch (error) {
              console.error(`Error fetching product ${item.productId}:`, error);
              // Return item with placeholder product data if fetch fails
              return {
                ...item,
                product: {
                  _id: item.productId,
                  name: 'Product Not Found',
                  price: 0,
                  image: 'https://via.placeholder.com/100x100?text=Not+Found',
                  category: 'Unknown',
                  stock: 0
                }
              };
            }
          })
        );
        
        setCart(cartItemsWithProducts);
      } else {
        setCart(cart.map(item => 
          item.product._id === productId 
            ? { ...item, quantity }
            : item
        ));
      }
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      if (isAuthenticated) {
        const response = await axios.delete(`http://localhost:5000/api/cart/deletecart/${productId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        // The API returns cart items with productId references, not full product data
        // We need to fetch the product details for each item
        const cartItemsWithProducts = await Promise.all(
          (response.data.items || []).map(async (item) => {
            try {
              const productResponse = await axios.get(`http://localhost:5000/api/products/${item.productId}`);
              return {
                ...item,
                product: productResponse.data
              };
            } catch (error) {
              console.error(`Error fetching product ${item.productId}:`, error);
              // Return item with placeholder product data if fetch fails
              return {
                ...item,
                product: {
                  _id: item.productId,
                  name: 'Product Not Found',
                  price: 0,
                  image: 'https://via.placeholder.com/100x100?text=Not+Found',
                  category: 'Unknown',
                  stock: 0
                }
              };
            }
          })
        );
        
        setCart(cartItemsWithProducts);
      } else {
        setCart(cart.filter(item => item.product._id !== productId));
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const clearCart = async () => {
    try {
      if (isAuthenticated) {
        await axios.delete('http://localhost:5000/api/cart/deletecart', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setCart([]);
      } else {
        setCart([]);
        localStorage.removeItem('cart');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      if (!item || !item.product) return total;
      return total + ((item.product.price || 0) * item.quantity);
    }, 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    cart,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartCount,
    // handleProceedToCheckout,
    // handleContinueShopping
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 