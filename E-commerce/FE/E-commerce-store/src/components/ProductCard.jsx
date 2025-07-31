import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { FaHeart, FaShoppingCart, FaStar } from 'react-icons/fa';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product, 1);
    alert("Product Added to Cart");
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

  return (
    <div className="card h-100 shadow-sm border-0">
      <div className="position-relative">
        <img
          src={product.image}
          className="card-img-top"
          alt={product.name}
          style={{ height: '200px', objectFit: 'fill' }}
        />
      </div>

      <div className="card-body d-flex flex-column">
        <h6 className="card-title mb-2">{product.title}</h6>
        
        <div className="mb-2">
          <div className="d-flex align-items-center mb-1">
            {renderStars(product.rating || 0)}
            <small className="text-muted ms-1">
              ({product.reviewCount || 0} reviews)
            </small>
          </div>
        </div>

        <p className="card-text text-muted small mb-3 flex-grow-1">
          {product.description?.length > 100
            ? `${product.description.substring(0, 100)}...`
            : product.description}
        </p>

        <div className="mt-auto">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="h5 text-primary mb-0">
              ₹{product.price?.toFixed(2)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-muted text-decoration-line-through">
                ₹{product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          <div className="d-flex gap-2">
            <Link
              to={`/product/${product._id}`}
              className="btn btn-outline-primary flex-fill"
            >
              View Details
            </Link>
            <button
              className="btn btn-primary"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <FaShoppingCart />
            </button>
          </div>

          {product.stock === 0 && (
            <div className="text-center mt-2">
              <span className="badge bg-danger">Out of Stock</span>
            </div>
          )}

          {product.stock > 0 && product.stock <= 5 && (
            <div className="text-center mt-2">
              <span className="badge bg-warning text-dark">
                Only {product.stock} left!
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;