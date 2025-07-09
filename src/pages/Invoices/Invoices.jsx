import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Paper,
  IconButton,
  Grid,
  MenuItem,
  Autocomplete,
  CircularProgress,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { invoicesApi, contractsApi, clientsApi, productsApi } from '../../services/api';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [formData, setFormData] = useState({
    contract: '',
    client: '',
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    status: 'draft',
    dueDate: new Date(),
  });

  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'sent', label: 'Sent' },
    { value: 'paid', label: 'Paid' },
    { value: 'overdue', label: 'Overdue' },
  ];

  const columns = [
    { field: 'invoiceNumber', headerName: 'Invoice #', width: 130 },
    {
      field: 'client',
      headerName: 'Client',
      width: 200,
      valueGetter: (params) => params.row.client?.name || '',
    },
    {
      field: 'contract',
      headerName: 'Contract',
      width: 200,
      valueGetter: (params) => params.row.contract?.title || '',
    },
    {
      field: 'total',
      headerName: 'Total',
      width: 130,
      valueGetter: (params) => `$${params.row.total.toFixed(2)}`,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
    },
    {
      field: 'dueDate',
      headerName: 'Due Date',
      width: 130,
      valueGetter: (params) => new Date(params.row.dueDate).toLocaleDateString(),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: (params) => (
        <Box>
          <IconButton
            color="primary"
            onClick={() => handleEdit(params.row)}
            size="small"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => handleDelete(params.row._id)}
            size="small"
          >
            <DeleteIcon />
          </IconButton>
          <IconButton
            color="success"
            onClick={() => handleDownloadPdf(params.row._id)}
            size="small"
          >
            <DownloadIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invoicesRes, contractsRes, clientsRes, productsRes] = await Promise.all([
        invoicesApi.getAll(),
        contractsApi.getAll(),
        clientsApi.getAll(),
        productsApi.getAll(),
      ]);
      setInvoices(invoicesRes.data);
      setContracts(contractsRes.data);
      setClients(clientsRes.data);
      setProducts(productsRes.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleClickOpen = () => {
    setOpen(true);
    setEditingInvoice(null);
    setFormData({
      contract: '',
      client: '',
      items: [],
      subtotal: 0,
      tax: 0,
      total: 0,
      status: 'draft',
      dueDate: new Date(),
    });
  };

  const handleClose = () => {
    setOpen(false);
    setEditingInvoice(null);
  };

  const handleEdit = (invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      ...invoice,
      dueDate: new Date(invoice.dueDate),
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await invoicesApi.delete(id);
      fetchData();
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting invoice');
    }
  };

  const handleDownloadPdf = async (id) => {
    try {
      const response = await invoicesApi.getPdf(id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || 'Error downloading PDF');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const invoiceData = {
        ...formData,
        dueDate: formData.dueDate.toISOString(),
      };

      if (editingInvoice) {
        await invoicesApi.update(editingInvoice._id, invoiceData);
      } else {
        await invoicesApi.create(invoiceData);
      }
      fetchData();
      handleClose();
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving invoice');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleContractChange = (event, newValue) => {
    if (newValue) {
      setFormData((prev) => ({
        ...prev,
        contract: newValue._id,
        client: newValue.client,
        items: newValue.products.map((product) => ({
          product: product._id,
          quantity: 1,
          price: product.price,
        })),
        subtotal: newValue.totalAmount,
        tax: newValue.totalAmount * 0.1,
        total: newValue.totalAmount * 1.1,
      }));
    }
  };

  return (
    <Box sx={{ height: '100%', width: '100%', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Invoices
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleClickOpen}
          sx={{ borderRadius: 2 }}
        >
          Create Invoice
        </Button>
      </Box>

      <Paper
        sx={{
          height: 'calc(100vh - 200px)',
          width: '100%',
          '& .MuiDataGrid-root': {
            border: 'none',
          },
          '& .MuiDataGrid-cell': {
            borderColor: 'divider',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: 'background.paper',
            borderBottom: 2,
            borderColor: 'divider',
          },
        }}
      >
        {loading ? (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={invoices}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10]}
            checkboxSelection
            disableSelectionOnClick
            getRowId={(row) => row._id}
            loading={loading}
          />
        )}
      </Paper>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle>
          {editingInvoice ? 'Edit Invoice' : 'Create New Invoice'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Autocomplete
                  options={contracts}
                  getOptionLabel={(option) => option.title}
                  value={contracts.find((c) => c._id === formData.contract) || null}
                  onChange={handleContractChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      label="Contract"
                      required
                      variant="outlined"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  variant="outlined"
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell align="right">Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formData.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {products.find((p) => p._id === item.product)?.name}
                          </TableCell>
                          <TableCell align="right">{item.quantity}</TableCell>
                          <TableCell align="right">${item.price.toFixed(2)}</TableCell>
                          <TableCell align="right">
                            ${(item.quantity * item.price).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell rowSpan={3} />
                        <TableCell colSpan={2} align="right">
                          <strong>Subtotal</strong>
                        </TableCell>
                        <TableCell align="right">
                          ${formData.subtotal.toFixed(2)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={2} align="right">
                          <strong>Tax (10%)</strong>
                        </TableCell>
                        <TableCell align="right">
                          ${formData.tax.toFixed(2)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={2} align="right">
                          <strong>Total</strong>
                        </TableCell>
                        <TableCell align="right">
                          ${formData.total.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleClose} variant="outlined">
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              {editingInvoice ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

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

export default Invoices; 