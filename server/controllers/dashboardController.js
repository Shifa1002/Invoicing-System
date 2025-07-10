import Invoice from '../models/Invoice.js';
import Contract from '../models/Contract.js';
import Client from '../models/Client.js';
import Product from '../models/Product.js';

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    const totalClients = await Client.countDocuments();
    const totalInvoices = await Invoice.countDocuments();
    const unpaidInvoices = await Invoice.countDocuments({ status: { $ne: 'Paid' } });
    const revenueAgg = await Invoice.aggregate([
      { $match: { status: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;
    res.json({ totalClients, totalInvoices, unpaidInvoices, totalRevenue });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch dashboard stats', error: error.message });
  }
};

// Get revenue analytics
export const getRevenueAnalytics = async (req, res) => {
  try {
    const { period = 'monthly', year = new Date().getFullYear() } = req.query;

    let groupBy = {};
    let matchDate = {};

    if (period === 'monthly') {
      groupBy = {
        year: { $year: '$paymentDate' },
        month: { $month: '$paymentDate' }
      };
      matchDate = {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1)
      };
    } else if (period === 'quarterly') {
      groupBy = {
        year: { $year: '$paymentDate' },
        quarter: { $ceil: { $divide: [{ $month: '$paymentDate' }, 3] } }
      };
      matchDate = {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1)
      };
    } else if (period === 'yearly') {
      groupBy = {
        year: { $year: '$paymentDate' }
      };
    }

    const revenueData = await Invoice.aggregate([
      { $match: { 
        isActive: true, 
        isPaid: true,
        paymentDate: matchDate
      }},
      { $group: {
        _id: groupBy,
        revenue: { $sum: '$totalAmount' },
        invoiceCount: { $sum: 1 }
      }},
      { $sort: { '_id.year': -1, '_id.month': -1, '_id.quarter': -1 } }
    ]);

    res.status(200).json({ revenueData, period, year });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get client analytics
export const getClientAnalytics = async (req, res) => {
  try {
    const clientStats = await Invoice.aggregate([
      { $match: { isActive: true } },
      { $group: {
        _id: '$client',
        totalRevenue: { $sum: '$totalAmount' },
        paidRevenue: { $sum: { $cond: ['$isPaid', '$totalAmount', 0] } },
        invoiceCount: { $sum: 1 },
        paidInvoiceCount: { $sum: { $cond: ['$isPaid', 1, 0] } }
      }},
      { $lookup: {
        from: 'clients',
        localField: '_id',
        foreignField: '_id',
        as: 'client'
      }},
      { $unwind: '$client' },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 }
    ]);

    const clientData = clientStats.map(client => ({
      name: client.client.name,
      email: client.client.email,
      totalRevenue: client.totalRevenue,
      paidRevenue: client.paidRevenue,
      invoiceCount: client.invoiceCount,
      paidInvoiceCount: client.paidInvoiceCount,
      paymentRate: client.invoiceCount > 0 ? (client.paidInvoiceCount / client.invoiceCount) * 100 : 0
    }));

    res.status(200).json({ clientData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 