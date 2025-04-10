const jsforce = require('jsforce');

// Helper function to escape SOQL string values
function escapeSOQL(value) {
  if (value == null) return 'null';
  // Escape single quotes by doubling them
  return String(value).replace(/'/g, "''");
}

// Create a connection to Salesforce with the stored tokens
function createConnection(oauthData) {
  const { accessToken, instanceUrl, refreshToken, oauth2 } = oauthData || {};
  
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
  
  return conn;
}

const resolvers = {
  Query: {
    account: async (_, { id }, context) => {
      // Log current auth state for debugging
      console.log('Auth State:', { 
        hasAccessToken: !!context.oauthData?.accessToken, 
        hasInstanceUrl: !!context.oauthData?.instanceUrl,
        hasRefreshToken: !!context.oauthData?.refreshToken
      });

      const conn = createConnection(context.oauthData);

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
    accounts: async (_, __, context) => {
      const conn = createConnection(context.oauthData);

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
  },
  Mutation: {
    updateContact: async (_, { id, input }, context) => {
      try {
        const conn = createConnection(context.oauthData);
        
        // Prepare the update object
        const updateObj = {};
        if (input.firstName !== undefined) updateObj.FirstName = input.firstName;
        if (input.lastName !== undefined) updateObj.LastName = input.lastName;
        if (input.email !== undefined) updateObj.Email = input.email;
        
        // Update the contact in Salesforce
        console.log(`Updating Contact ID: ${id} with:`, updateObj);
        await conn.sobject('Contact').update({ Id: id, ...updateObj });
        
        // Fetch the updated contact to return in the response
        const contactRecord = await conn.sobject('Contact').retrieve(id);
        
        return {
          id: contactRecord.Id,
          firstName: contactRecord.FirstName,
          lastName: contactRecord.LastName,
          email: contactRecord.Email
        };
      } catch (error) {
        console.error('Error updating contact: ', error);
        if (error.errorCode === 'INVALID_SESSION_ID') {
          throw new Error('Your Salesforce session has expired. Please re-authenticate.');
        }
        throw error;
      }
    }
  }
};

module.exports = resolvers;
