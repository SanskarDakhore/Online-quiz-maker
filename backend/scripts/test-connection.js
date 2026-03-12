const API_BASE_URL = process.env.API_BASE_URL;

async function testConnection() {
  try {
    if (!API_BASE_URL) {
      throw new Error('API_BASE_URL is not configured');
    }

    console.log('Testing connection to backend server...');

    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();

    console.log('Connection successful.');
    console.log('Response:', data);
  } catch (error) {
    console.error('Connection failed:', error.message);
  }
}

testConnection();
