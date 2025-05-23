import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setProducts(response.data);
    } catch (err) {
      setError('Failed to fetch products');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/products/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      } else {
        await axios.post('http://localhost:5000/api/products', formData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      }
      setFormData({ name: '', description: '', price: '', stock: '' });
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      setError('Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock
    });
    setEditingId(product._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`http://localhost:5000/api/products/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        fetchProducts();
      } catch (err) {
        setError('Failed to delete product');
      }
    }
  };

  return (
    <div className="products-container">
      <div className="products-header">
        <h2>Product Management</h2>
        <p className="subtitle">Manage your product inventory</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="products-content">
        <div className="product-form-container">
          <h3>{editingId ? 'Edit Product' : 'Add New Product'}</h3>
          <form onSubmit={handleSubmit} className="product-form">
            <div className="form-group">
              <label htmlFor="name">Product Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter product name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Enter product description"
              />
            </div>

            <div className="form-group">
              <label htmlFor="price">Price</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                placeholder="Enter price"
              />
            </div>

            <div className="form-group">
              <label htmlFor="stock">Stock</label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                required
                min="0"
                placeholder="Enter stock quantity"
              />
            </div>

            <button type="submit" className="submit-button">
              {editingId ? 'Update Product' : 'Add Product'}
            </button>
            {editingId && (
              <button
                type="button"
                className="cancel-button"
                onClick={() => {
                  setEditingId(null);
                  setFormData({ name: '', description: '', price: '', stock: '' });
                }}
              >
                Cancel
              </button>
            )}
          </form>
        </div>

        <div className="products-list">
          <h3>Product List</h3>
          <div className="products-grid">
            {products.map((product) => (
              <div key={product._id} className="product-card">
                <h4>{product.name}</h4>
                <p className="description">{product.description}</p>
                <div className="product-details">
                  <span className="price">${product.price}</span>
                  <span className="stock">Stock: {product.stock}</span>
                </div>
                <div className="product-actions">
                  <button
                    className="edit-button"
                    onClick={() => handleEdit(product)}
                  >
                    Edit
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(product._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products; 