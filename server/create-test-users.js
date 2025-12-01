// Script to create test admin and student users in MongoDB
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quizmaster';

// Import User model
import User from './models/User.js';

// Test user credentials
const testUsers = [
  {
    name: "Admin User",
    email: "admin@test.com",
    password: "Admin123!",
    role: "teacher"
  },
  {
    name: "Test Student",
    email: "student@test.com",
    password: "Student123!",
    role: "student"
  }
];

async function createTestUsers() {
  try {
    // Connect to MongoDB
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB successfully!");

    for (const userData of testUsers) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) {
          console.log(`User ${userData.email} already exists.`);
          console.log(`Login credentials for ${userData.role}:`);
          console.log(`Email: ${userData.email}`);
          console.log(`Password: ${userData.password}`);
          console.log("---");
          continue;
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

        // Create user
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
        
        console.log(`${userData.role.charAt(0).toUpperCase() + userData.role.slice(1)} user created successfully!`);
        console.log(`UID: ${uid}`);
        console.log(`Login credentials for ${userData.role}:`);
        console.log(`Email: ${userData.email}`);
        console.log(`Password: ${userData.password}`);
        console.log("---");
      } catch (error) {
        console.error(`Error creating ${userData.role}:`, error.message);
      }
    }

    // Close connection
    await mongoose.connection.close();
    console.log("Disconnected from MongoDB.");
    
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
}

createTestUsers();