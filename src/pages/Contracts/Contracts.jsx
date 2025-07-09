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
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Receipt as InvoiceIcon,
} from '@mui/icons-material';
import { contractsApi, clientsApi, productsApi } from '../../services/api';

const Contracts = () => {
  const [contracts, setContracts] = useState([]);
  const [clients, setClients] = useState([]);
  const [setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [formData, setFormData] = useState({
    client: '',
    title: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(),
    terms: '',
    totalAmount: 0,
    paymentTerms: '',
  });

  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const columns = [
    { field: 'title', headerName: 'Title', width: 200 },
    {
      field: 'client',
      headerName: 'Client',
      width: 200,
      valueGetter: (params) => params.row.client?.name || '',
    },
    {
      field: 'startDate',
      headerName: 'Start Date',
      width: 130,
      valueGetter: (params) => new Date(params.row.startDate).toLocaleDateString(),
    },
    {
      field: 'endDate',
      headerName: 'End Date',
      width: 130,
      valueGetter: (params) => new Date(params.row.endDate).toLocaleDateString(),
    },
    {
      field: 'totalAmount',
      headerName: 'Total Amount',
      width: 130,
      valueGetter: (params) => `$${params.row.totalAmount.toFixed(2)}`,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
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
            onClick={() => handleGenerateInvoice(params.row)}
            size="small"
          >
            <InvoiceIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      const [contractsRes, clientsRes, productsRes] = await Promise.all([
        contractsApi.getAll(),
        clientsApi.getAll(),
        productsApi.getAll(),
      ]);
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
    setEditingContract(null);
    setFormData({
      client: '',
      title: '',
      description: '',
      startDate: new Date(),
      endDate: new Date(),
      terms: '',
      totalAmount: 0,
      paymentTerms: '',
    });
  };

  const handleClose = () => {
    setOpen(false);
    setEditingContract(null);
  };

  const handleEdit = (contract) => {
    setEditingContract(contract);
    setFormData({
      ...contract,
      startDate: new Date(contract.startDate),
      endDate: new Date(contract.endDate),
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await contractsApi.delete(id);
      fetchData();
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting contract');
    }
  };

  const handleGenerateInvoice = async (contract) => {
    try {
      // Navigate to invoice generation page with contract data
      window.location.href = `/invoices/generate?contractId=${contract._id}`;
    } catch (err) {
      setError(err.response?.data?.message || 'Error generating invoice');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const contractData = {
        ...formData,
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString(),
      };

      if (editingContract) {
        await contractsApi.update(editingContract._id, contractData);
      } else {
        await contractsApi.create(contractData);
      }
      fetchData();
      handleClose();
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving contract');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Box sx={{ height: '100%', width: '100%', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Contracts
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleClickOpen}
          sx={{ borderRadius: 2 }}
        >
          Add Contract
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
            rows={contracts}
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
          {editingContract ? 'Edit Contract' : 'Add New Contract'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Autocomplete
                  options={clients}
                  getOptionLabel={(option) => option.name}
                  value={clients.find((c) => c._id === formData.client) || null}
                  onChange={(event, newValue) => {
                    setFormData((prev) => ({
                      ...prev,
                      client: newValue ? newValue._id : '',
                    }));
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      label="Client"
                      required
                      variant="outlined"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Start Date"
                    value={formData.startDate}
                    onChange={(newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        startDate: newValue,
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth required variant="outlined" />
                    )}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="End Date"
                    value={formData.endDate}
                    onChange={(newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        endDate: newValue,
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth required variant="outlined" />
                    )}
                  />
                </LocalizationProvider>
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
                <TextField
                  fullWidth
                  label="Terms and Conditions"
                  name="terms"
                  value={formData.terms}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Total Amount"
                  name="totalAmount"
                  type="number"
                  value={formData.totalAmount}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: '$',
                  }}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Payment Terms"
                  name="paymentTerms"
                  value={formData.paymentTerms}
                  onChange={handleChange}
                  required
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleClose} variant="outlined">
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              {editingContract ? 'Update' : 'Add'}
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

export default Contracts; 