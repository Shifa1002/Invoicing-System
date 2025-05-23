import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
  amountPaid: Number,
  method: String,
  paymentDate: Date,
});

module.exports = mongoose.model('Payment', PaymentSchema);
