import axios from 'axios';

const API_BASE_URL = process.env.API_BASE_URL;

console.log('Testing database activation functionality...\n');

async function testHealthCheck() {
  try {
    if (!API_BASE_URL) {
      throw new Error('API_BASE_URL is not configured');
    }

    console.log('1. Testing health check endpoint...');
    const response = await axios.get(`${API_BASE_URL}/health`);
    console.log('   Health check response:', response.data);
    console.log('   Database status:', response.data.database);
    return response.data;
  } catch (error) {
    console.log('   Health check failed:', error.message);
    return null;
  }
}

async function testDbActivation() {
  try {
    if (!API_BASE_URL) {
      throw new Error('API_BASE_URL is not configured');
    }

    console.log('\n2. Testing database activation endpoint...');
    const response = await axios.post(`${API_BASE_URL}/activate-db`);
    console.log('   Activation response:', response.data);
    return response.data;
  } catch (error) {
    console.log('   Activation failed:', error.message);
    return null;
  }
}

async function runTests() {
  console.log('Starting database activation tests...\n');

  const healthData = await testHealthCheck();
  const activationData = await testDbActivation();

  console.log('\n3. Testing health check after activation...');
  const postActivationHealth = await testHealthCheck();

  console.log('\nTest Summary:');
  console.log('Initial database status:', healthData ? healthData.database : 'Unknown');
  console.log('Activation result:', activationData ? 'Success' : 'Failed');
  console.log('Post-activation database status:', postActivationHealth ? postActivationHealth.database : 'Unknown');
}

runTests().catch((error) => {
  console.error('Test execution failed:', error);
});
