import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import {auth} from '../middleware/auth.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, phone, address });
    await user.save();
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '10d' });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, address: user.address } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const updates = {};
    const allowedFields = ['name', 'email', 'phone', 'address'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Middleware to check if user is admin
const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {});
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Get all users (admin only)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user role (admin only)
router.put('/users/:userId/role', adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // Validate role
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be "user" or "admin"' });
    }

    // Prevent admin from removing their own admin role
    if (userId === req.user.id && role === 'user') {
      return res.status(400).json({ message: 'Cannot remove your own admin role' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error('Error updating user role:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user (admin only)
router.delete('/users/:userId', adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent admin from deleting themselves
    if (userId === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const user = await User.findByIdAndDelete(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user statistics (admin only)
router.get('/users/:userId/stats', adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Here you would typically aggregate data from orders, wishlist, etc.
    // For now, returning placeholder data
    const stats = {
      totalOrders: 0,
      totalSpent: 0,
      wishlistItems: 0,
      lastOrderDate: null
    };

    res.json(stats);
  } catch (err) {
    console.error('Error fetching user stats:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get dashboard statistics (admin only)
router.get('/admin/dashboard', adminAuth, async (req, res) => {
  try {
    // Get total counts
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    
    // Calculate total revenue from paid orders
    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;
    
    // Get recent orders (last 10)
    const recentOrders = await Order.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('_id totalAmount orderStatus createdAt userId shippingAddress');
    
    // Get low stock products (stock < 10)
    const lowStockProducts = await Product.find({ stock: { $lt: 10 } })
      .select('title stock')
      .limit(10);
    
    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      recentOrders,
      lowStockProducts
    });
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get analytics data (admin only)
router.get('/admin/analytics', adminAuth, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));
    
    const previousDaysAgo = new Date();
    previousDaysAgo.setDate(previousDaysAgo.getDate() - (parseInt(days) * 2));
    
    // Current period data
    const currentOrders = await Order.find({
      createdAt: { $gte: daysAgo }
    });
    
    const previousOrders = await Order.find({
      createdAt: { $gte: previousDaysAgo, $lt: daysAgo }
    });
    
    // Calculate metrics
    const totalRevenue = currentOrders
      .filter(order => order.paymentStatus === 'Paid')
      .reduce((sum, order) => sum + order.totalAmount, 0);
    
    const previousRevenue = previousOrders
      .filter(order => order.paymentStatus === 'Paid')
      .reduce((sum, order) => sum + order.totalAmount, 0);
    
    const revenueGrowth = previousRevenue > 0 
      ? ((totalRevenue - previousRevenue) / previousRevenue * 100).toFixed(1)
      : totalRevenue > 0 ? 100 : 0;
    
    const totalOrders = currentOrders.length;
    const previousOrdersCount = previousOrders.length;
    const orderGrowth = previousOrdersCount > 0 
      ? ((totalOrders - previousOrdersCount) / previousOrdersCount * 100).toFixed(1)
      : totalOrders > 0 ? 100 : 0;
    
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const previousAOV = previousOrdersCount > 0 
      ? previousOrders.filter(order => order.paymentStatus === 'Paid')
          .reduce((sum, order) => sum + order.totalAmount, 0) / previousOrdersCount
      : 0;
    const aovGrowth = previousAOV > 0 
      ? ((averageOrderValue - previousAOV) / previousAOV * 100).toFixed(1)
      : averageOrderValue > 0 ? 100 : 0;
    
    // New users
    const newUsers = await User.countDocuments({
      createdAt: { $gte: daysAgo }
    });
    
    const previousUsers = await User.countDocuments({
      createdAt: { $gte: previousDaysAgo, $lt: daysAgo }
    });
    
    const userGrowth = previousUsers > 0 
      ? ((newUsers - previousUsers) / previousUsers * 100).toFixed(1)
      : newUsers > 0 ? 100 : 0;
    
    // Sales data by date
    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: daysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          orders: { $sum: 1 },
          revenue: { $sum: "$totalAmount" }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Order status distribution
    const orderStatusDistribution = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: daysAgo }
        }
      },
      {
        $group: {
          _id: "$orderStatus",
          count: { $sum: 1 }
        }
      }
    ]);
    
    const statusDistribution = {};
    orderStatusDistribution.forEach(item => {
      statusDistribution[item._id] = item.count;
    });
    
    // Payment method distribution
    const paymentMethodDistribution = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: daysAgo }
        }
      },
      {
        $group: {
          _id: "$paymentMethod",
          count: { $sum: 1 },
          total: { $sum: "$totalAmount" }
        }
      }
    ]);
    
    const paymentDistribution = {};
    paymentMethodDistribution.forEach(item => {
      paymentDistribution[item._id] = {
        count: item.count,
        total: item.total
      };
    });
    
    // Top performing products
    const topProducts = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: daysAgo }
        }
      },
      {
        $unwind: "$products"
      },
      {
        $lookup: {
          from: "products",
          localField: "products.productId",
          foreignField: "_id",
          as: "product"
        }
      },
      {
        $unwind: "$product"
      },
      {
        $group: {
          _id: "$product._id",
          title: { $first: "$product.title" },
          category: { $first: "$product.category" },
          salesCount: { $sum: "$products.quantity" },
          totalRevenue: { $sum: { $multiply: ["$products.price", "$products.quantity"] } }
        }
      },
      {
        $sort: { totalRevenue: -1 }
      },
      {
        $limit: 10
      }
    ]);
    
    // Category performance
    const categoryPerformance = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: daysAgo }
        }
      },
      {
        $unwind: "$products"
      },
      {
        $lookup: {
          from: "products",
          localField: "products.productId",
          foreignField: "_id",
          as: "product"
        }
      },
      {
        $unwind: "$product"
      },
      {
        $group: {
          _id: "$product.category",
          name: { $first: "$product.category" },
          productCount: { $addToSet: "$product._id" },
          salesCount: { $sum: "$products.quantity" },
          totalRevenue: { $sum: { $multiply: ["$products.price", "$products.quantity"] } }
        }
      },
      {
        $project: {
          name: 1,
          productCount: { $size: "$productCount" },
          salesCount: 1,
          totalRevenue: 1
        }
      },
      {
        $sort: { totalRevenue: -1 }
      }
    ]);
    
    // User growth data
    const userGrowthData = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: daysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          newUsers: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $limit: 7
      }
    ]);
    
    res.json({
      totalRevenue,
      revenueGrowth,
      totalOrders,
      orderGrowth,
      newUsers,
      userGrowth,
      averageOrderValue,
      aovGrowth,
      salesData,
      orderStatusDistribution: statusDistribution,
      paymentMethodDistribution: paymentDistribution,
      topProducts,
      categoryPerformance,
      userGrowth: userGrowthData
    });
  } catch (err) {
    console.error('Error fetching analytics:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


export default router; 