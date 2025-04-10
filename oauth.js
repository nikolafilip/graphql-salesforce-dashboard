const jsforce = require('jsforce');
require('dotenv').config();

// Configure the OAuth settings for Salesforce
const oauth2 = new jsforce.OAuth2({
  // The login URL for Salesforce (use the appropriate one for your org)
  loginUrl: process.env.SF_LOGIN_URL,
  // Client ID from Salesforce Connected App
  clientId: process.env.SF_CLIENT_ID,
  // Client Secret from Salesforce Connected App
  clientSecret: process.env.SF_CLIENT_SECRET,
  // The callback URL configured in your Salesforce Connected App
  redirectUri: process.env.SF_CALLBACK_URL,
});

module.exports = oauth2;
