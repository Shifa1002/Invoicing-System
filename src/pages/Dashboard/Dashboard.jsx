import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp,
  AccountBalance,
  Description,
  People,
  ShoppingCart,
  AttachMoney,
  Schedule,
  Warning,
  CheckCircle,
  Cancel,
  Refresh,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { dashboardApi } from '../../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await dashboardApi.getStats();
      setStats(response.data);
    } catch (error) {
      enqueueSnackbar('Error fetching dashboard data', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
      </Box>
    );
  }

  if (!stats) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No data available
        </Typography>
      </Box>
    );
  }

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography color="text.secondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar
            sx={{
              bgcolor: color,
              width: 56,
              height: 56,
              position: 'absolute',
              top: -20,
              right: 20,
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  const StatusCard = ({ title, count, percentage, color, icon }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="text.secondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
              {count}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {percentage}% of total
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: color, width: 48, height: 48 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  const RecentItem = ({ item, type }) => (
    <ListItem>
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: type === 'invoice' ? 'primary.main' : 'secondary.main' }}>
          {type === 'invoice' ? <Description /> : <AccountBalance />}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={type === 'invoice' ? `Invoice #${item.invoiceNumber}` : item.title}
        secondary={item.client?.name || 'Unknown Client'}
      />
      <Chip
        label={type === 'invoice' ? `$${item.totalAmount?.toFixed(2)}` : item.status}
        size="small"
        color={type === 'invoice' ? 'primary' : 'default'}
      />
    </ListItem>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Tooltip title="Refresh">
          <IconButton onClick={fetchStats} disabled={loading}>
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Overview Stats */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value={`$${stats.overview.totalRevenue?.toFixed(2) || '0.00'}`}
            icon={<AttachMoney />}
            color="success.main"
            subtitle="All time earnings"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Invoices"
            value={stats.overview.totalInvoices || 0}
            icon={<Description />}
            color="primary.main"
            subtitle="All invoices created"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Contracts"
            value={stats.overview.activeContracts || 0}
            icon={<AccountBalance />}
            color="secondary.main"
            subtitle="Currently active"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Clients"
            value={stats.overview.totalClients || 0}
            icon={<People />}
            color="info.main"
            subtitle="Registered clients"
          />
        </Grid>
      </Grid>

      {/* Invoice Status */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <StatusCard
            title="Paid Invoices"
            count={stats.invoiceStatus.paid}
            percentage={stats.invoiceStatus.paidPercentage}
            color="success.main"
            icon={<CheckCircle />}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatusCard
            title="Pending Invoices"
            count={stats.invoiceStatus.pending}
            percentage={stats.invoiceStatus.pendingPercentage}
            color="warning.main"
            icon={<Schedule />}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatusCard
            title="Overdue Invoices"
            count={stats.invoiceStatus.overdue}
            percentage={stats.invoiceStatus.overduePercentage}
            color="error.main"
            icon={<Warning />}
          />
        </Grid>
      </Grid>

      {/* Recent Activity & Top Clients */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Recent Invoices
            </Typography>
            <List dense>
              {stats.recent.invoices?.map((invoice, index) => (
                <RecentItem key={index} item={invoice} type="invoice" />
              ))}
              {(!stats.recent.invoices || stats.recent.invoices.length === 0) && (
                <ListItem>
                  <ListItemText
                    primary="No recent invoices"
                    secondary="Create your first invoice to see it here"
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Top Clients by Revenue
            </Typography>
            <List dense>
              {stats.topClients?.map((client, index) => (
                <ListItem key={index}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: `primary.${index % 2 ? 'light' : 'main'}` }}>
                      {client.name.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={client.name}
                    secondary={`${client.invoiceCount} invoices`}
                  />
                  <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold' }}>
                    ${client.totalRevenue?.toFixed(2)}
                  </Typography>
                </ListItem>
              ))}
              {(!stats.topClients || stats.topClients.length === 0) && (
                <ListItem>
                  <ListItemText
                    primary="No client data"
                    secondary="Client revenue data will appear here"
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Monthly Revenue Chart */}
      {stats.monthlyRevenue && stats.monthlyRevenue.length > 0 && (
        <Paper sx={{ p: 2, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Monthly Revenue Trend
          </Typography>
          <Grid container spacing={2}>
            {stats.monthlyRevenue.map((month, index) => (
              <Grid item xs={6} sm={4} md={2} key={index}>
                <Card sx={{ textAlign: 'center', p: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {month.month}
                  </Typography>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                    ${month.revenue?.toFixed(2)}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default Dashboard;
