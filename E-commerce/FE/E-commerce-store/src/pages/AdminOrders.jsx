import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEye, FaEdit, FaTruck, FaCheckCircle, FaTimesCircle, FaClock, FaFilter, FaSearch } from 'react-icons/fa';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  // Filter states
  const [filters, setFilters] = useState({
    status: 'all',
    paymentStatus: 'all',
    search: '',
    dateRange: 'all'  
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:5000/api/orders/getallorders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Ensure we always set an array, even if the response is not as expected
      const ordersData = Array.isArray(response.data) ? response.data : [];
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(error.response?.data?.message || 'Failed to fetch orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    // Ensure orders is always an array before filtering
    if (!Array.isArray(orders)) {
      setFilteredOrders([]);
      return;
    }

    let filtered = [...orders];

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(order => order.orderStatus === filters.status);
    }

    // Payment status filter
    if (filters.paymentStatus !== 'all') {
      filtered = filtered.filter(order => order.paymentStatus === filters.paymentStatus);
    }

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(order => 
        order._id?.toLowerCase().includes(searchTerm) ||
        order.shippingAddress?.fullName?.toLowerCase().includes(searchTerm) ||
        order.shippingAddress?.email?.toLowerCase().includes(searchTerm) ||
        order.userId?.name?.toLowerCase().includes(searchTerm) ||
        order.userId?.email?.toLowerCase().includes(searchTerm)
      );
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      switch (filters.dateRange) {
        case 'today':
          filtered = filtered.filter(order => new Date(order.createdAt) >= today);
          break;
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(order => new Date(order.createdAt) >= weekAgo);
          break;
        case 'month':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(order => new Date(order.createdAt) >= monthAgo);
          break;
        default:
          break;
      }
    }

    setFilteredOrders(filtered);
  };

  const updateOrderStatus = async (orderId, orderStatus, paymentStatus) => {
    try {
      setUpdating(true);
      setError('');
      const token = localStorage.getItem('token');
      
      await axios.put(
        `http://localhost:5000/api/orders/updateorder/${orderId}/status`,
        { orderStatus, paymentStatus },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Update local state
      setOrders(prev => prev.map(order => 
        order._id === orderId 
          ? { ...order, orderStatus, paymentStatus }
          : order
      ));
      
      setShowModal(false);
    } catch (error) {
      console.error('Error updating order:', error);
      setError(error.response?.data?.message || 'Failed to update order');
    } finally {
      setUpdating(false);
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
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateTotalRevenue = () => {
    return filteredOrders
      .filter(order => order.paymentStatus === 'Paid')
      .reduce((total, order) => total + (order.totalAmount || 0), 0);
  };

  const getOrderStats = () => {
    if (!Array.isArray(filteredOrders)) {
      return {
        total: 0,
        pending: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
        revenue: 0
      };
    }
    
    const stats = {
      total: filteredOrders.length,
      pending: filteredOrders.filter(o => o.orderStatus === 'Processing').length,
      shipped: filteredOrders.filter(o => o.orderStatus === 'Shipped').length,
      delivered: filteredOrders.filter(o => o.orderStatus === 'Delivered').length,
      cancelled: filteredOrders.filter(o => o.orderStatus === 'Cancelled').length,
      revenue: calculateTotalRevenue()
    };
    return stats;
  };

  const stats = getOrderStats();

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

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Order Management</h2>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary" onClick={fetchOrders}>
            <FaSearch className="me-1" />
            Refresh
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="col-md-2">
          <div className="card bg-primary text-white">
            <div className="card-body text-center">
              <h5>{stats.total}</h5>
              <small>Total Orders</small>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card bg-warning text-white">
            <div className="card-body text-center">
              <h5>{stats.pending}</h5>
              <small>Processing</small>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card bg-info text-white">
            <div className="card-body text-center">
              <h5>{stats.shipped}</h5>
              <small>Shipped</small>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card bg-success text-white">
            <div className="card-body text-center">
              <h5>{stats.delivered}</h5>
              <small>Delivered</small>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card bg-danger text-white">
            <div className="card-body text-center">
              <h5>{stats.cancelled}</h5>
              <small>Cancelled</small>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card bg-dark text-white">
            <div className="card-body text-center">
              <h5>₹{stats.revenue.toFixed(2)}</h5>
              <small>Revenue</small>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-3">
              <label className="form-label">Order Status</label>
              <select
                className="form-select"
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="all">All Statuses</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Payment Status</label>
              <select
                className="form-select"
                value={filters.paymentStatus}
                onChange={(e) => setFilters(prev => ({ ...prev, paymentStatus: e.target.value }))}
              >
                <option value="all">All Payments</option>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Date Range</label>
              <select
                className="form-select"
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Search</label>
              <input
                type="text"
                className="form-control"
                placeholder="Order ID, Customer Name, Email..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Order Status</th>
                  <th>Payment Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(filteredOrders) && filteredOrders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <strong>#{order._id.slice(-8)}</strong>
                    </td>
                    <td>
                      <div>
                        <strong>{order.shippingAddress?.fullName || order.userId?.name || 'N/A'}</strong>
                        <br />
                        <small className="text-muted">{order.shippingAddress?.email || order.userId?.email || 'N/A'}</small>
                      </div>
                    </td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>
                      <strong>₹{order.totalAmount?.toFixed(2) || '0.00'}</strong>
                    </td>
                    <td>
                      <span className={getStatusBadge(order.orderStatus)}>
                        {getStatusIcon(order.orderStatus)} {order.orderStatus || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span className={getPaymentStatusBadge(order.paymentStatus)}>
                        {order.paymentStatus || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group" role="group">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowModal(true);
                          }}
                        >
                          <FaEye />
                        </button>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowModal(true);
                          }}
                        >
                          <FaEdit />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(!Array.isArray(filteredOrders) || filteredOrders.length === 0) && (
            <div className="text-center py-4">
              <h5>No orders found</h5>
              <p className="text-muted">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Order Details - #{selectedOrder._id.slice(-8)}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6>Customer Information</h6>
                    <p><strong>Name:</strong> {selectedOrder.shippingAddress?.fullName || selectedOrder.userId?.name || 'N/A'}</p>
                    <p><strong>Email:</strong> {selectedOrder.shippingAddress?.email || selectedOrder.userId?.email || 'N/A'}</p>
                    <p><strong>Phone:</strong> {selectedOrder.shippingAddress?.phone || 'N/A'}</p>
                    
                    <h6 className="mt-3">Shipping Address</h6>
                    <p>{selectedOrder.shippingAddress?.street || 'N/A'}</p>
                    <p>{selectedOrder.shippingAddress?.city || 'N/A'}, {selectedOrder.shippingAddress?.state || 'N/A'} {selectedOrder.shippingAddress?.zipCode || 'N/A'}</p>
                    <p>{selectedOrder.shippingAddress?.country || 'N/A'}</p>
                  </div>
                  <div className="col-md-6">
                    <h6>Order Information</h6>
                    <p><strong>Order Date:</strong> {formatDate(selectedOrder.createdAt)}</p>
                    <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod || 'N/A'}</p>
                    <p><strong>Subtotal:</strong> ₹{selectedOrder.subtotal?.toFixed(2) || '0.00'}</p>
                    <p><strong>Shipping:</strong> ₹{selectedOrder.shippingCost?.toFixed(2) || '0.00'}</p>
                    <p><strong>Tax:</strong> ₹{selectedOrder.tax?.toFixed(2) || '0.00'}</p>
                    <p><strong>Total:</strong> ₹{selectedOrder.totalAmount?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>

                <h6 className="mt-3">Order Items</h6>
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(selectedOrder.products) && selectedOrder.products.map((item, index) => (
                        <tr key={index}>
                          <td>{item.productId?.title || 'Product Name Unavailable'}</td>
                          <td>{item.quantity || 0}</td>
                          <td>₹{item.price?.toFixed(2) || '0.00'}</td>
                          <td>₹{((item.price || 0) * (item.quantity || 0)).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="row mt-3">
                  <div className="col-md-6">
                    <h6>Update Order Status</h6>
                    <div className="mb-2">
                      <label className="form-label">Order Status</label>
                      <select
                        className="form-select"
                        value={selectedOrder.orderStatus || 'Processing'}
                        onChange={(e) => setSelectedOrder(prev => ({ ...prev, orderStatus: e.target.value }))}
                      >
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div className="mb-2">
                      <label className="form-label">Payment Status</label>
                      <select
                        className="form-select"
                        value={selectedOrder.paymentStatus || 'Pending'}
                        onChange={(e) => setSelectedOrder(prev => ({ ...prev, paymentStatus: e.target.value }))}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => updateOrderStatus(
                    selectedOrder._id,
                    selectedOrder.orderStatus,
                    selectedOrder.paymentStatus
                  )}
                  disabled={updating}
                >
                  {updating ? 'Updating...' : 'Update Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Backdrop */}
      {showModal && (
        <div className="modal-backdrop fade show"></div>
      )}
    </div>
  );
};

export default AdminOrders;