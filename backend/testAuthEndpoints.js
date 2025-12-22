const http = require('http');
const fs = require('fs');
const path = require('path');

// Import Firebase admin to generate tokens
require('dotenv').config();
const admin = require('firebase-admin');

// Configuration
const API_BASE = 'http://localhost:5000/api/auth';
const EMAIL = 'test@example.com';

// Get or generate token
let TOKEN = process.argv[2];

async function getOrGenerateToken() {
  if (TOKEN) {
    console.log('🔑 Using provided token\n');
    return TOKEN;
  }

  console.log('📝 Generating fresh token for test user...\n');
  
  try {
    // Initialize Firebase if not already done
    if (!admin.apps.length) {
      const serviceAccount = {
        type: 'service_account',
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI,
        token_uri: process.env.FIREBASE_TOKEN_URI,
        auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
        client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }

    // Get user by email
    const userRecord = await admin.auth().getUserByEmail(EMAIL);
    
    // Create custom token
    TOKEN = await admin.auth().createCustomToken(userRecord.uid);
    
    console.log(`✅ Token generated successfully for ${EMAIL}\n`);
    return TOKEN;
  } catch (error) {
    console.error('❌ Error generating token:', error.message);
    console.error('\nFallback: Provide token as argument');
    console.error('Usage: node testAuthEndpoints.js <TOKEN>\n');
    process.exit(1);
  }
}

// Helper function to make HTTP requests
function makeRequest(method, path, body = null, token) {
  return new Promise((resolve, reject) => {
    const fullUrl = `${API_BASE}${path}`;
    const url = new URL(fullUrl);
    const options = {
      hostname: url.hostname,
      port: url.port || 5000,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: parsed
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data
          });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// Test cases
const tests = [
  {
    name: '1️⃣  GET /api/auth/user - Fetch Current User',
    method: 'GET',
    path: '/user',
    body: null,
    expectedStatus: 200
  },
  {
    name: '2️⃣  PUT /api/auth/profile - Update User Profile',
    method: 'PUT',
    path: '/profile',
    body: {
      firstName: 'Updated',
      lastName: 'User',
      bio: 'This is a test bio',
      preferences: {
        language: 'en',
        theme: 'dark',
        notifications: true
      }
    },
    expectedStatus: 200
  },
  {
    name: '3️⃣  POST /api/auth/login - Record Login',
    method: 'POST',
    path: '/login',
    body: null,
    expectedStatus: 200
  },
  {
    name: '4️⃣  GET /api/auth/users/:userId - Get Public User Profile',
    method: 'GET',
    path: '/users/yilT9ukIEtd4GtMViSuGOXvc6R92',
    body: null,
    expectedStatus: 200
  }
];

// Run tests
async function runTests() {
  // Get or generate token first
  const token = await getOrGenerateToken();
  
  console.log('\n🚀 Starting Authentication Endpoint Tests\n');
  console.log(`📌 Base URL: ${API_BASE}`);
  console.log(`🔑 Token: ${token.substring(0, 50)}...`);
  console.log(`👤 User Email: ${EMAIL}\n`);
  console.log('─'.repeat(80));

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`\n${test.name}`);
      console.log(`  Method: ${test.method} ${test.path}`);
      if (test.body) {
        console.log(`  Body: ${JSON.stringify(test.body, null, 2)}`);
      }

      const response = await makeRequest(test.method, test.path, test.body, token);

      const statusMatch = response.status === test.expectedStatus;
      const icon = statusMatch ? '✅' : '❌';

      console.log(`\n  ${icon} Status: ${response.status} (Expected: ${test.expectedStatus})`);

      if (response.body) {
        if (response.body.success !== undefined) {
          console.log(`  Success: ${response.body.success}`);
        }
        if (response.body.data) {
          console.log(`  Data: ${JSON.stringify(response.body.data, null, 2)}`);
        }
        if (response.body.error) {
          console.log(`  Error: ${response.body.error}`);
        }
        if (response.body.message) {
          console.log(`  Message: ${response.body.message}`);
        }
      }

      if (statusMatch) {
        passed++;
      } else {
        failed++;
      }

    } catch (error) {
      console.log(`\n  ❌ Request failed: ${error.message}`);
      failed++;
    }
  }

  console.log('\n' + '─'.repeat(80));
  console.log(`\n📊 Test Results:`);
  console.log(`  ✅ Passed: ${passed}/${tests.length}`);
  console.log(`  ❌ Failed: ${failed}/${tests.length}`);

  if (failed === 0) {
    console.log('\n🎉 All tests passed! Authentication system is working correctly.\n');
  } else {
    console.log('\n⚠️  Some tests failed. Check the responses above.\n');
  }

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
