import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { FaShoppingCart, FaHeart, FaUser, FaSignOutAlt, FaSearch } from 'react-icons/fa';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');

  // Sync search term with URL params when on products page
  useEffect(() => {
    if (location.pathname === '/products') {
      const urlParams = new URLSearchParams(location.search);
      const searchParam = urlParams.get('search');
      setSearchTerm(searchParam || '');
    }
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Navigate to products page with search parameter
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    } else if (location.pathname === '/products') {
      // If on products page and search is empty, clear search param
      const urlParams = new URLSearchParams(location.search);
      urlParams.delete('search');
      const newSearch = urlParams.toString();
      navigate(`/products${newSearch ? `?${newSearch}` : ''}`);
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  // Auto-search when user stops typing (debounced)
  useEffect(() => {
    if (location.pathname === '/products' && searchTerm) {
      const timeoutId = setTimeout(() => {
        const urlParams = new URLSearchParams(location.search);
        const currentSearch = urlParams.get('search');
        if (searchTerm !== currentSearch) {
          navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
        }
      }, 800); // 800ms delay for auto-search

      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, location.pathname, navigate]);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          E-Commerce Store
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/products">
                Products
              </Link>
            </li>
            {isAdmin && (
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Admin
                </a>
                <ul className="dropdown-menu">
                  <li>
                    <Link className="dropdown-item" to="/admin/dashboard">
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/admin/products">
                      Manage Products
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/admin/orders">
                      Manage Orders
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/admin/users">
                      Manage Users
                    </Link>
                  </li>
                </ul>
              </li>
            )}
          </ul>

          {/* Search Form */}
          <form className="d-flex me-3" onSubmit={handleSearch}>
            <div className="input-group">
              <input
                className="form-control"
                type="search"
                placeholder="Search products..."
                value={searchTerm}
                onChange={handleSearchInputChange}
                onKeyPress={handleSearchKeyPress}
                aria-label="Search products"
              />
              {/* {searchTerm && (
                <button
                  type="button"
                  className="btn btn-outline-light"
                  onClick={() => {
                    setSearchTerm('');
                    if (location.pathname === '/products') {
                      const urlParams = new URLSearchParams(location.search);
                      urlParams.delete('search');
                      const newSearch = urlParams.toString();
                      navigate(`/products${newSearch ? `?${newSearch}` : ''}`);
                    }
                  }}
                >
                </button>
              )} */}
              <button className="btn btn-outline-light" type="submit" aria-label="Search">
                <FaSearch />
              </button>
            </div>
          </form>

          {/* Cart Icons */}
          <div className="d-flex align-items-center me-3">
            <Link to="/cart" className="btn btn-outline-light position-relative">
              <FaShoppingCart />
              {getCartCount() > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {getCartCount()}
                </span>
              )}
            </Link>
          </div>

          {/* User Menu */}
          <ul className="navbar-nav">
            {isAuthenticated ? (
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle d-flex align-items-center"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <FaUser className="me-1" />
                  {user?.name || 'User'}
                </a>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <Link className="dropdown-item" to="/profile">
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/orders">
                      My Orders
                    </Link>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <button
                      className="dropdown-item d-flex align-items-center"
                      onClick={handleLogout}
                    >
                      <FaSignOutAlt className="me-2" />
                      Logout
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;