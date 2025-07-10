import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Paper, CircularProgress,
  IconButton, Menu, MenuItem, Snackbar, Alert,
} from '@mui/material';
import {
  DataGrid, GridActionsCellItem,
} from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Receipt as InvoiceIcon,
  MoreVert as MoreVertIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import {
  contractsApi, clientsApi, productsApi, invoicesApi,
} from '../../services/api';
import { useSnackbar } from 'notistack';
import DataGridToolbar from '../../components/common/DataGridToolbar';
import FormDialog from '../../components/common/FormDialog';
import ContractForm from './ContractForm';

const Contracts = () => {
  const [contracts, setContracts] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedContractForMenu, setSelectedContractForMenu] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

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
      valueGetter: (params) => params.row?.client?.name || '',
    },
    {
      field: 'startDate',
      headerName: 'Start Date',
      width: 130,
      valueGetter: (params) => params.row?.startDate
        ? new Date(params.row.startDate).toLocaleDateString() : '',
    },
    {
      field: 'endDate',
      headerName: 'End Date',
      width: 130,
      valueGetter: (params) => params.row?.endDate
        ? new Date(params.row.endDate).toLocaleDateString() : '',
    },
    {
      field: 'totalAmount',
      headerName: 'Total Amount',
      width: 130,
      valueGetter: (params) => {
        const amount = params.row?.totalAmount;
        return amount != null ? `$${Number(amount).toFixed(2)}` : '';
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      valueGetter: (params) => {
        const status = statusOptions.find(s => s.value === params.row.status);
        return status ? status.label : params.row.status || '';
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: (params) => (
        <Box>
          <IconButton color="primary" onClick={() => handleEdit(params.row)} size="small">
            <EditIcon />
          </IconButton>
          <IconButton color="error" onClick={() => handleDelete(params.row._id)} size="small">
            <DeleteIcon />
          </IconButton>
          <IconButton color="success" onClick={() => handleGenerateInvoice(params.row)} size="small">
            <InvoiceIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [contractsRes, clientsRes, productsRes] = await Promise.all([
        contractsApi.getAll(),
        clientsApi.getAll(),
        productsApi.getAll(),
      ]);

      const contractList = contractsRes.data.contracts || contractsRes.data || [];
      const cleanedContracts = contractList.filter(contract => contract && contract._id);

      setContracts(cleanedContracts);
      setClients(clientsRes.data.clients || clientsRes.data || []);
      setProducts(productsRes.data.products || productsRes.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching data');
      setContracts([]);
      setClients([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleClickOpen = () => {
    setOpen(true);
    setEditingContract(null);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingContract(null);
  };

  const handleEdit = (contract) => {
    setEditingContract(contract);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this contract?')) {
      try {
        await contractsApi.delete(id);
        enqueueSnackbar('Contract deleted successfully', { variant: 'success' });
        fetchData();
      } catch (error) {
        enqueueSnackbar('Error deleting contract', { variant: 'error' });
      }
    }
  };

  const handleGenerateInvoice = async (contract) => {
    if (!contract) return;

    try {
      const response = await invoicesApi.create({
        contractId: contract._id,
        clientId: contract.client,
        products: contract.products.map(p => ({
          productId: p.product,
          quantity: p.quantity
        }))
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${contract._id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      enqueueSnackbar('Invoice generated successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Error generating invoice', { variant: 'error' });
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingContract) {
        await contractsApi.update(editingContract._id, formData);
        enqueueSnackbar('Contract updated successfully', { variant: 'success' });
      } else {
        await contractsApi.create(formData);
        enqueueSnackbar('Contract created successfully', { variant: 'success' });
      }
      handleClose();
      fetchData();
    } catch (err) {
      let message = 'Error saving contract';

      if (err.response?.data?.errors) {
        message = err.response.data.errors.map(error => `${error.param}: ${error.msg}`).join(', ');
      } else if (err.response?.data?.message) {
        message = err.response.data.message;
      }

      setError(message);
      enqueueSnackbar(message, { variant: 'error' });
    }
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

      <Paper sx={{
        height: 'calc(100vh - 200px)',
        width: '100%',
        '& .MuiDataGrid-root': { border: 'none' },
        '& .MuiDataGrid-columnHeaders': {
          backgroundColor: 'background.paper',
          borderBottom: 2,
          borderColor: 'divider',
        },
      }}>
        {loading ? (
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={contracts}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10]}
            getRowId={(row) => row._id}
            checkboxSelection
            disableSelectionOnClick
          />
        )}
      </Paper>

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

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => {
          setMenuAnchor(null);
          setSelectedContractForMenu(null);
        }}
      >
        <MenuItem onClick={() => handleGenerateInvoice(selectedContractForMenu)}>
          <MoneyIcon fontSize="small" sx={{ mr: 1 }} />
          Generate Invoice
        </MenuItem>
        <MenuItem onClick={() => {
          handleDelete(selectedContractForMenu?._id);
          setMenuAnchor(null);
          setSelectedContractForMenu(null);
        }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      <FormDialog
        open={open}
        onClose={handleClose}
        title={editingContract ? 'Edit Contract' : 'Add New Contract'}
        onSubmit={handleSubmit}
        error={error}
        maxWidth="lg"
        hideActions={true}
      >
        <ContractForm
          contract={editingContract}
          onSubmit={handleSubmit}
          onCancel={handleClose}
        />
      </FormDialog>
    </Box>
  );
};

export default Contracts;
