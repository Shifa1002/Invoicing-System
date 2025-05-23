import mongoose from 'mongoose';

const ClientSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  email: String,
  phone: String,
  address: String,
});

module.exports = mongoose.model('Client', ClientSchema);
