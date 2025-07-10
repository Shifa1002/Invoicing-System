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

const ClientForm = ({ client, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA'
    },
    company: {
      name: '',
      taxId: '',
      website: ''
    },
    billingInfo: {
      paymentTerms: 'net30',
      currency: 'USD',
      taxExempt: false,
      taxId: ''
    },
    notes: '',
    isActive: true
  });

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        address: {
          street: client.address?.street || '',
          city: client.address?.city || '',
          state: client.address?.state || '',
          zipCode: client.address?.zipCode || '',
          country: client.address?.country || 'USA'
        },
        company: {
          name: client.company?.name || '',
          taxId: client.company?.taxId || '',
          website: client.company?.website || ''
        },
        billingInfo: {
          paymentTerms: client.billingInfo?.paymentTerms || 'net30',
          currency: client.billingInfo?.currency || 'USD',
          taxExempt: client.billingInfo?.taxExempt || false,
          taxId: client.billingInfo?.taxId || ''
        },
        notes: client.notes || '',
        isActive: client.isActive ?? true
      });
    }
  }, [client]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
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
            label="Client Name"
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
            required
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)}
            helperText={
              !formData.email 
                ? 'Email is required' 
                : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
                  ? 'Invalid email format'
                  : ''
            }
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            error={formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)}
            helperText={
              formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)
                ? 'Invalid phone format'
                : ''
            }
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            Company Information
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Company Name"
            name="company.name"
            value={formData.company.name}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Tax ID"
            name="company.taxId"
            value={formData.company.taxId}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Website"
            name="company.website"
            value={formData.company.website}
            onChange={handleChange}
            error={formData.company.website && !/^https?:\/\/.+/.test(formData.company.website)}
            helperText={
              formData.company.website && !/^https?:\/\/.+/.test(formData.company.website)
                ? 'Invalid website URL'
                : ''
            }
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            Address
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Street Address"
            name="address.street"
            value={formData.address.street}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="City"
            name="address.city"
            value={formData.address.city}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="State/Province"
            name="address.state"
            value={formData.address.state}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="ZIP/Postal Code"
            name="address.zipCode"
            value={formData.address.zipCode}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Country"
            name="address.country"
            value={formData.address.country}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            Billing Information
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            select
            fullWidth
            label="Payment Terms"
            name="billingInfo.paymentTerms"
            value={formData.billingInfo.paymentTerms}
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
            name="billingInfo.currency"
            value={formData.billingInfo.currency}
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
          <FormControlLabel
            control={
              <Switch
                checked={formData.billingInfo.taxExempt}
                onChange={handleChange}
                name="billingInfo.taxExempt"
                color="primary"
              />
            }
            label="Tax Exempt"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Tax ID (if different from company)"
            name="billingInfo.taxId"
            value={formData.billingInfo.taxId}
            onChange={handleChange}
            disabled={formData.billingInfo.taxExempt}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            multiline
            rows={3}
          />
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
              disabled={!formData.name || !formData.email}
            >
              {client ? 'Update Client' : 'Create Client'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  );
};

export default ClientForm; 