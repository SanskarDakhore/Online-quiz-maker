// Vercel API route for health check
import mongoose from 'mongoose';
import { connectToDatabase } from '../server/utils/connectDb.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Attempt to connect to the database
    await connectToDatabase();
    
    // Check database connection status
    const dbConnected = mongoose && mongoose.connection && mongoose.connection.readyState === 1;
    
    res.status(200).json({ 
      status: 'OK', 
      message: 'QuizMaster API is running',
      database: dbConnected ? 'Connected' : 'Disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Health check failed',
      database: 'Disconnected',
      error: error.message 
    });
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
};
