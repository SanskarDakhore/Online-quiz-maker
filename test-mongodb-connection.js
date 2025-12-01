// Test MongoDB connection script
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quizmaster';

console.log('Testing MongoDB connection...');
console.log('Using URI:', MONGODB_URI);

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    
    const conn = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
    
    // Test basic operations
    console.log('Testing database operations...');
    
    // Close connection
    await mongoose.connection.close();
    console.log('✅ Connection test completed successfully');
    
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.error('\nCommon causes:');
    console.error('1. IP address not whitelisted in MongoDB Atlas');
    console.error('2. Incorrect username or password');
    console.error('3. Network connectivity issues');
    console.error('4. MongoDB Atlas cluster is paused or unavailable');
    
    process.exit(1);
  }
};

connectDB();