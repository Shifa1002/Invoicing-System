import express from 'express';
import { auth } from '../middleware/auth.js';
import Invoice from '../models/Invoice.js';
import Client from '../models/Client.js';
import Contract from '../models/Contract.js';
import Product from '../models/Product.js';

const router = express.Router();

// Get dashboard statistics (root route)
router.get('/', auth, async (req, res) => {
  try {
    // Get total revenue from paid invoices
    const totalRevenue = await Invoice.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    // Get counts
    const [totalClients, totalProducts, totalContracts, totalInvoices] = await Promise.all([
      Client.countDocuments({ isActive: true }),
      Product.countDocuments({ isActive: true }),
      Contract.countDocuments({ status: 'active' }),
      Invoice.countDocuments({ isActive: true })
    ]);

    // Get recent activities
    const [recentInvoices, recentContracts] = await Promise.all([
      Invoice.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('client', 'name')
        .select('invoiceNumber total status createdAt client'),
      Contract.find({ status: 'active' })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('client', 'name')
        .select('title totalAmount status createdAt client')
    ]);

    res.json({
      totalRevenue: totalRevenue[0]?.total || 0,
      totalClients,
      totalProducts,
      totalContracts,
      totalInvoices,
      recentInvoices,
      recentContracts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get dashboard statistics
router.get('/stats', auth, async (req, res) => {
  try {
    // Get total revenue from paid invoices
    const totalRevenue = await Invoice.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    // Get counts
    const [totalClients, totalProducts, totalContracts, totalInvoices] = await Promise.all([
      Client.countDocuments({ isActive: true }),
      Product.countDocuments({ isActive: true }),
      Contract.countDocuments({ status: 'active' }),
      Invoice.countDocuments({ isActive: true })
    ]);

    // Get recent activities
    const [recentInvoices, recentContracts] = await Promise.all([
      Invoice.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('client', 'name')
        .select('invoiceNumber total status createdAt client'),
      Contract.find({ status: 'active' })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('client', 'name')
        .select('title totalAmount status createdAt client')
    ]);

    res.json({
      totalRevenue: totalRevenue[0]?.total || 0,
      totalClients,
      totalProducts,
      totalContracts,
      totalInvoices,
      recentInvoices,
      recentContracts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get revenue data for the last 6 months
router.get('/revenue', auth, async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const revenueData = await Invoice.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          status: { $in: ['paid', 'sent'] },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$total' },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    // Format the data for the frontend
    const formattedData = revenueData.map(item => ({
      month: new Date(item._id.year, item._id.month - 1).toLocaleString('default', { month: 'short' }),
      revenue: item.revenue,
    }));

    res.json(formattedData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get recent invoices
router.get('/recent-invoices', auth, async (req, res) => {
  try {
    const recentInvoices = await Invoice.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('client', 'name')
      .populate('contract', 'title')
      .select('invoiceNumber total status createdAt client contract');

    res.json(recentInvoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router; 