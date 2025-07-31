import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaCreditCard, FaLock, FaShieldAlt, FaTruck, FaCheckCircle } from 'react-icons/fa';

const Checkout = () => {
  const { cart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [shipping, setShipping] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  });

  const [payment, setPayment] = useState({
    cardNumber: '',
    cardName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    paymentMethod: 'card'
  });

  const [billing, setBilling] = useState({
    sameAsShipping: true,
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India'
    }
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  // Load user data if available
  useEffect(() => {
    if (user) {
      setShipping(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  // Validation functions
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone) => {
    const re = /^[0-9]{10}$/;
    return re.test(phone);
  };

  const validateCardNumber = (cardNumber) => {
    const re = /^[0-9]{16}$/;
    return re.test(cardNumber.replace(/\s/g, ''));
  };

  const validateCVV = (cvv) => {
    const re = /^[0-9]{3,4}$/;
    return re.test(cvv);
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!shipping.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!shipping.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!validateEmail(shipping.email)) newErrors.email = 'Valid email is required';
      if (!validatePhone(shipping.phone)) newErrors.phone = 'Valid phone number is required';
      if (!shipping.street.trim()) newErrors.street = 'Street address is required';
      if (!shipping.city.trim()) newErrors.city = 'City is required';
      if (!shipping.state.trim()) newErrors.state = 'State is required';
      if (!shipping.zipCode.trim()) newErrors.zipCode = 'Zip code is required';
    }

    if (step === 2 && !billing.sameAsShipping) {
      if (!billing.address.street.trim()) newErrors.billingStreet = 'Billing street is required';
      if (!billing.address.city.trim()) newErrors.billingCity = 'Billing city is required';
      if (!billing.address.state.trim()) newErrors.billingState = 'Billing state is required';
      if (!billing.address.zipCode.trim()) newErrors.billingZipCode = 'Billing zip code is required';
    }

    if (step === 3) {
      if (payment.paymentMethod === 'card') {
        if (!validateCardNumber(payment.cardNumber)) newErrors.cardNumber = 'Valid card number is required';
        if (!payment.cardName.trim()) newErrors.cardName = 'Card holder name is required';
        if (!payment.expiryMonth || !payment.expiryYear) newErrors.expiry = 'Expiry date is required';
        if (!validateCVV(payment.cvv)) newErrors.cvv = 'Valid CVV is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShipping(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPayment(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBillingChange = (e) => {
    const { name, value } = e.target;
    setBilling(prev => ({
      ...prev,
      address: { ...prev.address, [name]: value }
    }));
    
    if (errors[`billing${name.charAt(0).toUpperCase() + name.slice(1)}`]) {
      setErrors(prev => ({ ...prev, [`billing${name.charAt(0).toUpperCase() + name.slice(1)}`]: '' }));
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setPayment(prev => ({ ...prev, cardNumber: formatted }));
  };

  const calculateTotals = () => {
    const subtotal = getCartTotal();
    const shippingCost = subtotal > 1000 ? 0 : 100; // Free shipping over ₹1000
    const tax = subtotal * 0.18; // 18% GST
    const total = subtotal + shippingCost + tax;
    
    return { subtotal, shippingCost, tax, total };
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    setLoading(true);
    setErrors({});

    try {
      const { subtotal, shippingCost, tax, total } = calculateTotals();
      
      const orderData = {
        products: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price
        })),
        totalAmount: total,
        subtotal,
        shippingCost,
        tax,
        shippingAddress: {
          ...shipping,
          fullName: `${shipping.firstName} ${shipping.lastName}`
        },
        billingAddress: billing.sameAsShipping ? {
          ...shipping,
          fullName: `${shipping.firstName} ${shipping.lastName}`
        } : {
          ...billing.address,
          fullName: `${shipping.firstName} ${shipping.lastName}`,
          firstName: shipping.firstName,
          lastName: shipping.lastName,
          email: shipping.email,
          phone: shipping.phone,
          country: shipping.country
        },
        paymentMethod: payment.paymentMethod,
        paymentStatus: 'Pending'
      };

      const response = await axios.post(
        'http://localhost:5000/api/orders/placeorder',
        orderData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      setSuccess('Order placed successfully! Redirecting to order details...');
      clearCart();
      
      // Navigate to order details page with error handling
      setTimeout(() => {
        navigate(`/orders/${response.data._id}`);
      }, 2000);
    } catch (err) {
      setErrors({
        general: err.response?.data?.message || 'Failed to place order. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, shippingCost, tax, total } = calculateTotals();

  if (cart.length === 0) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <h3>Your cart is empty</h3>
          <p>Add some products to your cart to proceed with checkout.</p>
          <button className="btn btn-primary" onClick={() => navigate('/products')}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h4 className="mb-0">Checkout</h4>
            </div>
            <div className="card-body">
              {/* Progress Steps */}
              <div className="row mb-4">
                <div className={`col-4 text-center ${currentStep >= 1 ? 'text-primary' : 'text-muted'}`}>
                  <div className={`rounded-circle d-inline-flex align-items-center justify-content-center ${currentStep >= 1 ? 'bg-primary text-white' : 'bg-light'}`} style={{width: '40px', height: '40px'}}>
                    {currentStep > 1 ? <FaCheckCircle /> : '1'}
                  </div>
                  <div className="mt-2">Shipping</div>
                </div>
                <div className={`col-4 text-center ${currentStep >= 2 ? 'text-primary' : 'text-muted'}`}>
                  <div className={`rounded-circle d-inline-flex align-items-center justify-content-center ${currentStep >= 2 ? 'bg-primary text-white' : 'bg-light'}`} style={{width: '40px', height: '40px'}}>
                    {currentStep > 2 ? <FaCheckCircle /> : '2'}
                  </div>
                  <div className="mt-2">Billing</div>
                </div>
                <div className={`col-4 text-center ${currentStep >= 3 ? 'text-primary' : 'text-muted'}`}>
                  <div className={`rounded-circle d-inline-flex align-items-center justify-content-center ${currentStep >= 3 ? 'bg-primary text-white' : 'bg-light'}`} style={{width: '40px', height: '40px'}}>
                    3
                  </div>
                  <div className="mt-2">Payment</div>
                </div>
              </div>

              {/* Step 1: Shipping Information */}
              {currentStep === 1 && (
                <div>
                  <h5 className="mb-3">Shipping Information</h5>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">First Name *</label>
                      <input
                        type="text"
                        className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                        name="firstName"
                        value={shipping.firstName}
                        onChange={handleShippingChange}
                      />
                      {errors.firstName && <div className="invalid-feedback">{errors.firstName}</div>}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Last Name *</label>
                      <input
                        type="text"
                        className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                        name="lastName"
                        value={shipping.lastName}
                        onChange={handleShippingChange}
                      />
                      {errors.lastName && <div className="invalid-feedback">{errors.lastName}</div>}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Email *</label>
                      <input
                        type="email"
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                        name="email"
                        value={shipping.email}
                        onChange={handleShippingChange}
                      />
                      {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Phone *</label>
                      <input
                        type="tel"
                        className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                        name="phone"
                        value={shipping.phone}
                        onChange={handleShippingChange}
                        placeholder="10-digit number"
                      />
                      {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label">Street Address *</label>
                      <input
                        type="text"
                        className={`form-control ${errors.street ? 'is-invalid' : ''}`}
                        name="street"
                        value={shipping.street}
                        onChange={handleShippingChange}
                      />
                      {errors.street && <div className="invalid-feedback">{errors.street}</div>}
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">City *</label>
                      <input
                        type="text"
                        className={`form-control ${errors.city ? 'is-invalid' : ''}`}
                        name="city"
                        value={shipping.city}
                        onChange={handleShippingChange}
                      />
                      {errors.city && <div className="invalid-feedback">{errors.city}</div>}
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">State *</label>
                      <input
                        type="text"
                        className={`form-control ${errors.state ? 'is-invalid' : ''}`}
                        name="state"
                        value={shipping.state}
                        onChange={handleShippingChange}
                      />
                      {errors.state && <div className="invalid-feedback">{errors.state}</div>}
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Zip Code *</label>
                      <input
                        type="text"
                        className={`form-control ${errors.zipCode ? 'is-invalid' : ''}`}
                        name="zipCode"
                        value={shipping.zipCode}
                        onChange={handleShippingChange}
                      />
                      {errors.zipCode && <div className="invalid-feedback">{errors.zipCode}</div>}
                    </div>
                  </div>
                  <div className="text-end">
                    <button className="btn btn-primary" onClick={handleNext}>
                      Continue to Billing
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Billing Information */}
              {currentStep === 2 && (
                <div>
                  <h5 className="mb-3">Billing Information</h5>
                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="sameAsShipping"
                        checked={billing.sameAsShipping}
                        onChange={(e) => setBilling(prev => ({ ...prev, sameAsShipping: e.target.checked }))}
                      />
                      <label className="form-check-label" htmlFor="sameAsShipping">
                        Same as shipping address
                      </label>
                    </div>
                  </div>
                  
                  {!billing.sameAsShipping && (
                    <div className="row">
                      <div className="col-12 mb-3">
                        <label className="form-label">Street Address *</label>
                        <input
                          type="text"
                          className={`form-control ${errors.billingStreet ? 'is-invalid' : ''}`}
                          name="street"
                          value={billing.address.street}
                          onChange={handleBillingChange}
                        />
                        {errors.billingStreet && <div className="invalid-feedback">{errors.billingStreet}</div>}
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label">City *</label>
                        <input
                          type="text"
                          className={`form-control ${errors.billingCity ? 'is-invalid' : ''}`}
                          name="city"
                          value={billing.address.city}
                          onChange={handleBillingChange}
                        />
                        {errors.billingCity && <div className="invalid-feedback">{errors.billingCity}</div>}
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label">State *</label>
                        <input
                          type="text"
                          className={`form-control ${errors.billingState ? 'is-invalid' : ''}`}
                          name="state"
                          value={billing.address.state}
                          onChange={handleBillingChange}
                        />
                        {errors.billingState && <div className="invalid-feedback">{errors.billingState}</div>}
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Zip Code *</label>
                        <input
                          type="text"
                          className={`form-control ${errors.billingZipCode ? 'is-invalid' : ''}`}
                          name="zipCode"
                          value={billing.address.zipCode}
                          onChange={handleBillingChange}
                        />
                        {errors.billingZipCode && <div className="invalid-feedback">{errors.billingZipCode}</div>}
                      </div>
                    </div>
                  )}
                  
                  <div className="d-flex justify-content-between">
                    <button className="btn btn-outline-secondary" onClick={handlePrev}>
                      Back to Shipping
                    </button>
                    <button className="btn btn-primary" onClick={handleNext}>
                      Continue to Payment
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Payment Information */}
              {currentStep === 3 && (
                <div>
                  <h5 className="mb-3">Payment Information</h5>
                  
                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="paymentMethod"
                        id="card"
                        value="card"
                        checked={payment.paymentMethod === 'card'}
                        onChange={handlePaymentChange}
                      />
                      <label className="form-check-label" htmlFor="card">
                        <FaCreditCard className="me-2" />
                        Credit/Debit Card
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="paymentMethod"
                        id="cod"
                        value="cod"
                        checked={payment.paymentMethod === 'cod'}
                        onChange={handlePaymentChange}
                      />
                      <label className="form-check-label" htmlFor="cod">
                        <FaLock className="me-2" />
                        Cash on Delivery
                      </label>
                    </div>
                  </div>

                  {payment.paymentMethod === 'card' && (
                    <div className="row">
                      <div className="col-12 mb-3">
                        <label className="form-label">Card Number *</label>
                        <input
                          type="text"
                          className={`form-control ${errors.cardNumber ? 'is-invalid' : ''}`}
                          name="cardNumber"
                          value={payment.cardNumber}
                          onChange={handleCardNumberChange}
                          placeholder="1234 5678 9012 3456"
                          maxLength="19"
                        />
                        {errors.cardNumber && <div className="invalid-feedback">{errors.cardNumber}</div>}
                      </div>
                      <div className="col-12 mb-3">
                        <label className="form-label">Card Holder Name *</label>
                        <input
                          type="text"
                          className={`form-control ${errors.cardName ? 'is-invalid' : ''}`}
                          name="cardName"
                          value={payment.cardName}
                          onChange={handlePaymentChange}
                        />
                        {errors.cardName && <div className="invalid-feedback">{errors.cardName}</div>}
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Expiry Month *</label>
                        <select
                          className={`form-select ${errors.expiry ? 'is-invalid' : ''}`}
                          name="expiryMonth"
                          value={payment.expiryMonth}
                          onChange={handlePaymentChange}
                        >
                          <option value="">Month</option>
                          {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                            <option key={month} value={month.toString().padStart(2, '0')}>
                              {month.toString().padStart(2, '0')}
                            </option>
                          ))}
                        </select>
                        {errors.expiry && <div className="invalid-feedback">{errors.expiry}</div>}
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Expiry Year *</label>
                        <select
                          className={`form-select ${errors.expiry ? 'is-invalid' : ''}`}
                          name="expiryYear"
                          value={payment.expiryYear}
                          onChange={handlePaymentChange}
                        >
                          <option value="">Year</option>
                          {Array.from({length: 10}, (_, i) => new Date().getFullYear() + i).map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                        {errors.expiry && <div className="invalid-feedback">{errors.expiry}</div>}
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label">CVV *</label>
                        <input
                          type="text"
                          className={`form-control ${errors.cvv ? 'is-invalid' : ''}`}
                          name="cvv"
                          value={payment.cvv}
                          onChange={handlePaymentChange}
                          placeholder="123"
                          maxLength="4"
                        />
                        {errors.cvv && <div className="invalid-feedback">{errors.cvv}</div>}
                      </div>
                    </div>
                  )}

                  <div className="alert alert-info">
                    <FaShieldAlt className="me-2" />
                    Your payment information is secure and encrypted.
                  </div>

                  <div className="d-flex justify-content-between">
                    <button className="btn btn-outline-secondary" onClick={handlePrev}>
                      Back to Billing
                    </button>
                    <button 
                      className="btn btn-success" 
                      onClick={handlePlaceOrder}
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : 'Place Order'}
                    </button>
                  </div>
                </div>
              )}

              {errors.general && (
                <div className="alert alert-danger mt-3">
                  {errors.general}
                </div>
              )}

              {success && (
                <div className="alert alert-success mt-3">
                  {success}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Order Summary</h5>
            </div>
            <div className="card-body">
              {cart.map((item) => (
                <div key={item.productId} className="d-flex justify-content-between mb-2">
                  <div>
                    <h6 className="mb-0">{item.product.name}</h6>
                    <small className="text-muted">Qty: {item.quantity}</small>
                  </div>
                  <span>₹{(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              
              <hr />
              
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;