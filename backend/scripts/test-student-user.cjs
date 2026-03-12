const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not configured');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    const User = require('./server/models/User.js');

    const studentUser = await User.findOne({ email: 'student@test.com' });
    if (studentUser) {
      console.log('Student user found:', studentUser.email);
    } else {
      console.log('Student user not found');
    }

    const adminUser = await User.findOne({ email: 'admin@test.com' });
    if (adminUser) {
      console.log('Admin user found:', adminUser.email);
    } else {
      console.log('Admin user not found');
    }

    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error.message);
  }
};

connectDB();
