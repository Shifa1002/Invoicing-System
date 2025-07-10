import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Snackbar,
  Alert,
  Chip
} from '@mui/material';
import {
  DataGrid,
  GridActionsCellItem,
} from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { productsApi } from '../../services/api';
import DataGridToolbar from '../../components/common/DataGridToolbar';
import FormDialog from '../../components/common/FormDialog';
import ProductForm from './ProductForm';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const { enqueueSnackbar } = useSnackbar();
  const [totalPages, setTotalPages] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 200 },
    { field: 'description', headerName: 'Description', flex: 1, minWidth: 200 },
    {
      field: 'price',
      headerName: 'Price',
      width: 120,
      valueFormatter: (params) => `$${params.value.toFixed(2)}`,
    },
    { field: 'unit', headerName: 'Unit', width: 100 },
    {
      field: 'category',
      headerName: 'Category',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color="primary"
          variant="outlined"
        />
      ),
    },
    {
      field: 'taxRate',
      headerName: 'Tax Rate',
      width: 100,
      valueFormatter: (params) => `${params.value}%`,
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Active' : 'Inactive'}
          size="small"
          color={params.value ? 'success' : 'default'}
        />
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<ViewIcon />}
          label="View"
          onClick={() => handleEdit(params.row)}
        />,
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleEdit(params.row)}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDelete(params.row._id)}
          showInMenu
        />
      ],
    },
  ];

  const fetchProducts = useCallback(async () => {
    try {
      console.log(paginationModel.page);
      setLoading(true);
      const response = await productsApi.getAll({
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        search: searchQuery
      });
      console.log(response.data);
      const data = response.data.products || response.data || [];
      const cleanedProducts = data.filter((product) => product && product._id);

      setProducts(cleanedProducts);
      setTotalPages(response?.data?.totalPages || 1);
      setTotalProducts(response?.data?.totalProducts || cleanedProducts.length);
      setError(null);
    } catch (error) {
      const message = error.response?.data?.message || 'Error fetching products';
      setError(message);
      enqueueSnackbar(message, { variant: 'error' });
      setProducts([]);
      setTotalPages(0);
      setTotalProducts(0);
    } finally {
      setLoading(false);
    }
  }, [paginationModel, searchQuery, enqueueSnackbar]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleClickOpen = () => {
    setOpen(true);
    setEditingProduct(null);
    setError(null);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingProduct(null);
    setError(null);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setOpen(true);
    setError(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productsApi.delete(id);
        enqueueSnackbar('Product deleted successfully', { variant: 'success' });
        fetchProducts();
      } catch (error) {
        const message = error.response?.data?.message || 'Error deleting product';
        enqueueSnackbar(message, { variant: 'error' });
      }
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingProduct) {
        await productsApi.update(editingProduct._id, formData);
        enqueueSnackbar('Product updated successfully', { variant: 'success' });
      } else {
        await productsApi.create(formData);
        enqueueSnackbar('Product created successfully', { variant: 'success' });
      }

      handleClose();
      fetchProducts();
    } catch (error) {
      const message = error.response?.data?.message || 'Error saving product';
      setError(message);
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" component="h1">Products</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleClickOpen}
        >
          Add Product
        </Button>
      </Box>

      <Paper sx={{ flex: 1, display: 'flex' }}>
        <DataGrid
          rows={products}
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
            ),
          }}
          sx={{
            '& .MuiDataGrid-cell:focus': {
              outline: 'none'
            }
          }}
        />
      </Paper>

      <FormDialog
        open={open}
        onClose={handleClose}
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        onSubmit={() => {}}
        error={error}
        hideActions={true}
      >
        <ProductForm
          product={editingProduct}
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
    </Box>
  );
};

export default Products;
