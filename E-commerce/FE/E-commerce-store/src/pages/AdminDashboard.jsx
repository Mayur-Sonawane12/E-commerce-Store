import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaUsers, FaBox, FaShoppingCart, FaChartLine, FaExclamationTriangle, FaEye, FaRupeeSign } from 'react-icons/fa';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
    lowStockProducts: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('http://localhost:5000/api/users/admin/dashboard', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusClass = {
      'Processing': 'bg-info',
      'Shipped': 'bg-primary',
      'Delivered': 'bg-success',
      'Cancelled': 'bg-danger'
    };
    
    return `badge ${statusClass[status] || 'bg-secondary'}`;
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

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error!</h4>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchDashboardStats}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Admin Dashboard</h2>
        <button className="btn btn-outline-primary" onClick={fetchDashboardStats}>
          <FaChartLine className="me-1" />
          Refresh
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-primary shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    Total Users
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {stats.totalUsers}
                  </div>
                </div>
                <div className="col-auto">
                  <FaUsers className="fa-2x text-gray-300" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-success shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                    Total Products
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {stats.totalProducts}
                  </div>
                </div>
                <div className="col-auto">
                  <FaBox className="fa-2x text-gray-300" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-info shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                    Total Orders
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {stats.totalOrders}
                  </div>
                </div>
                <div className="col-auto">
                  <FaShoppingCart className="fa-2x text-gray-300" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-warning shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                    Total Revenue
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {formatCurrency(stats.totalRevenue)}
                  </div>
                </div>
                <div className="col-auto">
                  <FaRupeeSign className="fa-2x text-gray-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow">
            <div className="card-header">
              <h5 className="mb-0">Quick Actions</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-3 mb-3">
                  <Link to="/admin/products" className="btn btn-primary w-100">
                    <FaBox className="me-2" />
                    Manage Products
                  </Link>
                </div>
                <div className="col-md-3 mb-3">
                  <Link to="/admin/orders" className="btn btn-success w-100">
                    <FaShoppingCart className="me-2" />
                    Manage Orders
                  </Link>
                </div>
                <div className="col-md-3 mb-3">
                  <Link to="/admin/users" className="btn btn-info w-100">
                    <FaUsers className="me-2" />
                    Manage Users
                  </Link>
                </div>
                <div className="col-md-3 mb-3">
                  <Link to="/admin/analytics" className="btn btn-warning w-100">
                    <FaChartLine className="me-2" />
                    View Analytics
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Recent Orders */}
        <div className="col-lg-8 mb-4">
          <div className="card shadow">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Orders</h5>
              <Link to="/admin/orders" className="btn btn-sm btn-outline-primary">
                <FaEye className="me-1" />
                View All
              </Link>
            </div>
            <div className="card-body">
              {stats.recentOrders?.length === 0 ? (
                <p className="text-muted">No recent orders</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentOrders?.map((order) => (
                        <tr key={order._id}>
                          <td>#{order._id.slice(-8)}</td>
                          <td>
                            {order.userId?.name || order.shippingAddress?.fullName || 'N/A'}
                            <br />
                            <small className="text-muted">
                              {order.userId?.email || order.shippingAddress?.email || 'N/A'}
                            </small>
                          </td>
                          <td>{formatCurrency(order.totalAmount)}</td>
                          <td>
                            <span className={getStatusBadge(order.orderStatus)}>
                              {order.orderStatus}
                            </span>
                          </td>
                          <td>{formatDate(order.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Low Stock Alerts
        <div className="col-lg-4 mb-4">
          <div className="card shadow">
            <div className="card-header">
              <h5 className="mb-0">
                <FaExclamationTriangle className="me-2 text-warning" />
                Low Stock Alerts
              </h5>
            </div>
            <div className="card-body">
              {stats.lowStockProducts?.length === 0 ? (
                <p className="text-muted">No low stock products</p>
              ) : (
                <div className="list-group list-group-flush">
                  {stats.lowStockProducts?.map((product) => (
                    <div key={product._id} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-1">{product.title}</h6>
                        <small className="text-muted">Stock: {product.stock}</small>
                      </div>
                      <span className="badge bg-warning text-dark">
                        Low Stock
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default AdminDashboard; 