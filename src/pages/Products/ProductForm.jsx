import { useState, useEffect } from 'react';
import {
  Grid,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  Typography,
  Divider,
  Box,
  Button
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';

const categories = [
  'services',
  'software',
  'hardware',
  'consulting',
  'maintenance',
  'other'
];

const units = [
  { value: 'hour', label: 'Hour' },
  { value: 'day', label: 'Day' },
  { value: 'piece', label: 'Piece' },
  { value: 'kg', label: 'Kilogram' },
  { value: 'meter', label: 'Meter' },
  { value: 'project', label: 'Project' },
  { value: 'license', label: 'License' }
];

const ProductForm = ({ product, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    unit: 'piece',
    category: 'services',
    taxRate: 0,
    sku: '',
    isActive: true
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        unit: product.unit || 'piece',
        category: product.category || 'services',
        taxRate: product.taxRate || 0,
        sku: product.sku || '',
        isActive: product.isActive ?? true
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      price: parseFloat(formData.price),
      taxRate: parseFloat(formData.taxRate)
    };
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Basic Information
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            label="Product Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={!formData.name}
            helperText={!formData.name ? 'Name is required' : ''}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="SKU"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            placeholder="Stock Keeping Unit"
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
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            Pricing & Details
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            label="Price"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            InputProps={{
              startAdornment: '$',
            }}
            error={!formData.price || formData.price < 0}
            helperText={
              !formData.price 
                ? 'Price is required' 
                : formData.price < 0 
                  ? 'Price cannot be negative' 
                  : ''
            }
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Tax Rate (%)"
            name="taxRate"
            type="number"
            value={formData.taxRate}
            onChange={handleChange}
            InputProps={{
              endAdornment: '%',
            }}
            error={formData.taxRate < 0 || formData.taxRate > 100}
            helperText={
              formData.taxRate < 0 || formData.taxRate > 100
                ? 'Tax rate must be between 0 and 100'
                : ''
            }
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            select
            fullWidth
            required
            label="Unit"
            name="unit"
            value={formData.unit}
            onChange={handleChange}
          >
            {units.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            select
            fullWidth
            required
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={handleChange}
                name="isActive"
                color="primary"
              />
            }
            label="Active"
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={!formData.name || !formData.price}
            >
              {product ? 'Update Product' : 'Create Product'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  );
};

export default ProductForm; 