const jsforce = require('jsforce');
require('dotenv').config();

// This is a standalone script to check Salesforce authentication
// Usage: node check-auth.js [accessToken] [instanceUrl]

async function checkAuth() {
  // Get auth details from command line arguments or environment variables
  const accessToken = process.argv[2] || process.env.SF_ACCESS_TOKEN;
  const instanceUrl = process.argv[3] || process.env.SF_INSTANCE_URL;
  
  if (!accessToken || !instanceUrl) {
    console.error('Error: Missing accessToken or instanceUrl');
    console.log('Usage: node check-auth.js [accessToken] [instanceUrl]');
    console.log('Or set SF_ACCESS_TOKEN and SF_INSTANCE_URL environment variables');
    process.exit(1);
  }
  
  console.log('Checking Salesforce authentication...');
  
  // Create a connection with the provided credentials
  const conn = new jsforce.Connection({
    instanceUrl,
    accessToken,
  });
  
  try {
    // Try to get current user info
    console.log('Fetching current user info...');
    const userInfo = await conn.identity();
    
    console.log('Authentication successful! User info:');
    console.log(`User ID: ${userInfo.user_id}`);
    console.log(`Username: ${userInfo.username}`);
    console.log(`Organization ID: ${userInfo.organization_id}`);
    
    // Try a simple SOQL query
    console.log('\nFetching a sample Account record...');
    const result = await conn.query('SELECT Id, Name FROM Account LIMIT 1');
    
    if (result.records.length > 0) {
      console.log('Sample Account found:');
      console.log(`ID: ${result.records[0].Id}`);
      console.log(`Name: ${result.records[0].Name}`);
    } else {
      console.log('No Account records found.');
    }
    
  } catch (error) {
    console.error('Authentication error:');
    console.error(error);
    process.exit(1);
  }
}

checkAuth(); 