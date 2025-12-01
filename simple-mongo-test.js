// Simple MongoDB connection test
const uri = "mongodb+srv://romabanik4_db_user:8dQxZft95F8rUTQL@onlinequizmaking.aeenpfm.mongodb.net/quizmaster?retryWrites=true&w=majority";

console.log('MongoDB Connection String:');
console.log(uri);
console.log('\nTo test this connection:');

console.log('\n1. Visit MongoDB Atlas dashboard:');
console.log('   https://cloud.mongodb.com/');

console.log('\n2. Check Network Access settings:');
console.log('   - Make sure your current IP is whitelisted');
console.log('   - Or add 0.0.0.0/0 for development access');

console.log('\n3. Verify cluster status:');
console.log('   - Check if your cluster is paused');
console.log('   - Resume if needed');

console.log('\n4. Test with MongoDB Compass:');
console.log('   - Download from https://www.mongodb.com/try/download/compass');
console.log('   - Use the connection string above');

console.log('\n5. Alternative - Add your current IP to whitelist:');
console.log('   - Visit: https://cloud.mongodb.com/v2#/org/[ORG_ID]/access/ipWhitelist');
console.log('   - Click "Add IP Address"');
console.log('   - Select "Add Current IP Address"');