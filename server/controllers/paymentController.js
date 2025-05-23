import Payment from '../models/Payment.js';
const Invoice = require('../models/Invoice');

exports.addPayment = async (req, res) => {
  const { invoiceId } = req.params;
  const { amountPaid, method, paymentDate } = req.body;
  try {
    const payment = new Payment({ invoice: invoiceId, amountPaid, method, paymentDate });
    await payment.save();

    // Update invoice status if totalAmount is paid
    const payments = await Payment.find({ invoice: invoiceId });
    const totalPaid = payments.reduce((sum, p) => sum + p.amountPaid, 0);
    const invoice = await Invoice.findById(invoiceId);
    if (totalPaid >= invoice.totalAmount) {
      invoice.status = 'Paid';
      await invoice.save();
    }

    res.json(payment);
  } catch (err) {
    res.status(500).send('Server error');
  }
};
