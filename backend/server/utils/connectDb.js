import mongoose from 'mongoose';

const globalForMongoose = global;

if (!globalForMongoose.mongoose) {
  globalForMongoose.mongoose = { conn: null, promise: null };
}

const MONGODB_URI = process.env.MONGODB_URI;

export const connectToDatabase = async () => {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured');
  }

  if (globalForMongoose.mongoose.conn) {
    return globalForMongoose.mongoose.conn;
  }

  if (!globalForMongoose.mongoose.promise) {
    const opts = {
      bufferCommands: false,
      bufferMaxEntries: 0,
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
