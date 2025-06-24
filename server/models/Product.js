import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxLength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxLength: [500, 'Description cannot exceed 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: {
      values: ['piece', 'hour', 'day', 'month', 'kg', 'meter'],
      message: 'Invalid unit type'
    }
  },
  sku: {
    type: String,
    unique: true,
    trim: true,
    sparse: true
  },
  category: {
    type: String,
    trim: true
  },
  taxRate: {
    type: Number,
    default: 0,
    min: [0, 'Tax rate cannot be negative'],
    max: [100, 'Tax rate cannot exceed 100%']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for faster searches
productSchema.index({ name: 'text', description: 'text', sku: 'text' });

// Virtual for formatted price
productSchema.virtual('formattedPrice').get(function() {
  return `$${this.price.toFixed(2)}`;
});

// Method to get product details for invoice
productSchema.methods.getInvoiceDetails = function() {
  return {
    id: this._id,
    name: this.name,
    description: this.description,
    price: this.price,
    unit: this.unit,
    taxRate: this.taxRate,
    sku: this.sku
  };
};

const Product = mongoose.model('Product', productSchema);

export default Product; 