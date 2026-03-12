const API_BASE_URL = process.env.API_BASE_URL;
const APP_URL = process.env.APP_URL;

async function testStudentLogin() {
  try {
    if (!API_BASE_URL) {
      throw new Error('API_BASE_URL is not configured');
    }

    console.log('Testing student login functionality...');

    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    const healthData = await healthResponse.json();

    console.log('Backend Health Check:', healthData);

    if (healthData.status === 'OK' && healthData.database === 'Connected') {
      console.log('Backend is running and database is connected');

      const loginEndpoint = `${API_BASE_URL}/auth/login`;
      console.log('Testing login endpoint accessibility...');

      const optionsResponse = await fetch(loginEndpoint, {
        method: 'OPTIONS'
      });

      console.log('Login endpoint status:', optionsResponse.status);
      if (APP_URL) {
        console.log(`Open browser at ${APP_URL}`);
      }
    } else {
      console.log('Backend issues detected');
    }
  } catch (error) {
    console.error('Error testing student login:', error.message);
  }
}

testStudentLogin();
