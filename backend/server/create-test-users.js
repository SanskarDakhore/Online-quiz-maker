import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const testUsers = [
  { name: 'Admin User', email: 'admin@test.com', password: 'Admin123!', role: 'teacher' },
  { name: 'Test Student', email: 'student@test.com', password: 'Student123!', role: 'student' }
];

async function createTestUsers() {
  try {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not configured');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB successfully.');

    for (const userData of testUsers) {
      try {
        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) {
          console.log(`User ${userData.email} already exists.`);
          continue;
        }

        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const uid = uuidv4();
        const user = new User({
          uid,
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          role: userData.role,
          badges: userData.role === 'student' ? ['Quiz Rookie'] : []
        });

        await user.save();
        console.log(`${userData.role} user created successfully with uid ${uid}.`);
      } catch (error) {
        console.error(`Error creating ${userData.role}:`, error.message);
      }
    }

    await mongoose.connection.close();
    console.log('Disconnected from MongoDB.');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
}

createTestUsers();
