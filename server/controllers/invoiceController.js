import Invoice from '../models/Invoice.js'

exports.createInvoice = async (req, res) => {
  const { client, items, dueDate } = req.body;
  try {
    const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const invoice = new Invoice({ user: req.user.id, client, items, totalAmount, dueDate });
    await invoice.save();
    res.json(invoice);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ user: req.user.id }).populate('client');
    res.json(invoices);
  } catch (err) {
    res.status(500).send('Server error');
  }
};


