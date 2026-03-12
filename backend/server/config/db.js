import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error('MONGODB_URI is not configured');
    }

    console.log('Attempting to connect to MongoDB...');

    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.error('Common causes:');
    console.error('1. MONGODB_URI is missing or invalid');
    console.error('2. Database network access is blocked');
    console.error('3. Database credentials are invalid');
    console.error('4. The database service is unavailable');
    
    // Instead of exiting, we'll continue but with limited functionality
    console.log('Server will start but without database connectivity');
  }
};

export default connectDB;
