import express from 'express';
import Product from '../models/Product.js';
import {auth} from '../middleware/auth.js';

const router = express.Router();

// Create product (admin only)
router.post('/addproduct', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

  try {
    if (Array.isArray(req.body)) {
      const products = await Product.insertMany(req.body);
      res.status(201).json(products);
    } else {
      const product = new Product(req.body);
      await product.save();
      res.status(201).json(product);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update product (admin only)
router.put('/updateproduct/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete product (admin only)
router.delete('/deleteproduct/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all products with search, filter, pagination
router.get('/getall', async (req, res) => {
  try {
    const { search, category, page = 1, limit = 10 } = req.query;
    const query = {};
    if (search) query.title = { $regex: search, $options: 'i' };
    if (category) query.category = category;
    
    // If limit is 0, return all products without pagination
    if (limit === '0' || limit === 0) {
      const products = await Product.find(query);
      res.json({ products, total: products.length });
    } else {
      const products = await Product.find(query)
        .skip((page - 1) * limit)
        .limit(Number(limit));
      const count = await Product.countDocuments(query);
      res.json({ products, total: count });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//get products by categories
router.get('/getproducts/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (err) {
      res.status(500).json({ error: 'Server error' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router; 