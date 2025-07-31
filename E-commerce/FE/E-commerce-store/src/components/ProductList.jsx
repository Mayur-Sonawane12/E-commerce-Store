import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from './ProductCard';
import { FaFilter, FaSort, FaSearch } from 'react-icons/fa';
import Products from '../pages/Products';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Filter states 
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'title');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'asc');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [category, minPrice, maxPrice, sortBy, sortOrder, searchTerm]);

  const fetchCategories = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/products/getproducts/categories');
    setCategories(Array.isArray(response.data) ? response.data : []); // Defensive: ensure array
  } catch (error) {
    console.error('Error fetching categories:', error);
    setCategories([]); // fallback to empty array on error
  }
};

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        category,
        minPrice,
        maxPrice,
        sortBy,
        sortOrder,
        search: searchTerm,
        limit: 0, // Get all products
      });

      const response = await axios.get(`http://localhost:5000/api/products/getall?${params}`);
      setProducts(response.data.products || response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setSearchParams(newFilters);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const newFilters = {
      search: searchTerm,
      category,
      minPrice,
      maxPrice,
      sortBy,
      sortOrder,
    };
    handleFilterChange(newFilters);
  };

  const handleSortChange = (newSortBy) => {
    const newSortOrder = sortBy === newSortBy && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    
    const newFilters = {
      search: searchTerm,
      category,
      minPrice,
      maxPrice,
      sortBy: newSortBy,
      sortOrder: newSortOrder,
    };
    handleFilterChange(newFilters);
  };

  const clearFilters = () => {
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSearchTerm('');
    setSortBy('title');
    setSortOrder('asc');
    setSearchParams({});
  };

  return (
    <div className="container mt-4">
      {/* Filters and Search */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <form onSubmit={handleSearch}>
                <div className="row g-3">
                  <div className="col-md-3">
                    <label className="form-label">
                      <FaSearch className="me-1" />
                      Search
                    </label>
                    <input     
                      type="text"
                      className="form-control"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <div className="col-md-2">
                    <label className="form-label">
                      <FaFilter className="me-1" />
                      Category
                    </label>
                    <select
                      className="form-select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="">All Categories</option>
                      {(Array.isArray(categories) ? categories : []).map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="row mb-3">
        <div className="col-12">
          <p className="text-muted">
            Showing {products.length} products
          </p>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="row">
          <div className="col-12 text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="row">
          <div className="col-12 text-center">
            <div className="alert alert-info">
              <h5>No products found</h5>
              <p>Try adjusting your search criteria or filters.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
          {products.map((product) => (
            <div key={product._id} className="col">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;