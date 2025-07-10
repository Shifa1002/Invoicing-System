import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Print as PrintIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import { format } from 'date-fns';

const InvoicePreview = ({ invoice, onClose }) => {
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();

  const handleDownload = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/invoices/${invoice._id}/pdf`, {
        responseType: 'blob',
      });

      // Create a blob from the PDF data
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      enqueueSnackbar('Invoice downloaded successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Error downloading invoice', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/invoices/${invoice._id}/pdf`, {
        responseType: 'blob',
      });

      // Create a blob from the PDF data
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      // Open PDF in new window for printing
      const printWindow = window.open(url, '_blank');
      printWindow.onload = () => {
        printWindow.print();
      };

      enqueueSnackbar('Invoice opened for printing', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Error preparing invoice for print', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEmail = async () => {
    setLoading(true);
    try {
      await axios.post(`/api/invoices/${invoice._id}/send-email`);
      enqueueSnackbar('Invoice sent successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Error sending invoice', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!invoice) return null;

  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        maxWidth: 800,
        mx: 'auto',
        my: 4,
        position: 'relative',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" gutterBottom>
            INVOICE
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Invoice #{invoice.invoiceNumber}
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="h6" color="primary">
            {invoice.status.toUpperCase()}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Issue Date: {format(new Date(invoice.issueDate), 'MMM dd, yyyy')}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Due Date: {format(new Date(invoice.dueDate), 'MMM dd, yyyy')}
          </Typography>
        </Box>
      </Box>

      {/* Client Information */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" gutterBottom>
            Bill To:
          </Typography>
          <Typography variant="body1">
            {invoice.contract.client.name}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {invoice.contract.client.company?.name}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {invoice.contract.client.address.street}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {`${invoice.contract.client.address.city}, ${invoice.contract.client.address.state} ${invoice.contract.client.address.zipCode}`}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {invoice.contract.client.address.country}
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" gutterBottom>
            From:
          </Typography>
          <Typography variant="body1">Your Company Name</Typography>
          <Typography variant="body2" color="textSecondary">
            Your Company Address
          </Typography>
          <Typography variant="body2" color="textSecondary">
            City, State ZIP
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Country
          </Typography>
        </Grid>
      </Grid>

      {/* Items Table */}
      <Box sx={{ mb: 4 }}>
        <Grid
          container
          sx={{
            py: 2,
            px: 2,
            bgcolor: theme.palette.grey[100],
            borderRadius: 1,
          }}
        >
          <Grid item xs={4}>
            <Typography variant="subtitle2">Description</Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography variant="subtitle2" align="right">
              Quantity
            </Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography variant="subtitle2" align="right">
              Unit Price
            </Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography variant="subtitle2" align="right">
              Discount
            </Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography variant="subtitle2" align="right">
              Amount
            </Typography>
          </Grid>
        </Grid>

        {invoice.items.map((item, index) => (
          <Grid
            key={index}
            container
            sx={{
              py: 2,
              px: 2,
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Grid item xs={4}>
              <Typography variant="body2">{item.description}</Typography>
              {item.notes && (
                <Typography variant="caption" color="textSecondary">
                  {item.notes}
                </Typography>
              )}
            </Grid>
            <Grid item xs={2}>
              <Typography variant="body2" align="right">
                {item.quantity}
              </Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography variant="body2" align="right">
                ${item.unitPrice.toFixed(2)}
              </Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography variant="body2" align="right">
                {item.discount}%
              </Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography variant="body2" align="right">
                $
                {(
                  item.quantity *
                  item.unitPrice *
                  (1 - item.discount / 100)
                ).toFixed(2)}
              </Typography>
            </Grid>
          </Grid>
        ))}
      </Box>

      {/* Totals */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
        <Grid container spacing={2} xs={12} md={6}>
          <Grid item xs={6}>
            <Typography>Subtotal:</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography align="right">
              ${invoice.subtotal.toFixed(2)}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>Tax (10%):</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography align="right">${invoice.tax.toFixed(2)}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="h6">Total:</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="h6" align="right">
              ${invoice.total.toFixed(2)}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Payment Information */}
      {invoice.isPaid && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            Payment Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="textSecondary">
                Payment Date
              </Typography>
              <Typography variant="body1">
                {format(new Date(invoice.paymentDate), 'MMM dd, yyyy')}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="textSecondary">
                Payment Method
              </Typography>
              <Typography variant="body1">
                {invoice.paymentMethod.replace('_', ' ').toUpperCase()}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="textSecondary">
                Reference
              </Typography>
              <Typography variant="body1">{invoice.paymentReference}</Typography>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Notes and Terms */}
      {(invoice.notes || invoice.terms) && (
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={4}>
            {invoice.notes && (
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Notes
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {invoice.notes}
                </Typography>
              </Grid>
            )}
            {invoice.terms && (
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Terms & Conditions
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {invoice.terms}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>
      )}

      {/* Action Buttons */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 2,
          mt: 4,
          pt: 2,
        }}
      >
        <Button
          variant="outlined"
          startIcon={<EmailIcon />}
          onClick={handleEmail}
          disabled={loading}
        >
          Send Email
        </Button>
        <Button
          variant="outlined"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
          disabled={loading}
        >
          Print
        </Button>
        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
          onClick={handleDownload}
          disabled={loading}
        >
          Download PDF
        </Button>
      </Box>
    </Paper>
  );
};

export default InvoicePreview; 