/**
 * Website Security Checker - API Demo
 * 
 * This script demonstrates how to use the Website Security Checker API
 * to check the security of websites programmatically.
 */

const axios = require('axios');

// Configuration
const API_ENDPOINT = 'http://localhost:3000/api/check';
const WEBSITES_TO_CHECK = [
  'example.com',
  'google.com',
  'github.com'
];

/**
 * Check a website's security using the API
 * @param {string} url The URL to check
 */
async function checkWebsite(url) {
  console.log(`\n🔍 Checking website: ${url}`);
  console.log('───────────────────────────────────────────────');
  
  try {
    const response = await axios.post(API_ENDPOINT, { url });
    const data = response.data;
    
    // Print summary
    console.log(`✅ Security Score: ${data.score}/100`);
    console.log(`🌐 Domain: ${data.domain}`);
    console.log(`🔒 SSL Valid: ${data.ssl.valid ? 'Yes' : 'No'}`);
    
    if (data.ssl.valid) {
      console.log(`📅 SSL Expires In: ${data.ssl.daysRemaining} days`);
    }
    
    // Count security headers
    const headersPresent = Object.values(data.headers).filter(h => h !== null).length;
    console.log(`🛡️ Security Headers: ${headersPresent}/7`);
    
    // Malware check
    if (data.malware.checked) {
      console.log(`🦠 Malware Detection: ${data.malware.safe ? 'Safe' : 'THREAT DETECTED!'}`);
    } else {
      console.log(`🦠 Malware Detection: Not checked (API key required)`);
    }
    
    // Mixed content
    if (data.mixedContent) {
      console.log(`🔄 Mixed Content: ${data.mixedContent.found ? 
        `Found (${data.mixedContent.count} resources)` : 'None found'}`);
    }
    
    return data;
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.error || error.message);
    return null;
  }
}

/**
 * Main function to run the demo
 */
async function runDemo() {
  console.log('🔐 WEBSITE SECURITY CHECKER - API DEMO 🔐');
  console.log('=========================================');
  console.log('Checking multiple websites for security issues...');
  
  // Make sure the server is running
  console.log('\n⚠️ Make sure the server is running with: npm start');
  console.log('Server should be available at: http://localhost:3000');
  
  // Check each website
  for (const website of WEBSITES_TO_CHECK) {
    await checkWebsite(website);
  }
  
  console.log('\n✨ Demo completed! ✨');
  console.log('For more details, use the web interface at http://localhost:3000');
}

// Run the demo
runDemo().catch(error => {
  console.error('Demo failed:', error);
}); 