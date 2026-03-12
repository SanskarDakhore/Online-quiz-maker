const API_BASE_URL = process.env.API_BASE_URL;
const APP_URL = process.env.APP_URL;

async function fullLoginTest() {
  try {
    if (!API_BASE_URL) {
      throw new Error('API_BASE_URL is not configured');
    }

    console.log('Starting full login test...\n');

    console.log('1. Checking backend health...');
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    const healthData = await healthResponse.json();

    if (healthData.status !== 'OK') {
      throw new Error('Backend is not healthy');
    }

    console.log('   Backend is running');
    console.log(`   Database status: ${healthData.database}\n`);

    console.log('2. Testing student login...');
    const studentLoginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'student@test.com',
        password: 'Student123!'
      })
    });

    if (!studentLoginResponse.ok) {
      const errorData = await studentLoginResponse.json();
      throw new Error(`Student login failed: ${errorData.error}`);
    }

    const studentData = await studentLoginResponse.json();
    console.log('   Student login successful');
    console.log(`   Student role: ${studentData.user.role}`);
    console.log('');

    console.log('3. Testing teacher login...');
    const teacherLoginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@test.com',
        password: 'Admin123!'
      })
    });

    if (!teacherLoginResponse.ok) {
      const errorData = await teacherLoginResponse.json();
      throw new Error(`Teacher login failed: ${errorData.error}`);
    }

    const teacherData = await teacherLoginResponse.json();
    console.log('   Teacher login successful');
    console.log(`   Teacher role: ${teacherData.user.role}`);

    console.log('\nAll tests passed.');
    if (APP_URL) {
      console.log(`App URL: ${APP_URL}`);
    }
  } catch (error) {
    console.error('Test failed:', error.message);
    console.log('\nTroubleshooting steps:');
    console.log('1. Make sure the backend is running.');
    console.log('2. Check the app and API URLs configured in your .env files.');
    console.log('3. Verify database connectivity.');
  }
}

fullLoginTest();
