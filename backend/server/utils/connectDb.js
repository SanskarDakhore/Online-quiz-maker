import mongoose from 'mongoose';

// Store the database connection in the global scope for serverless environments
// This helps reuse connections across function calls during the same serverless instance lifetime
const globalForMongoose = global;

if (!globalForMongoose.mongoose) {
  globalForMongoose.mongoose = { conn: null, promise: null };
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quizmaster';

export const connectToDatabase = async () => {
  if (globalForMongoose.mongoose.conn) {
    // If already connected, return the existing connection
    return globalForMongoose.mongoose.conn;
  }
  
  if (!globalForMongoose.mongoose.promise) {
    // If not connected and no connection is in progress, start a new connection
    const opts = {
      bufferCommands: false, // Disable mongoose buffering
      bufferMaxEntries: 0, // Disable mongoose buffering
    };
    
    globalForMongoose.mongoose.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        console.log('Connected to MongoDB in serverless environment');
        return mongooseInstance;
      })
      .catch((error) => {
        console.error('MongoDB connection error in serverless environment:', error);
        throw error;
      });
  }
  
  try {
    globalForMongoose.mongoose.conn = await globalForMongoose.mongoose.promise;
    return globalForMongoose.mongoose.conn;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
};