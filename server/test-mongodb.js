import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
  try {
    // Try to connect to MongoDB
    console.log('Attempting to connect to MongoDB...');
    console.log('Using connection string:', process.env.MONGODB_URI || 'mongodb://localhost:27017/quizmaster');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quizmaster', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('MongoDB Connected Successfully!');
    
    // Test creating a simple document
    const testSchema = new mongoose.Schema({
      name: String,
      timestamp: { type: Date, default: Date.now }
    });
    
    const TestModel = mongoose.model('Test', testSchema);
    
    // Create a test document
    const testDoc = new TestModel({ name: 'Connection Test' });
    await testDoc.save();
    console.log('Test document created successfully!');
    
    // Clean up - delete the test document
    await TestModel.deleteOne({ _id: testDoc._id });
    console.log('Test document cleaned up.');
    
    // Close the connection
    await mongoose.connection.close();
    console.log('Connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    if (error.reason) {
      console.error('Reason:', error.reason);
    }
    process.exit(1);
  }
};

testConnection();