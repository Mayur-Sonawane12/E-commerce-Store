import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaTruck, FaCheckCircle, FaTimesCircle, FaClock, FaMapMarkerAlt, FaCreditCard, FaPrint } from 'react-icons/fa';
import PrintInvoice from '../components/PrintInvoice';

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
  try {
    setLoading(true);
    const response = await axios.get(`http://localhost:5000/api/orders/order/${orderId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    setOrder(response.data);
  } catch (err) {
    setError(err.response?.data?.message || err.message || 'Failed to load order details');
    console.error('Error fetching order:', err);
  } finally {
    setLoading(false);
  }
};

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <FaClock className="text-warning" />;
      case 'processing':
        return <FaTruck className="text-info" />;
      case 'shipped':
        return <FaTruck className="text-primary" />;
      case 'delivered':
        return <FaCheckCircle className="text-success" />;
      case 'cancelled':
        return <FaTimesCircle className="text-danger" />;
      default:
        return <FaClock className="text-muted" />;
    }
  };

  const getStatusBadge = (status) => {
    const statusClass = {
      pending: 'bg-warning',
      processing: 'bg-info',
      shipped: 'bg-primary',
      delivered: 'bg-success',
      cancelled: 'bg-danger'
    };
    
    return `badge ${statusClass[status?.toLowerCase()] || 'bg-secondary'}`;
  };

  const getPaymentStatusBadge = (status) => {
    const statusClass = {
      pending: 'bg-warning',
      paid: 'bg-success'
    };
    
    return `badge ${statusClass[status?.toLowerCase()] || 'bg-secondary'}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOrderTimeline = () => {
    const timeline = [
      {
        status: 'Processing',
        description: 'Order confirmed and being prepared',
        icon: <FaClock className="text-info" />,
        active: ['Processing', 'Shipped', 'Delivered'].includes(order?.orderStatus)
      },
      {
        status: 'Shipped',
        description: 'Order has been shipped',
        icon: <FaTruck className="text-primary" />,
        active: ['Shipped', 'Delivered'].includes(order?.orderStatus)
      },
      {
        status: 'Delivered',
        description: 'Order has been delivered',
        icon: <FaCheckCircle className="text-success" />,
        active: order?.orderStatus === 'Delivered'
      }
    ];

    if (order?.orderStatus === 'Cancelled') {
      timeline.push({
        status: 'Cancelled',
        description: 'Order has been cancelled',
        icon: <FaTimesCircle className="text-danger" />,
        active: true
      });
    }

    return timeline;
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-12 text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <h3>Order Not Found</h3>
          <p className="text-muted">{error || 'The order you are looking for does not exist.'}</p>
          <button className="btn btn-primary" onClick={() => navigate('/orders')}>
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Order Details</h2>
          <p className="text-muted mb-0">Order #{order._id.slice(-8)}</p>
        </div>
        <div className="d-flex gap-2">
          <PrintInvoice order={order} />
          <button className="btn btn-outline-secondary" onClick={() => navigate('/orders')}>
            Back to Orders
          </button>
        </div>
      </div>

      <div className="row">
        {/* Order Information */}
        <div className="col-lg-8">
          {/* Order Status */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Order Status</h5>
            </div>
            <div className="card-body">
              <div className="row align-items-center mb-3">
                <div className="col-md-6">
                  <span className={getStatusBadge(order.orderStatus)}>
                    {getStatusIcon(order.orderStatus)} {order.orderStatus}
                  </span>
                </div>
                <div className="col-md-6 text-end">
                  <span className={getPaymentStatusBadge(order.paymentStatus)}>
                    {order.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Order Timeline */}
              <div className="order-timeline">
                {getOrderTimeline().map((step, index) => (
                  <div key={index} className={`timeline-step ${step.active ? 'active' : ''}`}>
                    <div className="timeline-icon">
                      {step.icon}
                    </div>
                    <div className="timeline-content">
                      <h6 className="mb-1">{step.status}</h6>
                      <p className="text-muted mb-0">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Order Items</h5>
            </div>
            <div className="card-body">
              {order.products?.map((item, index) => (
                <div key={index} className="row align-items-center py-3 border-bottom">
                  <div className="col-md-2"></div>
                  <div className="col-ms-4">
                    <img
                      src={item.productId?.image}
                      alt={item.productId?.name}
                      className="img-fluid rounded"
                      style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                    />
                  </div>
                  <div className="col-md-4">
                    <h6 className="mb-1">{item.productId?.title}</h6>
                    <p className="text-muted small mb-0">
                      Category: {item.productId?.category}
                    </p>
                  </div>
                  <div className="col-md-2 text-center">
                    <span className="fw-bold">Qty: {item.quantity}</span>
                  </div>
                  <div className="col-md-2 text-center">
                    <span className="fw-bold">₹{item.price?.toFixed(2)}</span>
                  </div>
                  <div className="col-md-2 text-end">
                    <span className="fw-bold text-primary">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Information */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <FaMapMarkerAlt className="me-2" />
                Shipping Information
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h6>Shipping Address</h6>
                  <p className="mb-1">
                    <strong>{order.shippingAddress?.fullName}</strong>
                  </p>
                  <p className="mb-1">{order.shippingAddress?.street}</p>
                  <p className="mb-1">
                    {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
                  </p>
                  <p className="mb-1">{order.shippingAddress?.country}</p>
                  <p className="mb-0">
                    <strong>Phone:</strong> {order.shippingAddress?.phone}
                  </p>
                </div>
                <div className="col-md-6">
                  <h6>Billing Address</h6>
                  <p className="mb-1">
                    <strong>{order.billingAddress?.fullName}</strong>
                  </p>
                  <p className="mb-1">{order.billingAddress?.street}</p>
                  <p className="mb-1">
                    {order.billingAddress?.city}, {order.billingAddress?.state} {order.billingAddress?.zipCode}
                  </p>
                  <p className="mb-1">{order.billingAddress?.country}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="col-lg-4">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Order Summary</h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span>Order Date:</span>
                <span>{formatDate(order.createdAt)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Order ID:</span>
                <span>#{order._id.slice(-8)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Payment Method:</span>
                <span>
                  <FaCreditCard className="me-1" />
                  {order.paymentMethod}
                </span>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>₹{order.subtotal?.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Shipping:</span>
                <span>₹{order.shippingCost?.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Tax (18% GST):</span>
                <span>₹{order.tax?.toFixed(2)}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-3">
                <strong>Total:</strong>
                <strong className="text-primary">₹{order.totalAmount?.toFixed(2)}</strong>
              </div>
              {order.orderStatus === 'Delivered' && (
                <div className="alert alert-success">
                  <FaCheckCircle className="me-2" />
                  Your order has been delivered successfully!
                </div>
              )}
              {order.orderStatus === 'Cancelled' && (
                <div className="alert alert-danger">
                  <FaTimesCircle className="me-2" />
                  This order has been cancelled.
                </div>
              )}
            </div>
          </div>
          {/* Customer Support */}
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Need Help?</h5>
            </div>
            <div className="card-body">
              <p className="text-muted">
                If you have any questions about your order, please contact our customer support.
              </p>
              <div className="d-grid gap-2">
                <button className="btn btn-outline-primary">
                  Contact Support
                </button>
                <button className="btn btn-outline-secondary">
                  Track Package
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles for Timeline */}
      <style jsx>{`
        .order-timeline {
          position: relative;
          padding-left: 30px;
        }
        
        .timeline-step {
          position: relative;
          margin-bottom: 20px;
          opacity: 0.5;
        }
        
        .timeline-step.active {
          opacity: 1;
        }
        
        .timeline-icon {
          position: absolute;
          left: -35px;
          top: 0;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #f8f9fa;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #dee2e6;
        }
        
        .timeline-step.active .timeline-icon {
          border-color: #007bff;
          background: #007bff;
          color: white;
        }
        
        .timeline-content h6 {
          margin-bottom: 5px;
        }
      `}</style>
    </div>
  );
};

export default OrderDetails;