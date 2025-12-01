// Test script to verify student user exists in database
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to database
const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quizmaster', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Import User model after connection
    const User = require('./server/models/User.js');
    
    // Find student user
    const studentUser = await User.findOne({ email: 'student@test.com' });
    if (studentUser) {
      console.log('Student user found:');
      console.log('- Email:', studentUser.email);
      console.log('- Name:', studentUser.name);
      console.log('- Role:', studentUser.role);
      console.log('- UID:', studentUser.uid);
    } else {
      console.log('Student user not found');
    }
    
    // Find admin user
    const adminUser = await User.findOne({ email: 'admin@test.com' });
    if (adminUser) {
      console.log('\nAdmin user found:');
      console.log('- Email:', adminUser.email);
      console.log('- Name:', adminUser.name);
      console.log('- Role:', adminUser.role);
      console.log('- UID:', adminUser.uid);
    } else {
      console.log('Admin user not found');
    }
    
    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error.message);
  }
};

connectDB();