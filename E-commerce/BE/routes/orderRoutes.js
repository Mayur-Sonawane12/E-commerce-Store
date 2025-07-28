import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Place order
router.post('/placeorder', auth, async (req, res) => {
  try {
    const { 
      products, 
      totalAmount, 
      subtotal,
      shippingCost,
      tax,
      shippingAddress, 
      billingAddress,
      paymentMethod,
      paymentStatus 
    } = req.body;

    // Validate required fields
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'Products are required' });
    }

    if (!shippingAddress || !billingAddress) {
      return res.status(400).json({ message: 'Shipping and billing addresses are required' });
    }

    // Create order with enhanced data
    const order = new Order({
      userId: req.user.id,
      products,
      totalAmount,
      subtotal,
      shippingCost: shippingCost || 0,
      tax: tax || 0,
      shippingAddress,
      billingAddress,
      paymentMethod: paymentMethod || 'card',
      paymentStatus: paymentStatus || 'Pending',
      orderStatus: 'Processing',
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    });

    await order.save();
    
    // Populate product details for response
    await order.populate('products.productId');
    
    res.status(201).json(order);
  } catch (err) {
    console.error('Error placing order:', err);
    res.status(500).json({ message: err.message });
  }
});

// Update order status (admin only)
router.put('/updateorder/:id/status', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { orderStatus, paymentStatus, trackingNumber, notes } = req.body;
    
    const updateData = {};
    if (orderStatus) updateData.orderStatus = orderStatus;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (notes) updateData.notes = notes;

    // Update estimated delivery if order is shipped
    if (orderStatus === 'Shipped') {
      updateData.estimatedDelivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days from now
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('products.productId');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get user's orders
router.get('/myorder', auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .populate('products.productId')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (err) {
    console.error('Error fetching user orders:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get specific order by ID (for order details)
router.get('/order/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('products.productId');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns this order or is admin
    if (order.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(order);
  } catch (err) {
    console.error('Error fetching order:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get all orders (admin only)
router.get('/getallorders', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { 
      status, 
      paymentStatus, 
      search, 
      page = 1, 
      limit = 20,
      dateFrom,
      dateTo 
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (status && status !== 'all') {
      filter.orderStatus = status;
    }
    
    if (paymentStatus && paymentStatus !== 'all') {
      filter.paymentStatus = paymentStatus;
    }

    if (search) {
      filter.$or = [
        { _id: { $regex: search, $options: 'i' } },
        { 'shippingAddress.fullName': { $regex: search, $options: 'i' } },
        { 'shippingAddress.email': { $regex: search, $options: 'i' } }
      ];
    }

    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    const orders = await Order.find(filter)
      .populate('products.productId')
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (err) {
    console.error('Error fetching all orders:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get order statistics (admin only)
router.get('/stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { period = '30' } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    const stats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: daysAgo }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          avgOrderValue: { $avg: '$totalAmount' },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ['$orderStatus', 'Processing'] }, 1, 0] }
          },
          shippedOrders: {
            $sum: { $cond: [{ $eq: ['$orderStatus', 'Shipped'] }, 1, 0] }
          },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ['$orderStatus', 'Delivered'] }, 1, 0] }
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ['$orderStatus', 'Cancelled'] }, 1, 0] }
          }
        }
      }
    ]);

    res.json(stats[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      avgOrderValue: 0,
      pendingOrders: 0,
      shippedOrders: 0,
      deliveredOrders: 0,
      cancelledOrders: 0
    });
  } catch (err) {
    console.error('Error fetching order stats:', err);
    res.status(500).json({ message: err.message });
  }
});

// Cancel order (user can cancel their own order if it's still processing)
router.put('/cancel/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns this order
    if (order.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Only allow cancellation if order is still processing
    if (order.orderStatus !== 'Processing') {
      return res.status(400).json({ 
        message: 'Order cannot be cancelled. It has already been processed.' 
      });
    }

    order.orderStatus = 'Cancelled';
    await order.save();

    res.json(order);
  } catch (err) {
    console.error('Error cancelling order:', err);
    res.status(500).json({ message: err.message });
  }
});

export default router;