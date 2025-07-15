import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      default: 'General',
    },
  },
  {
    timestamps: true, // createdAt and updatedAt
  }
);

const Product = mongoose.model('Product', productSchema);

export default Product;
