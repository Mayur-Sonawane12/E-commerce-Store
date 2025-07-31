import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import { FaHeart, FaShoppingCart, FaStar, FaArrowLeft } from 'react-icons/fa';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchProduct();      
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    alert("Product Added To Cart");
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          className={i <= rating ? 'text-warning' : 'text-muted'}
        />
      );
    }
    return stars;
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

  if (!product) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          Product not found.
        </div>
      </div>
    );
  }

  const images = product.images || [product.image] ;

  return (
    <div className="container mt-4">
      <button
        className="btn btn-outline-secondary mb-4"
        onClick={() => navigate(-1)}
      >
        <FaArrowLeft className="me-2" />
        Back
      </button>

      <div className="row">
        {/* Product Images */}
        <div className="col-lg-6 mb-4">
          <div className="card border-0">
            <div className="card-body p-0">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="img-fluid rounded "
                style={{ width: '100%', height: '400px', objectFit: 'fill' }}
              />
              
              {images.length > 1 && (
                <div className="row mt-3">
                  {images.map((image, index) => (
                    <div key={index} className="col-3">
                      <img
                        src={image}
                        alt={`${product.title} ${index + 1}`}
                        className={`img-fluid rounded cursor-pointer ${
                          selectedImage === index ? 'border border-primary' : ''
                        }`}
                        style={{ 
                          width: '100%', 
                          height: '80px', 
                          objectFit: 'cover',
                          cursor: 'pointer'
                        }}
                        onClick={() => setSelectedImage(index)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="col-lg-6">
          <div className="card border-0">
            <div className="card-body">
              <h2 className="card-title mb-3">{product.title}</h2>
              
              {/* Rating */}
              <div className="mb-3">
                <div className="d-flex align-items-center mb-2">
                  {renderStars(product.rating || 0)}
                  <span className="text-muted ms-2">
                    ({product.reviewCount || 0} reviews)
                  </span>
                </div>
                <span className="badge bg-primary">{product.category}</span>
              </div>

              {/* Price */}
              <div className="mb-4">
                <h3 className="text-primary mb-2">
                  ₹{product.price?.toFixed(2)}
                </h3>
                {product.originalPrice && product.originalPrice > product.price && (
                  <div>
                    <span className="text-muted text-decoration-line-through me-2">
                      ${product.originalPrice.toFixed(2)}
                    </span>
                    <span className="badge bg-success">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mb-4">
                <h6>Description</h6>
                <p className="text-muted">{product.description}</p>
              </div>

              {/* Stock Status */}
              <div className="mb-4">
                {product.stock === 0 ? (
                  <span className="badge bg-danger">Out of Stock</span>
                ) : product.stock <= 5 ? (
                  <span className="badge bg-warning text-dark">
                    Only {product.stock} left!
                  </span>
                ) : (
                  <span className="badge bg-success">In Stock</span>
                )}
              </div>

              {/* Quantity and Actions */}
              <div className="mb-4">
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label">Quantity</label>
                    <input
                      type="number"
                      className="form-control"
                      value={quantity}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (value > 0 && value <= product.stock) {
                          setQuantity(value);
                        }
                      }}
                      min="1"
                      max={product.stock}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="d-grid gap-2">
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                >
                  <FaShoppingCart className="me-2" />
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 