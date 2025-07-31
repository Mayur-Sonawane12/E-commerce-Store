import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { FaArrowRight, FaStar, FaTruck, FaShieldAlt, FaHeadset } from 'react-icons/fa';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    fetchFeaturedProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products/getall?featured=true&limit=16');
      setFeaturedProducts(Array.isArray(response.data.products) ? response.data.products : []);
    } catch (error) {
      console.error('Error fetching featured products:', error);
      setFeaturedProducts([]); // fallback to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products/getproducts/categories');
      setCategories(response.data.slice(0, 6)); // Show only first 6 categories
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const features = [
    {
      icon: <FaTruck className="text-primary" />,
      title: 'Free Shipping',
      description: 'Free shipping on orders over ₹999'
    },
    {
      icon: <FaShieldAlt className="text-primary" />,
      title: 'Secure Payment',
      description: '100% secure payment processing'
    },
    {
      icon: <FaHeadset className="text-primary" />,
      title: '24/7 Support',
      description: 'Round the clock customer support'
    }
  ];

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-primary text-white py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold mb-4">
                Welcome to Our E-Commerce Store
              </h1>
              <p className="lead mb-4">
                Discover amazing products at great prices. Shop with confidence and enjoy
                a seamless shopping experience.
              </p>
              <div className="d-flex gap-3">
                <Link to="/products" className="btn btn-light btn-lg">
                  Shop Now
                </Link>
                {!isLoggedIn && (
                  <Link to="/register" className="btn btn-outline-light btn-lg">
                    Sign Up
                  </Link>
                )}
              </div>
            </div>
            {/* <div className="col-lg-6">
              <img
                src="https://via.placeholder.com/600x400?text=Hero+Image"
                alt="Hero"
                className="img-fluid rounded"
              />
            </div> */}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row">
            {features.map((feature, index) => (
              <div key={index} className="col-md-4 text-center mb-4">
                <div className="mb-3">
                  <div style={{ fontSize: '2.5rem' }}>
                    {feature.icon}
                  </div>
                </div>
                <h5>{feature.title}</h5>
                <p className="text-muted">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-5">
        <div className="container">
          <div className="row mb-4">
            <div className="col-12 text-center">
              <h2 className="mb-3">Shop by Category</h2>
              <p className="text-muted">Explore our wide range of product categories</p>
            </div>
          </div>
          
          <div className="row row-cols-2 row-cols-md-3 row-cols-lg-6 g-4">
            {(Array.isArray(categories) ? categories : []).map((category, index) => (
              <div key={index} className="col">
                <Link
                  to={`/products?category=${encodeURIComponent(category)}`}
                  className="text-decoration-none"
                >
                  <div className="card h-100 text-center border-0 shadow-sm">
                    <div className="card-body">
                      <div className="mb-3">
                        <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center"
                             style={{ width: '60px', height: '60px' }}>
                          <span className="text-primary fw-bold">
                            {category.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <h6 className="card-title text-dark">{category}</h6>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section> 

      {/* Featured Products Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row mb-4">
            <div className="col-12 d-flex justify-content-between align-items-center">
              <div>
                <h2 className="mb-2">Featured Products</h2>
                <p className="text-muted mb-0">Handpicked products for you</p>
              </div>
              <Link to="/products" className="btn btn-outline-primary">
                View All <FaArrowRight className="ms-1" />
              </Link>
            </div>
          </div>
          
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
            {featuredProducts.map((product) => (
              <div key={product._id} className="col">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-5">
        <div className="container">
          <div className="row mb-4">
            <div className="col-12 text-center">
              <h2 className="mb-3">What Our Customers Say</h2>
              <p className="text-muted">Read reviews from our satisfied customers</p>
            </div>
          </div>
          
          <div className="row">
            <div className="col-md-4 mb-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <div className="mb-3">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className="text-warning" />
                    ))}
                  </div>
                  <p className="card-text">
                    "Amazing products and excellent customer service. I love shopping here!"
                  </p>
                  <h6 className="card-title">Sarah Johnson</h6>
                  <small className="text-muted">Verified Customer</small>
                </div>
              </div>
            </div>
            
            <div className="col-md-4 mb-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <div className="mb-3">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className="text-warning" />
                    ))}
                  </div>
                  <p className="card-text">
                    "Fast delivery and quality products. Highly recommended!"
                  </p>
                  <h6 className="card-title">Mike Davis</h6>
                  <small className="text-muted">Verified Customer</small>
                </div>
              </div>
            </div>
            
            <div className="col-md-4 mb-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <div className="mb-3">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className="text-warning" />
                    ))}
                  </div>
                  <p className="card-text">
                    "Great prices and wide selection. My go-to online store!"
                  </p>
                  <h6 className="card-title">Emily Wilson</h6>
                  <small className="text-muted">Verified Customer</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 