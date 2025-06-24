import mongoose from 'mongoose';

const contractSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Contract title is required'],
    trim: true,
    maxLength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Client is required']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(endDate) {
        return endDate > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  status: {
    type: String,
    enum: {
      values: ['draft', 'active', 'completed', 'cancelled'],
      message: 'Invalid status'
    },
    default: 'draft'
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product is required']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0.01, 'Quantity must be greater than 0']
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: [0, 'Unit price cannot be negative']
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
      max: [100, 'Discount cannot exceed 100%']
    },
    notes: {
      type: String,
      trim: true,
      maxLength: [500, 'Notes cannot exceed 500 characters']
    }
  }],
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  terms: {
    paymentTerms: {
      type: String,
      enum: ['immediate', 'net15', 'net30', 'net60'],
      default: 'net30'
    },
    currency: {
      type: String,
      default: 'USD'
    },
    billingCycle: {
      type: String,
      enum: ['one-time', 'monthly', 'quarterly', 'annually'],
      default: 'one-time'
    },
    autoRenew: {
      type: Boolean,
      default: false
    },
    renewalTerm: {
      type: Number,
      min: [1, 'Renewal term must be at least 1 month'],
      default: 12
    }
  },
  notes: {
    type: String,
    trim: true,
    maxLength: [1000, 'Notes cannot exceed 1000 characters']
  },
  attachments: [{
    name: String,
    url: String,
    type: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by is required']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add indexes for better query performance
contractSchema.index({ title: 1 });
contractSchema.index({ client: 1 });
contractSchema.index({ status: 1 });
contractSchema.index({ startDate: 1 });
contractSchema.index({ endDate: 1 });
contractSchema.index({ createdBy: 1 });

// Virtual for total amount
contractSchema.virtual("computedTotalAmount").get(function () {
  return this.products.reduce((acc, p) => acc + p.price, 0);
});


// Virtual for formatted total
contractSchema.virtual('formattedTotal').get(function() {
  return `$${this.totalAmount.toFixed(2)}`;
});

// Method to get contract details for invoice
contractSchema.methods.getInvoiceDetails = async function() {
  await this.populate('client', 'name email phone address company billingInfo');
  await this.populate('items.product', 'name description price unit taxRate sku');

  return {
    id: this._id,
    title: this.title,
    client: this.client.getInvoiceDetails(),
    startDate: this.startDate,
    endDate: this.endDate,
    items: this.items.map(item => ({
      product: item.product.getInvoiceDetails(),
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discount: item.discount,
      notes: item.notes,
      total: (item.quantity * item.unitPrice) * (1 - item.discount / 100)
    })),
    terms: this.terms,
    totalAmount: this.totalAmount,
    status: this.status
  };
};

const Contract = mongoose.model('Contract', contractSchema);

// Debug: Log the schema structure
console.log('Contract schema fields:', Object.keys(contractSchema.paths));
console.log('Contract schema terms field type:', contractSchema.paths.terms?.instance);

export default Contract; 