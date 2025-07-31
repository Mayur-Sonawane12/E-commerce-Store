import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/orders/myorder', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setOrders(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    setDeletingId(orderId);
    try {
      await axios.delete(`http://localhost:5000/api/orders/order/${orderId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setOrders(orders.filter(order => order._id !== orderId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete order');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5 text-center">
        <h3>Could not load orders</h3>
        <p className="text-muted">{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mt-5 text-center">
        <h3>No Orders Found</h3>
        <p className="text-muted">You have not placed any orders yet.</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2>My Orders</h2>
      <div className="table-responsive">
        <table className="table table-bordered align-middle mt-3">
          <thead className="table-light">
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Status</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Details</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id}>
                <td>#{order._id.slice(-8)}</td>
                <td>{new Date(order.createdAt).toLocaleString()}</td>
                <td>
                  <span className={`badge ${
                    order.orderStatus === 'Delivered' ? 'bg-success' :
                    order.orderStatus === 'Cancelled' ? 'bg-danger' :
                    order.orderStatus === 'Shipped' ? 'bg-primary' :
                    order.orderStatus === 'Processing' ? 'bg-info' : 'bg-secondary'
                  }`}>
                    {order.orderStatus}
                  </span>
                </td>
                <td>₹{order.totalAmount?.toFixed(2)}</td>
                <td>
                  <span className={`badge ${
                    order.paymentStatus === 'Paid' ? 'bg-success' : 'bg-warning'
                  }`}>
                    {order.paymentStatus}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => navigate(`/orders/${order._id}`)}
                  >
                    View
                  </button>
                </td>
                <td>
                  {['Processing', 'Cancelled'].includes(order.orderStatus) && (
                    <button
                      className="btn btn-sm btn-outline-danger"
                      disabled={deletingId === order._id}
                      onClick={() => handleDelete(order._id)}
                    >
                      {deletingId === order._id ? 'Deleting...' : 'Delete'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;