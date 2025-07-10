import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper
} from '@mui/material';
import {
  DataGrid,
} from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { clientsApi } from '../../services/api';
import DataGridToolbar from '../../components/common/DataGridToolbar';
import FormDialog from '../../components/common/FormDialog';
import ClientForm from './ClientForm';


const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const { enqueueSnackbar } = useSnackbar();

  const columns = [
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'email', headerName: 'Email', width: 250 },
    { field: 'phone', headerName: 'Phone', width: 150 },
    {
      field: 'address',
      headerName: 'Address',
      width: 300,
      valueGetter: (params) => {
        const addr = params?.row?.address || {};
        return `${addr.street || ''} ${addr.city || ''} ${addr.state || ''} ${addr.zipCode || ''}`.trim();
      },
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 120,
      valueGetter: (params) => (params?.row?.isActive ? 'Active' : 'Inactive'),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: (params) => (
        <Box>
          <Button color="primary" onClick={() => handleEdit(params.row)} size="small">
            <ViewIcon />
          </Button>
          <Button color="primary" onClick={() => handleEdit(params.row)} size="small">
            <EditIcon />
          </Button>
          <Button color="error" onClick={() => handleDelete(params.row._id)} size="small">
            <DeleteIcon />
          </Button>
        </Box>
      ),
    },
  ];

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      const response = await clientsApi.getAll({
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        search: searchQuery
      });

      const data = response.data.clients || response.data || [];
      const cleanedClients = data.filter(client => client && client._id);
      setClients(cleanedClients);
      setError(null);
    } catch (error) {
      const message = error.response?.data?.message || 'Error fetching clients';
      setError(message);
      enqueueSnackbar(message, { variant: 'error' });
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, [paginationModel, searchQuery, enqueueSnackbar]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleAdd = () => {
    setSelectedClient(null);
    setOpenDialog(true);
    setError(null);
  };

  const handleEdit = (client) => {
    setSelectedClient(client);
    setOpenDialog(true);
    setError(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await clientsApi.delete(id);
        enqueueSnackbar('Client deleted successfully', { variant: 'success' });
        fetchClients();
      } catch (error) {
        const message = error.response?.data?.message || 'Error deleting client';
        enqueueSnackbar(message, { variant: 'error' });
      }
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (selectedClient) {
        await clientsApi.update(selectedClient._id, formData);
        enqueueSnackbar('Client updated successfully', { variant: 'success' });
      } else {
        await clientsApi.create(formData);
        enqueueSnackbar('Client created successfully', { variant: 'success' });
      }
      setOpenDialog(false);
      fetchClients();
    } catch (error) {
      const message = error.response?.data?.message || 'Error saving client';
      setError(message);
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" component="h1">Clients</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
          Add Client
        </Button>
      </Box>

      <Paper sx={{ flex: 1, display: 'flex' }}>
        <DataGrid
          rows={clients}
          columns={columns}
          loading={loading}
          getRowId={(row) => row._id}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50]}
          slots={{
            toolbar: () => (
              <DataGridToolbar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onClearSearch={() => setSearchQuery('')}
              />
            )
          }}
          sx={{
            '& .MuiDataGrid-cell:focus': {
              outline: 'none'
            }
          }}
        />
      </Paper>

      <FormDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        title={selectedClient ? 'Edit Client' : 'Add Client'}
        onSubmit={() => {}}
        error={error}
        maxWidth="md"
        hideActions={true}
      >
        <ClientForm
          client={selectedClient}
          onSubmit={handleSubmit}
          onCancel={() => setOpenDialog(false)}
        />
      </FormDialog>
    </Box>
  );
};

export default Clients;
