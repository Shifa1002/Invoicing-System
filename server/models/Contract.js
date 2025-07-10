import mongoose from 'mongoose';

const contractSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        unitPrice: {
          type: Number,
          required: true,
        },
        discount: {
          type: Number,
          default: 0,
        },
        notes: {
          type: String,
        },
      },
    ],
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'completed', 'cancelled'],
      default: 'draft',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    terms: {
      type: String,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    subtotal: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    paymentTerms: {
      type: String,
      enum: ['immediate', 'net15', 'net30', 'net60'],
      default: 'net30',
    },
    currency: {
      type: String,
      default: 'USD',
    },
    billingCycle: {
      type: String,
      enum: ['one-time', 'monthly', 'quarterly', 'annually'],
      default: 'one-time',
    },
    autoRenew: {
      type: Boolean,
      default: false,
    },
    renewalTerm: {
      type: Number,
      default: 12, // months
    },
    notes: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Generate contract number before saving
contractSchema.pre('save', async function(next) {
  if (!this.contractNumber) {
    const count = await mongoose.model('Contract').countDocuments();
    this.contractNumber = `CON-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Virtual for formatted total
contractSchema.virtual('formattedTotal').get(function() {
  return `$${this.totalAmount?.toFixed(2) || '0.00'}`;
});

// Virtual for contract status
contractSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    draft: 'Draft',
    active: 'Active',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };
  return statusMap[this.status] || this.status;
});

const Contract = mongoose.model('Contract', contractSchema);

export default Contract;
