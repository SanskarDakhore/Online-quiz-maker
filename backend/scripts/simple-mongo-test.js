// Simple MongoDB connection test helper
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('MONGODB_URI is not set. Add it to backend/server/.env before running this script.');
  process.exit(1);
}

console.log('MongoDB connection string loaded from environment.');
console.log('Length:', uri.length);
console.log('\nNext steps:');
console.log('1. Verify the database is accepting connections.');
console.log('2. Confirm network access and credentials if the app cannot connect.');
console.log('3. Use this same environment variable in local and deployment environments.');
