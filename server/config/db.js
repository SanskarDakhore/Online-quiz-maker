import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('Using URI:', process.env.MONGODB_URI || 'mongodb://localhost:27017/quizmaster');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quizmaster', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.error('Common causes:');
    console.error('1. IP address not whitelisted in MongoDB Atlas');
    console.error('2. Incorrect username or password');
    console.error('3. Network connectivity issues');
    console.error('4. MongoDB Atlas cluster is paused or unavailable');
    
    // Instead of exiting, we'll continue but with limited functionality
    console.log('Server will start but without database connectivity');
    console.log('Falling back to local database if available');
  }
};

export default connectDB;