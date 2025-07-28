import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-5 mt-5">
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-4">
            <h5 className="mb-3">E-Commerce Store</h5>
            <p className="text-white">
              Your one-stop destination for quality products. We provide the best shopping experience
              with secure payments and fast delivery.
            </p>
            <div className="d-flex gap-3">
              <a href="#" className="text-light fs-5">
                <FaFacebook />
              </a>
              <a href="#" className="text-light fs-5">
                <FaTwitter />
              </a>
              <a href="#" className="text-light fs-5">
                <FaInstagram />
              </a>
              <a href="#" className="text-light fs-5">
                <FaLinkedin />
              </a>
            </div>
          </div>

          <div className="col-md-2 mb-4">
            <h6 className="mb-3">Quick Links</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="text-white text-decoration-none">
                  Home
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/products" className="text-white text-decoration-none">
                  Products
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/cart" className="text-white text-decoration-none">
                  Cart
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/wishlist" className="text-white text-decoration-none">
                  Wishlist
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-md-2 mb-4">
            <h6 className="mb-3">Account</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/login" className="text-white text-decoration-none">
                  Login
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/register" className="text-white text-decoration-none">
                  Register
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/profile" className="text-white text-decoration-none">
                  Profile
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/orders" className="text-white text-decoration-none">
                  Orders
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-md-4 mb-4">
            <h6 className="mb-3">Contact Info</h6>
            <div className="text-white">
              <p className="mb-2">
                <strong>Address:</strong> 123 Commerce St, Business City, BC 12345
              </p>
              <p className="mb-2">
                <strong>Phone:</strong> +1 (555) 123-4567
              </p>
              <p className="mb-2">
                <strong>Email:</strong> info@ecommerce.com
              </p>
              <p className="mb-2">
                <strong>Hours:</strong> Mon-Fri: 9AM-6PM, Sat: 10AM-4PM
              </p>
            </div>
          </div>
        </div>

        <hr className="my-4" />

        <div className="row align-items-center">
          <div className="col-md-6">
            <p className="text-white mb-0">
              &copy; 2024 E-Commerce Store. All rights reserved.
            </p>
          </div>
          <div className="col-md-6 text-md-end">
            <div className="d-flex gap-3 justify-content-md-end">
              <a href="#" className="text-white text-decoration-none">
                Privacy Policy
              </a>
              <a href="#" className="text-white text-decoration-none">
                Terms of Service
              </a>
              <a href="#" className="text-white text-decoration-none">
                Shipping Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 