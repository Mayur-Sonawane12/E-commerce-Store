import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import CartPage from './pages/CartPage';
import Profile from './pages/Profile';
import OrderDetails from './pages/OrdersDetails';
import Checkout from './pages/Checkout';

// Admin Pages
import AdminPage from './pages/AdminPage';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';
import AdminUsers from './pages/AdminUsers';


function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
            <div className="d-flex flex-column min-vh-100">
              <Navbar />
              <main className="flex-grow-1">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  
                  {/* Protected Routes */}
                  <Route path="/cart" element={
                    <ProtectedRoute>
                      <CartPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                  <Route path="/orders" element={
                    <ProtectedRoute>
                      <OrderDetails/>
                    </ProtectedRoute>
                  } />
                  <Route path="/checkout" element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  } />
                  
                  {/* Admin Routes */}
                  <Route path="/admin/dashboard" element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/products" element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminProducts />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/orders" element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminOrders />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/users" element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminUsers />
                    </ProtectedRoute>
                  } />
                  
                  {/* Catch-all route for malformed URLs */}
                  <Route path="*" element={
                    <div className="container mt-5 text-center">
                      <h3>Page Not Found</h3>
                      <p>The page you are looking for does not exist.</p>
                      <button className="btn btn-primary" onClick={() => window.location.href = '/'}>
                        Go to Home
                      </button>
                    </div>
                  } />
                </Routes>
              </main>
              <Footer />
            </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App; 