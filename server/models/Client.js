// server/models/Client.js
import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: String,
  phone: String,
  address: String,
  company: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Client = mongoose.model('Client', clientSchema);

export default Client; 
