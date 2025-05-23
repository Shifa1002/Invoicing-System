import mongoose from 'mongoose';

const InvoiceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  items: [{ description: String, quantity: Number, price: Number }],
  totalAmount: Number,
  dueDate: Date,
  status: { type: String, enum: ['Draft', 'Sent', 'Paid'], default: 'Draft' },
});

const Invoice = mongoose.model('Invoice', InvoiceSchema);

export default Invoice;
