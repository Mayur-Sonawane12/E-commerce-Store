import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaUser, FaUserShield, FaEnvelope, FaPhone } from 'react-icons/fa';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:5000/api/users/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Ensure response.data is an array
      if (Array.isArray(response.data)) {
        setUsers(response.data);
      } else if (response.data && Array.isArray(response.data.users)) {
        setUsers(response.data.users);
      } else {
        console.warn('Unexpected API response format:', response.data);
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users. Please try again.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (userId, newRole) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/users/users/${userId}/role`, 
        { role: newRole },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      console.log('Role updated successfully:', response.data);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      alert(error.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        const response = await axios.delete(`http://localhost:5000/api/users/users/${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        console.log('User deleted successfully:', response.data);
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert(error.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleBadge = (role) => {
    return role === 'admin' ? 'bg-danger' : 'bg-primary';
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
        <div className="row justify-content-center">
          <div className="col-12 text-center">
            <div className="alert alert-danger" role="alert">
              <h4 className="alert-heading">Error!</h4>
              <p>{error}</p>
              <button className="btn btn-primary" onClick={fetchUsers}>
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Manage Users</h2>

      {users.length === 0 ? (
        <div className="card">
          <div className="card-body text-center">
            <h5 className="text-muted">No users found</h5>
            <p className="text-muted">There are no users to display at the moment.</p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="avatar me-3">
                            <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center"
                                 style={{ width: '40px', height: '40px' }}>
                              <FaUser className="text-white" />
                            </div>
                          </div>
                          <div>
                            <strong>{user.name}</strong>
                            <br />
                            <small className="text-muted">ID: {user._id.slice(-8)}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FaEnvelope className="text-muted me-2" />
                          {user.email}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FaPhone className="text-muted me-2" />
                          {user.phone || 'N/A'}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${getRoleBadge(user.role)}`}>
                          {user.role === 'admin' ? <FaUserShield className="me-1" /> : <FaUser className="me-1" />}
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <small>{formatDate(user.createdAt)}</small>
                      </td>
                      <td>
                        <span className="badge bg-success">Active</span>
                      </td>
                      <td>
                        <div className="btn-group" role="group">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => viewUserDetails(user)}
                          >
                            <FaEdit />
                          </button>
                          <div className="btn-group" role="group">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary dropdown-toggle"
                              data-bs-toggle="dropdown"
                            >
                              Role
                            </button>
                            <ul className="dropdown-menu">
                              <li>
                                <button
                                  className="dropdown-item"
                                  onClick={() => handleRoleUpdate(user._id, 'user')}
                                >
                                  <FaUser className="me-2" />
                                  Make User
                                </button>
                              </li>
                              <li>
                                <button
                                  className="dropdown-item"
                                  onClick={() => handleRoleUpdate(user._id, 'admin')}
                                >
                                  <FaUserShield className="me-2" />
                                  Make Admin
                                </button>
                              </li>
                            </ul>
                          </div>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteUser(user._id)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  User Details - {selectedUser.name}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6>Personal Information</h6>
                    <p><strong>Name:</strong> {selectedUser.name}</p>
                    <p><strong>Email:</strong> {selectedUser.email}</p>
                    <p><strong>Phone:</strong> {selectedUser.phone || 'N/A'}</p>
                    <p><strong>Address:</strong> {selectedUser.address || 'N/A'}</p>
                  </div>
                  <div className="col-md-6">
                    <h6>Account Information</h6>
                    <p><strong>User ID:</strong> {selectedUser._id}</p>
                    <p><strong>Role:</strong> 
                      <span className={`badge ms-2 ${getRoleBadge(selectedUser.role)}`}>
                        {selectedUser.role === 'admin' ? <FaUserShield className="me-1" /> : <FaUser className="me-1" />}
                        {selectedUser.role}
                      </span>
                    </p>
                    <p><strong>Joined:</strong> {formatDate(selectedUser.createdAt)}</p>
                    <p><strong>Last Updated:</strong> {formatDate(selectedUser.updatedAt)}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <h6>Account Statistics</h6>
                  <div className="row">
                    <div className="col-md-4">
                      <div className="card bg-light">
                        <div className="card-body text-center">
                          <h4 className="text-primary">0</h4>
                          <small>Total Orders</small>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card bg-light">
                        <div className="card-body text-center">
                          <h4 className="text-success">$0.00</h4>
                          <small>Total Spent</small>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card bg-light">
                        <div className="card-body text-center">
                          <h4 className="text-info">0</h4>
                          <small>Wishlist Items</small>
                        </div>
                      </div>
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

export default AdminUsers;