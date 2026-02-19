import sequelize from './config/db.js';
import User from './models/User.js';
import Quiz from './models/Quiz.js';
import Result from './models/Result.js';

// Sync all models to the database
const setupDatabase = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Sync models (create tables if they don't exist)
    await sequelize.sync({ alter: true });
    console.log('Database synced successfully.');
    
    console.log('Database setup completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
};

setupDatabase();