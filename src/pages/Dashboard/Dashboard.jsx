import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { invoicesApi, clientsApi, productsApi, contractsApi } from '../../services/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalRevenue: 0,
    pendingInvoices: 0,
    totalClients: 0,
    totalProducts: 0,
    totalContracts: 0,
  });
  const [revenueData, setRevenueData] = useState([]);
  const [invoiceStatusData, setInvoiceStatusData] = useState([]);
  const [recentInvoices, setRecentInvoices] = useState([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [invoices, clients, products, contracts] = await Promise.all([
        invoicesApi.getAll(),
        clientsApi.getAll(),
        productsApi.getAll(),
        contractsApi.getAll(),
      ]);

      // Calculate statistics
      const totalRevenue = invoices.data.reduce((sum, inv) => sum + inv.total, 0);
      const pendingInvoices = invoices.data.filter(inv => inv.status === 'pending').length;

      // Prepare revenue data for chart (last 6 months)
      const months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        return d.toLocaleString('default', { month: 'short' });
      }).reverse();

      const revenueByMonth = months.map(month => {
        const monthInvoices = invoices.data.filter(inv => {
          const invDate = new Date(inv.createdAt);
          return invDate.toLocaleString('default', { month: 'short' }) === month;
        });
        return {
          month,
          revenue: monthInvoices.reduce((sum, inv) => sum + inv.total, 0),
        };
      });

      // Prepare invoice status data for pie chart
      const statusCounts = invoices.data.reduce((acc, inv) => {
        acc[inv.status] = (acc[inv.status] || 0) + 1;
        return acc;
      }, {});

      const statusData = Object.entries(statusCounts).map(([status, count]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: count,
      }));

      // Get recent invoices
      const recent = [...invoices.data]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      setStats({
        totalInvoices: invoices.data.length,
        totalRevenue,
        pendingInvoices,
        totalClients: clients.data.length,
        totalProducts: products.data.length,
        totalContracts: contracts.data.length,
      });
      setRevenueData(revenueByMonth);
      setInvoiceStatusData(statusData);
      setRecentInvoices(recent);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Refresh data every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 4, fontWeight: 'bold' }}>
        Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Total Invoices
            </Typography>
            <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold' }}>
              {stats.totalInvoices}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Total Revenue
            </Typography>
            <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold' }}>
              ${stats.totalRevenue.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Pending Invoices
            </Typography>
            <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold' }}>
              {stats.pendingInvoices}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Total Clients
            </Typography>
            <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold' }}>
              {stats.totalClients}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Total Products
            </Typography>
            <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold' }}>
              {stats.totalProducts}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Active Contracts
            </Typography>
            <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold' }}>
              {stats.totalContracts}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Revenue Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Revenue Overview
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" name="Revenue" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Invoice Status Chart */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Invoice Status
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={invoiceStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {invoiceStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Recent Invoices */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Recent Invoices
            </Typography>
            <Grid container spacing={2}>
              {recentInvoices.map((invoice) => (
                <Grid item xs={12} sm={6} md={4} lg={2.4} key={invoice._id}>
                  <Paper
                    sx={{
                      p: 2,
                      borderLeft: 4,
                      borderColor: invoice.status === 'paid' ? 'success.main' : 'warning.main',
                    }}
                  >
                    <Typography variant="subtitle2" color="text.secondary">
                      {invoice.invoiceNumber}
                    </Typography>
                    <Typography variant="h6" sx={{ mt: 1 }}>
                      ${invoice.total.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(invoice.createdAt).toLocaleDateString()}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'inline-block',
                        mt: 1,
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        bgcolor: invoice.status === 'paid' ? 'success.light' : 'warning.light',
                        color: invoice.status === 'paid' ? 'success.dark' : 'warning.dark',
                      }}
                    >
                      {invoice.status.toUpperCase()}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard; 