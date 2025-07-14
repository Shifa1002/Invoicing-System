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
  IconButton,
  Button,
  Autocomplete,
  Paper
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { 
  Add as AddIcon,
  Remove as RemoveIcon
} from '@mui/icons-material';
import { clientsApi, productsApi } from '../../services/api';

const billingCycles = [
  { value: 'one-time', label: 'One Time' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annually', label: 'Annually' }
];

const paymentTerms = [
  { value: 'immediate', label: 'Immediate' },
  { value: 'net15', label: 'Net 15' },
  { value: 'net30', label: 'Net 30' },
  { value: 'net60', label: 'Net 60' }
];

const currencies = [
  { value: 'USD', label: 'US Dollar ($)' },
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'GBP', label: 'British Pound (£)' },
  { value: 'CAD', label: 'Canadian Dollar (C$)' }
];

const ContractForm = ({ contract, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    client: null,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    status: 'draft',
    items: [],
    terms: {
      paymentTerms: 'net30',
      currency: 'USD',
      billingCycle: 'one-time',
      autoRenew: false,
      renewalTerm: 12
    },
    notes: '',
    isActive: true
  });

  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchClients();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (contract) {
      setFormData({
        title: contract.title || '',
        client: contract.client || null,
        startDate: new Date(contract.startDate) || new Date(),
        endDate: new Date(contract.endDate) || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: contract.status || 'draft',
        items: contract.items || [],
        terms: {
          paymentTerms: contract.terms?.paymentTerms || 'net30',
          currency: contract.terms?.currency || 'USD',
          billingCycle: contract.terms?.billingCycle || 'one-time',
          autoRenew: contract.terms?.autoRenew || false,
          renewalTerm: contract.terms?.renewalTerm || 12
        },
        notes: contract.notes || '',
        isActive: contract.isActive ?? true
      });
    }
  }, [contract]);

  const fetchClients = async () => {
    try {
      const response = await clientsApi.getAll({ limit: 100 });
      setClients(response.data.clients || response.data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setClients([]);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productsApi.getAll({ limit: 100 });
      setProducts(response.data.products || response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    }
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleDateChange = (field) => (date) => {
    setFormData(prev => ({
      ...prev,
      [field]: date
    }));
  };

  const handleClientChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      client: newValue
    }));
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          product: null,
          quantity: 1,
          unitPrice: 0,
          discount: 0,
          notes: ''
        }
      ]
    }));
  };

  const handleRemoveItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === index) {
          if (field === 'product') {
            return {
              ...item,
              product: value,
              unitPrice: value?.price || 0
            };
          }
          return {
            ...item,
            [field]: value
          };
        }
        return item;
      })
    }));
  };

  const calculateItemTotal = (item) => {
    const quantity = parseFloat(item.quantity) || 0;
    const unitPrice = parseFloat(item.unitPrice) || 0;
    const discount = parseFloat(item.discount || 0) || 0;
    
    const subtotal = quantity * unitPrice;
    const discountAmount = subtotal * (discount / 100);
    return subtotal - discountAmount;
  };

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => total + calculateItemTotal(item), 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate required fields
    if (!formData.title) {
      alert('Title is required');
      return;
    }
    if (!formData.client) {
      alert('Client is required');
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      alert('Start date and end date are required');
      return;
    }
    if (formData.items.length === 0) {
      alert('At least one item is required');
      return;
    }
    for (let i = 0; i < formData.items.length; i++) {
      const item = formData.items[i];
      if (!item.product) {
        alert(`Product is required for item ${i + 1}`);
        return;
      }
      if (!item.quantity || item.quantity <= 0) {
        alert(`Valid quantity is required for item ${i + 1}`);
        return;
      }
      if (!item.unitPrice || item.unitPrice < 0) {
        alert(`Valid unit price is required for item ${i + 1}`);
        return;
      }
    }
    // Prepare data for submission - only send required fields
    const submitData = {
      title: formData.title,
      description: formData.description || '',
      client: formData.client._id || formData.client,
      startDate: formData.startDate instanceof Date ? formData.startDate.toISOString() : formData.startDate,
      endDate: formData.endDate instanceof Date ? formData.endDate.toISOString() : formData.endDate,
      status: formData.status || 'draft',
      items: formData.items.map(item => ({
        product: item.product._id || item.product,
        quantity: parseFloat(item.quantity) || 0,
        unitPrice: parseFloat(item.unitPrice) || 0,
        discount: parseFloat(item.discount || 0) || 0,
        notes: item.notes || ''
      })),
      terms: {
        paymentTerms: formData.terms?.paymentTerms || 'net30',
        currency: formData.terms?.currency || 'USD',
        billingCycle: formData.terms?.billingCycle || 'one-time',
        autoRenew: !!formData.terms?.autoRenew,
        renewalTerm: parseInt(formData.terms?.renewalTerm || 12) || 12
      },
      notes: formData.notes || ''
    };
    
    console.log('Sending contract data:', submitData);
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
            label="Contract Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            error={!formData.title}
            helperText={!formData.title ? 'Title is required' : ''}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Autocomplete
            fullWidth
            required
            options={clients}
            getOptionLabel={(option) => option.name}
            value={formData.client}
            onChange={handleClientChange}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Client"
                error={!formData.client}
                helperText={!formData.client ? 'Client is required' : ''}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <DatePicker
            label="Start Date"
            value={formData.startDate}
            onChange={handleDateChange('startDate')}
            renderInput={(params) => (
              <TextField {...params} fullWidth required />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <DatePicker
            label="End Date"
            value={formData.endDate}
            onChange={handleDateChange('endDate')}
            renderInput={(params) => (
              <TextField {...params} fullWidth required />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            Contract Items
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        {formData.items.map((item, index) => (
          <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={4}>
              <Autocomplete
                fullWidth
                options={products}
                getOptionLabel={(option) => option.name}
                value={item.product}
                onChange={(event, newValue) => handleItemChange(index, 'product', newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Product" required />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                fullWidth
                type="number"
                label="Quantity"
                value={item.quantity || ''}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  handleItemChange(index, 'quantity', isNaN(value) ? 0 : value);
                }}
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                fullWidth
                type="number"
                label="Unit Price"
                value={item.unitPrice || ''}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  handleItemChange(index, 'unitPrice', isNaN(value) ? 0 : value);
                }}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                fullWidth
                type="number"
                label="Discount %"
                value={item.discount || ''}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  handleItemChange(index, 'discount', isNaN(value) ? 0 : value);
                }}
                inputProps={{ min: 0, max: 100, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12} sm={1}>
              <Typography variant="body2" sx={{ mt: 2 }}>
                ${calculateItemTotal(item).toFixed(2)}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={1}>
              <IconButton
                color="error"
                onClick={() => handleRemoveItem(index)}
                size="small"
              >
                <RemoveIcon />
              </IconButton>
            </Grid>
          </Grid>
        ))}

        <Grid item xs={12}>
          <Button
            startIcon={<AddIcon />}
            onClick={handleAddItem}
            variant="outlined"
            size="small"
          >
            Add Item
          </Button>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mt: 2, textAlign: 'right' }}>
            Total: ${calculateTotal().toFixed(2)}
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            Terms & Conditions
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            select
            fullWidth
            label="Payment Terms"
            name="terms.paymentTerms"
            value={formData.terms.paymentTerms}
            onChange={handleChange}
          >
            {paymentTerms.map((option) => (
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
            label="Currency"
            name="terms.currency"
            value={formData.terms.currency}
            onChange={handleChange}
          >
            {currencies.map((option) => (
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
            label="Billing Cycle"
            name="terms.billingCycle"
            value={formData.terms.billingCycle}
            onChange={handleChange}
          >
            {billingCycles.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.terms.autoRenew}
                onChange={handleChange}
                name="terms.autoRenew"
              />
            }
            label="Auto Renew"
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={handleChange}
                name="isActive"
              />
            }
            label="Active"
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
            <Button onClick={onCancel} variant="outlined">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              {contract ? 'Update Contract' : 'Create Contract'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  );
};

export default ContractForm; 