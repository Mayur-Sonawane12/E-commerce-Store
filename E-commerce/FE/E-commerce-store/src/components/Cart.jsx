import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { FaTrash, FaMinus, FaPlus, FaTruck } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const { cart, updateCartItem, removeFromCart, getCartTotal, loading, addToCart } = useCart();
  const [updatingItems, setUpdatingItems] = useState(new Set());
  const navigate = useNavigate();

  const handleQuantityChange = async (productId, newQuantity) => {
    console.log('handleQuantityChange called with:', { productId, newQuantity });
    if (newQuantity > 0) {
      setUpdatingItems(prev => new Set(prev).add(productId));
      try {
        await updateCartItem(productId, newQuantity);
      } catch (error) {
        console.error('Error updating quantity:', error);
        // You could add a toast notification here
      } finally {
        setUpdatingItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
      }
    }
  };

  const handleRemoveItem = async (productId) => {
    console.log('handleRemoveItem called with:', productId);
    setUpdatingItems(prev => new Set(prev).add(productId));
    try {
      await removeFromCart(productId);
    } catch (error) {
      console.error('Error removing item:', error);
      // You could add a toast notification here
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  // Calculate order totals (matching checkout logic)
  const calculateTotals = () => {
    const subtotal = getCartTotal();
    const shippingCost = subtotal > 1000 ? 0 : 100; // Free shipping over ₹1000
    const tax = subtotal * 0.18; // 18% GST
    const total = subtotal + shippingCost + tax;
    
    return { subtotal, shippingCost, tax, total };
  };

  const { subtotal, shippingCost, tax, total } = calculateTotals();

  if (loading) {
    return (
      <div className="text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="text-center py-5">
        <h4>Your cart is empty</h4>
        <p className="text-muted">Add some products to your cart to get started!</p>
        <button 
          className="btn btn-primary mt-3" 
          onClick={() => navigate('/')}
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  // Filter out items with missing product data
  const validCartItems = cart.filter(item => item && item.product);
  
  console.log('Cart component - validCartItems:', validCartItems);
  console.log('Cart component - validCartItems length:', validCartItems.length);
  
  // Log each item to see its structure
  cart.forEach((item, index) => {
    console.log(`Cart component - item ${index}:`, item);
    console.log(`Cart component - item ${index} has product:`, !!item?.product);
    if (item?.product) {
      console.log(`Cart component - item ${index} product structure:`, item.product);
    }
  });

  if (validCartItems.length === 0) {
    return (
      <div className="text-center py-5">
        <h4>Your cart is empty</h4>
        <p className="text-muted">Add some products to your cart to get started!</p>
        <button 
          className="btn btn-primary mt-3" 
          onClick={() => navigate('/')}
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  const handleProceedToCheckout = () => {
    navigate('/checkout');
  };

  const handleContinueShopping = () => {
    navigate('/'); 
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Shopping Cart</h2>
      
      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-body">
              {validCartItems.map((item) => (
                <div key={item.product._id} className="row align-items-center py-3 border-bottom">
                  <div className="col-md-2">
                    <img
                      src={item.product.image}
                      alt={item.product.name || 'Product'}
                      className="img-fluid rounded"
                      style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/100x100?text=Product';
                      }}
                    />
                  </div>
                  
                  <div className="col-md-4">
                    <h6 className="mb-1">{item.product.name || 'Product Name Unavailable'}</h6>
                    <p className="text-muted small mb-0">
                      Category: {item.product.category || 'Uncategorized'}
                    </p>
                    {item.product.stock !== undefined && item.product.stock <= 5 && item.product.stock > 0 && (
                      <span className="badge bg-warning text-dark">
                        Only {item.product.stock} left!
                      </span>
                    )}
                  </div>
                  
                  <div className="col-md-2">
                    <span className="fw-bold text-primary">
                      ₹{(item.product.price || 0).toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="col-md-2">
                    <div className="input-group input-group-sm">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                        disabled={item.quantity <= 1 || updatingItems.has(item.productId)}
                      >
                        {updatingItems.has(item.productId) ? (
                          <div className="spinner-border spinner-border-sm" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        ) : (
                          <FaMinus />
                        )}
                      </button>
                      <input
                        type="number"
                        className="form-control text-center"
                        value={item.quantity}
                        onChange={(e) => {
                          const newQuantity = parseInt(e.target.value);
                          const maxStock = item.product.stock || 999;
                          if (newQuantity > 0 && newQuantity <= maxStock) {
                            handleQuantityChange(item.productId, newQuantity);
                          }
                        }}
                        min="1"
                        max={item.product.stock || 999}
                        style={{ width: '60px' }}
                        disabled={updatingItems.has(item.productId)}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                        disabled={item.product.stock !== undefined && item.quantity >= item.product.stock || updatingItems.has(item.productId)}
                      >
                        {updatingItems.has(item.productId) ? (
                          <div className="spinner-border spinner-border-sm" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        ) : (
                          <FaPlus />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="col-md-1">
                    <span className="fw-bold">
                      ₹{((item.product.price || 0) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="col-md-1">
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleRemoveItem(item.productId)}
                      disabled={updatingItems.has(item.productId)}
                    >
                      {updatingItems.has(item.productId) ? (
                        <div className="spinner-border spinner-border-sm" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      ) : (
                        <FaTrash />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="col-lg-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Order Summary</h5>
              
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              
              <div className="d-flex justify-content-between mb-2">
                <span>Shipping:</span>
                <span>{shippingCost === 0 ? 'Free' : `₹${shippingCost.toFixed(2)}`}</span>
              </div>
              
              <div className="d-flex justify-content-between mb-2">
                <span>Tax (18% GST):</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              
              <hr />
              
              <div className="d-flex justify-content-between mb-3">
                <strong>Total:</strong>
                <strong className="text-primary">₹{total.toFixed(2)}</strong>
              </div>

              {shippingCost === 0 && (
                <div className="alert alert-success">
                  <FaTruck className="me-2" />
                  Free shipping on orders over ₹1000!
                </div>
              )}

              {shippingCost > 0 && (
                <div className="alert alert-info">
                  <small>
                    Add ₹{(1000 - subtotal).toFixed(2)} more to get free shipping!
                  </small>
                </div>
              )}
              
              <button 
                className="btn btn-primary w-100 mb-2" 
                onClick={handleProceedToCheckout}
                disabled={validCartItems.length === 0}
              >
                Proceed to Checkout
              </button>
              
              <button 
                className="btn btn-outline-secondary w-100" 
                onClick={handleContinueShopping}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;