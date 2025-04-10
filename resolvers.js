const jsforce = require('jsforce');

// Helper function to escape SOQL string values
function escapeSOQL(value) {
  if (value == null) return 'null';
  // Escape single quotes by doubling them
  return String(value).replace(/'/g, "''");
}

const resolvers = {
  Query: {
    account: async (_, { id }, context) => {
      // Retrieve OAuth details from context
      const { accessToken, instanceUrl, refreshToken, oauth2 } = context.oauthData || {};

      // Log current auth state for debugging
      console.log('Auth State:', { 
        hasAccessToken: !!accessToken, 
        hasInstanceUrl: !!instanceUrl,
        hasRefreshToken: !!refreshToken
      });

      if (!accessToken || !instanceUrl) {
        throw new Error('Not authenticated with Salesforce. Please complete the OAuth flow.');
      }

      // Create a new jsforce connection using the stored tokens
      const conn = new jsforce.Connection({
        instanceUrl,
        accessToken,
        refreshToken,
        oauth2,
      });

      // Add a refresh token handler
      if (refreshToken) {
        conn.on('refresh', (newAccessToken) => {
          console.log('Token refreshed');
          // In a production app, you would save this back to your session store
        });
      }

      // Execute the SOQL query to fetch Account and related Contacts
      // Escape the ID to prevent SOQL injection
      const escapedId = escapeSOQL(id);
      const query = `
        SELECT Id, Name, Industry,
          (SELECT Id, FirstName, LastName, Email FROM Contacts)
        FROM Account
        WHERE Id = '${escapedId}'
        LIMIT 1
      `;

      try {
        console.log(`Executing query for Account ID: ${id}`);
        const result = await conn.query(query);
        console.log(`Query result: ${result.records ? result.records.length : 0} records found`);
        
        if (result.records && result.records.length > 0) {
          const sfAccount = result.records[0];
          return {
            id: sfAccount.Id,
            name: sfAccount.Name,
            industry: sfAccount.Industry,
            contacts: sfAccount.Contacts
              ? sfAccount.Contacts.records.map(contact => ({
                  id: contact.Id,
                  firstName: contact.FirstName,
                  lastName: contact.LastName,
                  email: contact.Email,
                }))
              : [],
          };
        }
        return null;
      } catch (error) {
        console.error('Error fetching account data: ', error);
        // If the error is related to an invalid session, suggest re-authenticating
        if (error.errorCode === 'INVALID_SESSION_ID') {
          throw new Error('Your Salesforce session has expired. Please re-authenticate.');
        }
        throw error;
      }
    },
    accounts: async (_, { id }, context) => {
      // Retrieve OAuth details from context
      const { accessToken, instanceUrl, refreshToken, oauth2 } = context.oauthData || {};

      if (!accessToken || !instanceUrl) {
        throw new Error('Not authenticated with Salesforce. Please complete the OAuth flow.');
      }

      const conn = new jsforce.Connection({
        instanceUrl,
        accessToken,
        refreshToken,
        oauth2
      });

      // Execute the SOQL query to fetch all Accounts
      const query = 'SELECT Id, Name, Industry FROM Account';
      const result = await conn.query(query);

      // Map the result to the Account type
      return result.records.map(record => ({
        id: record.Id,
        name: record.Name,
        industry: record.Industry
      }));
    }
  }
};

module.exports = resolvers;
