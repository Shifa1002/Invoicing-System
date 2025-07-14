import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button
} from '@mui/material';

const CreateProductForm = ({ open, onClose, onSave, initialData }) => {
  const [form, setForm] = useState({ name: '', description: '', price: '', quantity: '' });

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    } else {
      setForm({ name: '', description: '', price: '', quantity: '' });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    const { name, price, quantity } = form;
    if (!name || !price || !quantity) return;
    onSave(form);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{initialData ? 'Edit Product' : 'Add Product'}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus name="name" label="Name" fullWidth margin="dense" value={form.name}
          onChange={handleChange}
        />
        <TextField
          name="description" label="Description" fullWidth margin="dense" value={form.description}
          onChange={handleChange}
        />
        <TextField
          name="price" label="Price" type="number" fullWidth margin="dense" value={form.price}
          onChange={handleChange}
        />
        <TextField
          name="quantity" label="Quantity" type="number" fullWidth margin="dense" value={form.quantity}
          onChange={handleChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel1</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateProductForm;
