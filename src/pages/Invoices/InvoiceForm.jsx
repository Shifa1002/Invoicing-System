import React, { useState, useEffect, useCallback } from 'react';
import {
  Grid,
  TextField,
  Autocomplete,
  Button,
  Typography,
  Box,
  IconButton,
  Divider,
  MenuItem,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { contractsApi } from '../../services/api';

const InvoiceForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    contract: null,
    issueDate: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    notes: '',
    terms: '',
    status: 'draft',
    isPaid: false,
    paymentDate: null,
    paymentMode: '',
    paymentMethod: '',
    paymentReference: '',
  });

  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const fetchContracts = useCallback(async () => {
    try {
      const response = await contractsApi.getAll({ status: 'active' });
      const data = response.data;
      const contractsList = Array.isArray(data?.contracts)
        ? data.contracts
        : Array.isArray(data)
        ? data
        : [];
      setContracts(contractsList);
    } catch (error) {
      enqueueSnackbar('Error fetching contracts', { variant: 'error' });
      setContracts([]);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    fetchContracts();
    if (initialData) {
      setFormData(initialData);
    }
  }, [fetchContracts, initialData]);

  const handleInputChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleDateChange = (field) => (date) => {
    setFormData((prev) => ({
      ...prev,
      [field]: date,
    }));
  };

  const handleContractChange = (event, newValue) => {
    if (newValue) {
      setFormData((prev) => ({
        ...prev,
        contract: newValue,
        items: newValue.items.map((item) => ({
          product: item.product,
          description: item.product.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount || 0,
          notes: item.notes || '',
        })),
      }));
      calculateTotals();
    }
  };

  const handleItemChange = (index, field) => (event) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: event.target.value,
    };
    setFormData((prev) => ({
      ...prev,
      items: newItems,
    }));
    calculateTotals();
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          product: null,
          description: '',
          quantity: 1,
          unitPrice: 0,
          discount: 0,
          notes: '',
        },
      ],
    }));
  };

  const removeItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
    calculateTotals();
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unitPrice * (1 - item.discount / 100);
      return sum + itemTotal;
    }, 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;
    setFormData((prev) => ({
      ...prev,
      subtotal,
      tax,
      total,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formattedData = {
        ...formData,
        contract: formData.contract._id,
        items: formData.items.map((item) => ({
          product: item.product._id,
          description: item.description,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          discount: Number(item.discount),
          notes: item.notes,
        })),
      };
      await onSubmit(formattedData);
      enqueueSnackbar('Invoice saved successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Error saving invoice', {
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>Basic Information</Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Invoice Number"
            value={formData.invoiceNumber}
            onChange={handleInputChange('invoiceNumber')}
            required
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Autocomplete
            options={contracts}
            getOptionLabel={(option) => {
              if (!option || typeof option !== 'object') return '';
              const clientName = option.client?.name || '';
              const title = option.title || '';
              return `${title} - ${clientName}`;
            }}
            isOptionEqualToValue={(option, value) => option._id === value._id}
            value={formData.contract}
            onChange={handleContractChange}
            renderInput={(params) => (
              <TextField {...params} label="Contract" required />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <DatePicker
            label="Issue Date"
            value={formData.issueDate}
            onChange={handleDateChange('issueDate')}
            renderInput={(params) => <TextField {...params} fullWidth required />}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <DatePicker
            label="Due Date"
            value={formData.dueDate}
            onChange={handleDateChange('dueDate')}
            renderInput={(params) => <TextField {...params} fullWidth required />}
          />
        </Grid>

        {/* Items */}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Items</Typography>
            <Button startIcon={<AddIcon />} onClick={addItem} variant="outlined" size="small">
              Add Item
            </Button>
          </Box>
          <Divider sx={{ my: 2 }} />
        </Grid>

        {formData.items.map((item, index) => (
          <Grid item xs={12} key={index}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Description"
                  value={item.description}
                  onChange={handleItemChange(index, 'description')}
                  required
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  type="number"
                  label="Quantity"
                  value={item.quantity}
                  onChange={handleItemChange(index, 'quantity')}
                  required
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  type="number"
                  label="Unit Price"
                  value={item.unitPrice}
                  onChange={handleItemChange(index, 'unitPrice')}
                  required
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  type="number"
                  label="Discount %"
                  value={item.discount}
                  onChange={handleItemChange(index, 'discount')}
                  inputProps={{ min: 0, max: 100, step: 1 }}
                />
              </Grid>
              <Grid item xs={12} md={1}>
                <IconButton
                  color="error"
                  onClick={() => removeItem(index)}
                  disabled={formData.items.length === 1}
                >
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          </Grid>
        ))}

        {/* Totals */}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="flex-end" mt={2}>
            <Grid container spacing={2} xs={12} md={6}>
              <Grid item xs={6}><Typography>Subtotal:</Typography></Grid>
              <Grid item xs={6}><Typography align="right">${formData.subtotal.toFixed(2)}</Typography></Grid>
              <Grid item xs={6}><Typography>Tax (10%):</Typography></Grid>
              <Grid item xs={6}><Typography align="right">${formData.tax.toFixed(2)}</Typography></Grid>
              <Grid item xs={6}><Typography variant="h6">Total:</Typography></Grid>
              <Grid item xs={6}><Typography variant="h6" align="right">${formData.total.toFixed(2)}</Typography></Grid>
            </Grid>
          </Box>
        </Grid>

        {/* Payment Info */}
        <Grid item xs={12}><Typography variant="h6" gutterBottom>Payment Information</Typography></Grid>

        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.isPaid}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isPaid: e.target.checked,
                    status: e.target.checked ? 'paid' : 'pending',
                  }))
                }
              />
            }
            label="Mark as Paid"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Payment Mode"
            value={formData.paymentMode}
            onChange={handleInputChange('paymentMode')}
            select
            required
          >
            <MenuItem value="upi">UPI</MenuItem>
            <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
            <MenuItem value="credit_card">Credit Card</MenuItem>
            <MenuItem value="cash">Cash</MenuItem>
            <MenuItem value="check">Check</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </TextField>
        </Grid>

        {formData.isPaid && (
          <>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Payment Date"
                value={formData.paymentDate}
                onChange={handleDateChange('paymentDate')}
                renderInput={(params) => <TextField {...params} fullWidth required />}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Payment Method"
                value={formData.paymentMethod}
                onChange={handleInputChange('paymentMethod')}
                placeholder="e.g., UPI ID, Bank Account, Card Number"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Payment Reference"
                value={formData.paymentReference}
                onChange={handleInputChange('paymentReference')}
                placeholder="Transaction ID, Check Number, etc."
              />
            </Grid>
          </>
        )}

        {/* Additional Info */}
        <Grid item xs={12}><Typography variant="h6" gutterBottom>Additional Information</Typography></Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Notes"
            value={formData.notes}
            onChange={handleInputChange('notes')}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Terms and Conditions"
            value={formData.terms}
            onChange={handleInputChange('terms')}
          />
        </Grid>

        {/* Action Buttons */}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button onClick={onCancel} disabled={loading}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Invoice'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  );
};

export default InvoiceForm;
