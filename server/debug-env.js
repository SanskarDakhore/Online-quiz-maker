import dotenv from 'dotenv';
dotenv.config();

console.log('Environment Variables:');
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('PORT:', process.env.PORT);

// Check if password is properly replaced
if (process.env.MONGODB_URI) {
  if (process.env.MONGODB_URI.includes('YOUR_ACTUAL_PASSWORD')) {
    console.log('⚠️  WARNING: Password placeholder still in connection string');
  } else {
    console.log('✅ Password appears to be properly set');
  }
}