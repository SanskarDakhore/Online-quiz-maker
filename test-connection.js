// Simple test script to verify backend connection
async function testConnection() {
  try {
    console.log('Testing connection to backend server...');
    
    const response = await fetch('http://localhost:5000/api/health');
    const data = await response.json();
    
    console.log('Connection successful!');
    console.log('Response:', data);
    
    if (data.status === 'OK') {
      console.log('✅ Backend server is running and healthy');
      console.log('📊 Database status:', data.database);
    } else {
      console.log('❌ Backend server returned unexpected status');
    }
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testConnection();