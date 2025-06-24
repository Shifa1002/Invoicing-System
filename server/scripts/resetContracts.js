import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const resetContracts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Drop the contracts collection
    await mongoose.connection.db.dropCollection('contracts');
    console.log('Contracts collection dropped successfully');
    
    // Create the collection with the new schema
    await mongoose.connection.createCollection('contracts');
    console.log('Contracts collection recreated successfully');
    
    console.log('Contract schema reset completed');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting contracts:', error);
    process.exit(1);
  }
};

resetContracts(); 