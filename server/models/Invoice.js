import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema(
  {
    contract: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contract',
      required: true,
    },
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
    totalAmount: {
      type: Number,
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
      default: 'draft',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    invoiceNumber: {
      type: String,
      unique: true,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    // Payment related fields
    paymentMode: {
      type: String,
      enum: ['upi', 'bank_transfer', 'credit_card', 'cash', 'check', 'other'],
    },
    paymentDate: {
      type: Date,
    },
    paymentMethod: {
      type: String,
    },
    paymentReference: {
      type: String,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
    },
    terms: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Generate invoice number before saving
invoiceSchema.pre('save', async function(next) {
  if (!this.invoiceNumber) {
    const count = await mongoose.model('Invoice').countDocuments();
    this.invoiceNumber = `INV-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Virtual for formatted total
invoiceSchema.virtual('formattedTotal').get(function() {
  return `$${this.totalAmount?.toFixed(2) || '0.00'}`;
});

// Virtual for payment status
invoiceSchema.virtual('paymentStatus').get(function() {
  if (this.isPaid) return 'Paid';
  if (this.dueDate && new Date() > new Date(this.dueDate)) return 'Overdue';
  return 'Pending';
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

export default Invoice;
