#!/usr/bin/env node

/**
 * Simple functionality test script for Taitil Graphics Platform
 * Run with: node test-functionality.js
 */

const http = require('http');
const https = require('https');

const BASE_URL = 'http://localhost:3000';
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testEndpoint(name, url, options = {}) {
  try {
    log(`Testing ${name}...`, 'blue');
    const response = await makeRequest(url, options);
    
    if (response.statusCode >= 200 && response.statusCode < 300) {
      log(`✅ ${name} - OK (${response.statusCode})`, 'green');
      return true;
    } else {
      log(`❌ ${name} - Failed (${response.statusCode})`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ ${name} - Error: ${error.message}`, 'red');
    return false;
  }
}

async function testChatAPI() {
  const testUserId = 'test-user-' + Date.now();
  
  // Test GET chat (should create conversation)
  const getResult = await testEndpoint(
    'Chat GET API',
    `${BASE_URL}/api/chat?userId=${testUserId}`
  );

  // Test POST chat (send message)
  const postResult = await testEndpoint(
    'Chat POST API',
    `${BASE_URL}/api/chat`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: testUserId,
        message: 'Hello, this is a test message',
        senderType: 'user'
      })
    }
  );

  return getResult && postResult;
}

async function testAuthAPI() {
  // Test registration
  const registerResult = await testEndpoint(
    'Auth Registration API',
    `${BASE_URL}/api/auth/register`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: `test${Date.now()}@example.com`,
        password: 'testpassword123',
        name: 'Test User'
      })
    }
  );

  // Test login with existing user
  const loginResult = await testEndpoint(
    'Auth Login API',
    `${BASE_URL}/api/auth/login`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'customer@example.com',
        password: 'password123'
      })
    }
  );

  return registerResult && loginResult;
}

async function runTests() {
  log('🚀 Starting Taitil Graphics Platform Tests', 'yellow');
  log('=' * 50, 'yellow');

  const results = [];

  // Test basic endpoints
  results.push(await testEndpoint('Homepage', `${BASE_URL}/`));
  results.push(await testEndpoint('Products API', `${BASE_URL}/api/products`));
  results.push(await testEndpoint('Enquiries API', `${BASE_URL}/api/enquiries`));

  // Test chat functionality
  log('\n📱 Testing Chat System...', 'yellow');
  results.push(await testChatAPI());

  // Test authentication
  log('\n🔐 Testing Authentication...', 'yellow');
  results.push(await testAuthAPI());

  // Test admin routes (these might fail without auth, which is expected)
  log('\n👨‍💼 Testing Admin Routes...', 'yellow');
  results.push(await testEndpoint('Admin Chat Page', `${BASE_URL}/admin/chat`));

  // Summary
  log('\n📊 Test Results Summary', 'yellow');
  log('=' * 30, 'yellow');
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  if (passed === total) {
    log(`🎉 All tests passed! (${passed}/${total})`, 'green');
  } else {
    log(`⚠️  Some tests failed. Passed: ${passed}/${total}`, 'yellow');
  }

  log('\n💡 Next Steps:', 'blue');
  log('1. Open http://localhost:3000 in your browser');
  log('2. Test the chat widget in the bottom-right corner');
  log('3. Visit http://localhost:3000/admin/chat for admin dashboard');
  log('4. Try logging in with: customer@example.com / password123');

  return passed === total;
}

// Check if server is running first
async function checkServer() {
  try {
    await makeRequest(`${BASE_URL}/`);
    return true;
  } catch (error) {
    log('❌ Server is not running!', 'red');
    log('Please start the server with: npm run dev', 'yellow');
    return false;
  }
}

// Main execution
async function main() {
  const serverRunning = await checkServer();
  
  if (serverRunning) {
    const allPassed = await runTests();
    process.exit(allPassed ? 0 : 1);
  } else {
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    log(`Fatal error: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { runTests, testEndpoint, makeRequest };
