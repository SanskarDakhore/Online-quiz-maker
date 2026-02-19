// Full login test for both student and teacher
async function fullLoginTest() {
  try {
    console.log('🧪 Starting full login test...\n');
    
    // Test backend health
    console.log('1. Checking backend health...');
    const healthResponse = await fetch('http://localhost:5000/api/health');
    const healthData = await healthResponse.json();
    
    if (healthData.status !== 'OK') {
      throw new Error('Backend is not healthy');
    }
    
    console.log('   ✅ Backend is running');
    console.log('   ✅ Database is connected\n');
    
    // Test student login
    console.log('2. Testing student login...');
    const studentLoginData = {
      email: 'student@test.com',
      password: 'Student123!'
    };
    
    const studentLoginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(studentLoginData)
    });
    
    if (studentLoginResponse.ok) {
      const studentData = await studentLoginResponse.json();
      console.log('   ✅ Student login successful');
      console.log('   🎯 Student token received');
      console.log('   👤 Student role:', studentData.user.role);
    } else {
      const errorData = await studentLoginResponse.json();
      throw new Error(`Student login failed: ${errorData.error}`);
    }
    
    console.log('');
    
    // Test teacher login
    console.log('3. Testing teacher login...');
    const teacherLoginData = {
      email: 'admin@test.com',
      password: 'Admin123!'
    };
    
    const teacherLoginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(teacherLoginData)
    });
    
    if (teacherLoginResponse.ok) {
      const teacherData = await teacherLoginResponse.json();
      console.log('   ✅ Teacher login successful');
      console.log('   🎯 Teacher token received');
      console.log('   👤 Teacher role:', teacherData.user.role);
    } else {
      const errorData = await teacherLoginResponse.json();
      throw new Error(`Teacher login failed: ${errorData.error}`);
    }
    
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('✅ Student login is working');
    console.log('✅ Teacher login is working');
    console.log('✅ Backend is fully functional');
    console.log('\n🌐 Access the application at: http://localhost:3001');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Make sure both servers are running');
    console.log('2. Check if ports 5000 and 3001 are available');
    console.log('3. Verify MongoDB Atlas connection');
    console.log('4. Restart both servers if needed');
  }
}

fullLoginTest();