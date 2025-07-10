import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Paper,
  IconButton,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  DataGrid,
  GridToolbar,
} from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterListIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

import InvoiceForm from './InvoiceForm';
import InvoicePreview from './InvoicePreview';
import FormDialog from '../../components/common/FormDialog';
import DataGridToolbar from '../../components/common/DataGridToolbar';

import { invoicesApi, clientsApi, contractsApi, productsApi } from '../../services/api';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [formData, setFormData] = useState({
    client: '',
    contract: '',
    items: [],
    dueDate: new Date(),
    notes: '',
    status: 'draft',
    paymentTerms: 'Net 30',
  });
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [filterModel, setFilterModel] = useState({
    items: [{ field: 'status', operator: 'is', value: '' }],
  });
  const [totalPages, setTotalPages] = useState(0);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuInvoice, setMenuInvoice] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'sent', label: 'Sent' },
    { value: 'paid', label: 'Paid' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [invoicesRes, clientsRes, contractsRes, productsRes] = await Promise.all([
        invoicesApi.getAll({
          page: paginationModel.page + 1,
          limit: paginationModel.pageSize,
          status: filterModel.items[0]?.value || undefined,
        }),
        clientsApi.getAll(),
        contractsApi.getAll(),
        productsApi.getAll(),
      ]);

      const invoiceList = invoicesRes.data.invoices || invoicesRes.data || [];
      const cleanedInvoices = invoiceList.filter((invoice) => invoice && invoice._id);

      setInvoices(cleanedInvoices);
      setTotalPages(invoicesRes.data.totalPages || 1);
      setTotalInvoices(invoicesRes.data.totalInvoices || cleanedInvoices.length);

      setClients(clientsRes.data.clients || clientsRes.data || []);
      setContracts(contractsRes.data.contracts || contractsRes.data || []);
      setProducts(productsRes.data.products || productsRes.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching data');
      setInvoices([]);
      setClients([]);
      setContracts([]);
      setProducts([]);
      setTotalPages(0);
      setTotalInvoices(0);
    } finally {
      setLoading(false);
    }
  }, [paginationModel, filterModel]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleClickOpen = () => {
    setOpen(true);
    setEditingInvoice(null);
    setFormData({
      client: '',
      contract: '',
      items: [],
      dueDate: new Date(),
      notes: '',
      status: 'draft',
      paymentTerms: 'Net 30',
    });
  };

  const handleClose = () => {
    setOpen(false);
    setEditingInvoice(null);
    setError(null);
  };

  const handleEdit = (invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      ...invoice,
      dueDate: new Date(invoice.dueDate),
      items: invoice.items.map((item) => ({
        ...item,
        product: item.product._id,
      })),
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await invoicesApi.delete(id);
        enqueueSnackbar('Invoice deleted successfully', { variant: 'success' });
        fetchData();
      } catch (err) {
        const message = err.response?.data?.message || 'Error deleting invoice';
        setError(message);
        enqueueSnackbar(message, { variant: 'error' });
      }
    }
  };

  const handleView = (invoice) => {
    setSelectedInvoice(invoice);
    setPreviewOpen(true);
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingInvoice) {
        await invoicesApi.update(editingInvoice._id, formData);
        enqueueSnackbar('Invoice updated successfully', { variant: 'success' });
      } else {
        await invoicesApi.create(formData);
        enqueueSnackbar('Invoice created successfully', { variant: 'success' });
      }
      handleClose();
      fetchData();
    } catch (err) {
      const message = err.response?.data?.message || 'Error saving invoice';
      setError(message);
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  const handleMenuOpen = (event, invoice) => {
    setMenuAnchor(event.currentTarget);
    setMenuInvoice(invoice);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuInvoice(null);
  };

  const columns = [
    { field: 'invoiceNumber', headerName: 'Invoice #', width: 150 },
    {
      field: 'client',
      headerName: 'Client',
      width: 200,
      valueGetter: (params) => params.row?.client?.name || '',
    },
    {
      field: 'issueDate',
      headerName: 'Issue Date',
      width: 130,
      valueGetter: (params) =>
        params.row?.issueDate ? new Date(params.row.issueDate).toLocaleDateString() : '',
    },
    {
      field: 'dueDate',
      headerName: 'Due Date',
      width: 130,
      valueGetter: (params) =>
        params.row?.dueDate ? new Date(params.row.dueDate).toLocaleDateString() : '',
    },
    {
      field: 'total',
      headerName: 'Total',
      width: 120,
      valueGetter: (params) => {
        const total = params.row?.total;
        return total != null ? `$${Number(total).toFixed(2)}` : '';
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      valueGetter: (params) => {
        const status = statusOptions.find((s) => s.value === params.row.status);
        return status ? status.label : params.row.status || '';
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: (params) => (
        <Box>
          <IconButton color="primary" onClick={() => handleView(params.row)} size="small">
            <VisibilityIcon />
          </IconButton>
          <IconButton color="primary" onClick={() => handleEdit(params.row)} size="small">
            <EditIcon />
          </IconButton>
          <IconButton color="error" onClick={() => handleDelete(params.row._id)} size="small">
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ height: '100%', width: '100%', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Invoices</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={() =>
              setFilterModel({ items: [{ field: 'status', operator: 'is', value: '' }] })
            }
          >
            Clear Filters
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleClickOpen}
            sx={{ borderRadius: 2 }}
          >
            Create Invoice
          </Button>
        </Box>
      </Box>

      <Paper sx={{ height: 'calc(100vh - 200px)', width: '100%' }}>
        {loading ? (
          <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={invoices}
            columns={columns}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            filterModel={filterModel}
            onFilterModelChange={setFilterModel}
            getRowId={(row) => row._id}
            rowCount={totalInvoices}
            paginationMode="server"
            filterMode="server"
            disableRowSelectionOnClick
            loading={loading}
            pageSizeOptions={[10, 25, 50]}
            slots={{
              toolbar: GridToolbar,
              noRowsOverlay: () => (
                <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body1" color="text.secondary">No invoices found</Typography>
                </Box>
              ),
            }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 },
              },
            }}
          />
        )}
      </Paper>

      <FormDialog
        open={open}
        onClose={handleClose}
        title={editingInvoice ? 'Edit Invoice' : 'Create New Invoice'}
        onSubmit={() => {}}
        error={error}
        maxWidth="lg"
        hideActions
      >
        <InvoiceForm
          initialData={editingInvoice}
          onSubmit={handleSubmit}
          onCancel={handleClose}
        />
      </FormDialog>

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

      <FormDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Invoice Preview"
        maxWidth="md"
        fullWidth
      >
        <InvoicePreview
          invoice={selectedInvoice}
          onClose={() => setPreviewOpen(false)}
        />
      </FormDialog>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
        <MenuItem onClick={() => { handleView(menuInvoice); handleMenuClose(); }}>
          <VisibilityIcon fontSize="small" sx={{ mr: 1 }} /> View
        </MenuItem>
        <MenuItem onClick={() => { handleEdit(menuInvoice); handleMenuClose(); }}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={() => { handleDelete(menuInvoice._id); handleMenuClose(); }} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Invoices;
