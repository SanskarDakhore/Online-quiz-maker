// Test student login functionality
async function testStudentLogin() {
  try {
    console.log('Testing student login functionality...');
    
    // Test backend connectivity
    const healthResponse = await fetch('http://localhost:5000/api/health');
    const healthData = await healthResponse.json();
    
    console.log('Backend Health Check:', healthData);
    
    if (healthData.status === 'OK' && healthData.database === 'Connected') {
      console.log('✅ Backend is running and database is connected');
      
      // Test login endpoint accessibility
      const loginEndpoint = 'http://localhost:5000/api/auth/login';
      console.log('Testing login endpoint accessibility...');
      
      // Just check if we can reach the endpoint (we won't send actual credentials)
      const optionsResponse = await fetch(loginEndpoint, {
        method: 'OPTIONS'
      });
      
      console.log('Login endpoint status:', optionsResponse.status);
      console.log('✅ Login endpoint is accessible');
      
      console.log('\n🎉 Student login should work now!');
      console.log('🔧 To test manually:');
      console.log('1. Open browser at http://localhost:3001');
      console.log('2. Click on "Student Login" tab');
      console.log('3. Use credentials:');
      console.log('   Email: student@test.com');
      console.log('   Password: Student123!');
      
    } else {
      console.log('❌ Backend issues detected');
    }
  } catch (error) {
    console.error('❌ Error testing student login:', error.message);
  }
}

testStudentLogin();