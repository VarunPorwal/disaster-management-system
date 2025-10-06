const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let adminToken = '';
let campManagerToken = '';
let volunteerToken = '';
let donorToken = '';

async function testAuthenticationSystem() {
  console.log('🔐 Testing Complete Authentication System...');
  
  try {
    // 1. Test user registration
    console.log('\n1️⃣ Testing User Registration...');
    await testUserRegistration();
    
    // 2. Test user login and get tokens
    console.log('\n2️⃣ Testing User Login...');
    await testUserLogin();
    
    // 3. Test role-based access
    console.log('\n3️⃣ Testing Role-based Access Control...');
    await testRoleBasedAccess();
    
    // 4. Test protected endpoints
    console.log('\n4️⃣ Testing Protected Endpoints...');
    await testProtectedEndpoints();
    
    // 5. Test ownership-based access
    console.log('\n5️⃣ Testing Ownership-based Access...');
    await testOwnershipAccess();
    
    console.log('\n🎉 All authentication tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Authentication test failed:', error.message);
  }
}

async function testUserRegistration() {
  const testUser = {
    username: 'testvolunteer',
    email: 'test@volunteer.org',
    password: 'password123',
    role: 'Volunteer',
    full_name: 'Test Volunteer',
    phone: '+91-9999999999'
  };
  
  try {
    const response = await axios.post(`${BASE_URL}/auth/register`, testUser);
    console.log('✅ User registration successful:', response.data.data.user.username);
  } catch (error) {
    if (error.response?.data?.message?.includes('already exists')) {
      console.log('ℹ️ User already exists, skipping registration');
    } else {
      throw error;
    }
  }
}

async function testUserLogin() {
  const users = [
    { username: 'admin', password: 'admin123', role: 'Admin' },
    { username: 'camp_manager', password: 'manager123', role: 'Camp Manager' },
    { username: 'volunteer1', password: 'volunteer123', role: 'Volunteer' },
    { username: 'donor1', password: 'donor123', role: 'Donor' }
  ];
  
  for (const user of users) {
    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        username: user.username,
        password: user.password
      });
      
      const token = response.data.data.token;
      
      switch (user.role) {
        case 'Admin':
          adminToken = token;
          break;
        case 'Camp Manager':
          campManagerToken = token;
          break;
        case 'Volunteer':
          volunteerToken = token;
          break;
        case 'Donor':
          donorToken = token;
          break;
      }
      
      console.log(`✅ ${user.role} login successful`);
      
    } catch (error) {
      console.log(`❌ ${user.role} login failed:`, error.response?.data?.message || error.message);
    }
  }
}

async function testRoleBasedAccess() {
  const tests = [
    {
      description: 'Admin can create disasters',
      method: 'POST',
      endpoint: '/disasters',
      token: adminToken,
      data: { type: 'Test Earthquake', date: '2025-10-02', severity: 'High' },
      shouldSucceed: true
    },
    {
      description: 'Volunteer cannot create disasters',
      method: 'POST', 
      endpoint: '/disasters',
      token: volunteerToken,
      data: { type: 'Test Flood', date: '2025-10-02', severity: 'Medium' },
      shouldSucceed: false
    },
    {
      description: 'Camp Manager can view volunteers',
      method: 'GET',
      endpoint: '/volunteers',
      token: campManagerToken,
      shouldSucceed: true
    },
    {
      description: 'Donor cannot access volunteers',
      method: 'GET',
      endpoint: '/volunteers',
      token: donorToken,
      shouldSucceed: false
    }
  ];
  
  for (const test of tests) {
    await runTest(test);
  }
}

async function testProtectedEndpoints() {
  const endpoints = [
    '/disasters',
    '/volunteers', 
    '/donors',
    '/supplies',
    '/requests'
  ];
  
  console.log('Testing endpoints without authentication (should fail):');
  
  for (const endpoint of endpoints) {
    try {
      await axios.get(`${BASE_URL}${endpoint}`);
      console.log(`❌ ${endpoint} - Should require authentication but didn't`);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log(`✅ ${endpoint} - Correctly requires authentication`);
      } else {
        console.log(`⚠️ ${endpoint} - Unexpected error:`, error.response?.status);
      }
    }
  }
}

async function testOwnershipAccess() {
  const tests = [
    {
      description: 'Volunteer can view their own profile',
      method: 'GET',
      endpoint: '/volunteers/1', // Assuming volunteer1 has ID 1
      token: volunteerToken,
      shouldSucceed: true
    },
    {
      description: 'Volunteer cannot view other volunteer profiles',
      method: 'GET',
      endpoint: '/volunteers/2',
      token: volunteerToken,
      shouldSucceed: false
    },
    {
      description: 'Donor can create their own donations',
      method: 'POST',
      endpoint: '/donations',
      token: donorToken,
      data: {
        donor_id: 1, // Assuming donor1 has ID 1
        type: 'Cash',
        date: '2025-10-02',
        amount: 10000,
        description: 'Test donation'
      },
      shouldSucceed: true
    }
  ];
  
  for (const test of tests) {
    await runTest(test);
  }
}

async function runTest(test) {
  try {
    const config = {
      method: test.method,
      url: `${BASE_URL}${test.endpoint}`,
      headers: test.token ? { Authorization: `Bearer ${test.token}` } : {},
      data: test.data
    };
    
    const response = await axios(config);
    
    if (test.shouldSucceed) {
      console.log(`✅ ${test.description} - SUCCESS`);
    } else {
      console.log(`❌ ${test.description} - Should have failed but succeeded`);
    }
    
  } catch (error) {
    if (!test.shouldSucceed && (error.response?.status === 401 || error.response?.status === 403)) {
      console.log(`✅ ${test.description} - Correctly blocked`);
    } else if (test.shouldSucceed) {
      console.log(`❌ ${test.description} - Failed:`, error.response?.data?.message || error.message);
    } else {
      console.log(`⚠️ ${test.description} - Unexpected error:`, error.response?.status);
    }
  }
}

// Run the tests
testAuthenticationSystem();
