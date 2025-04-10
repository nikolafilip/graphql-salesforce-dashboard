# Salesforce GraphQL Dashboard

A modern React application that connects to Salesforce using GraphQL, allowing you to view and edit your Salesforce data through a clean, intuitive interface.

## Project Purpose

This project serves as a learning platform to explore GraphQL capabilities and how it can be utilized to facilitate bidirectional communication (read and write) between web applications and Salesforce. Through this project, JSForce was discovered as a powerful tool for Salesforce-backed web application development.

## Features

- **OAuth 2.0 Authentication**: Secure connection to your Salesforce org
- **Account Browsing**: View all accounts with filtering by name and industry
- **Account Details**: View comprehensive account information including related contacts
- **Contact Management**: Edit contact information directly through the app
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

- **Frontend**: React with React Router and Apollo Client
- **Backend**: Node.js with Express and Apollo Server
- **Authentication**: OAuth 2.0 flow with Salesforce
- **Data Access**: GraphQL API communicating with Salesforce REST API
- **Salesforce Integration**: JSForce JavaScript library

## Getting Started

### Prerequisites

- Node.js (v14+)
- A Salesforce Developer account
- A Connected App configured in Salesforce

### Environment Setup

Create a `.env` file in the root directory with the following variables:

```
SF_CLIENT_ID=your_salesforce_client_id
SF_CLIENT_SECRET=your_salesforce_client_secret
SF_REDIRECT_URI=http://localhost:4000/oauth2/callback
SF_LOGIN_URL=https://login.salesforce.com
```

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/graphql-salesforce-dashboard.git
   cd graphql-salesforce-dashboard
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Start the server
   ```
   node server.js
   ```

4. In a separate terminal, navigate to the React application and start it
   ```
   cd react-dashboard
   npm install
   npm start
   ```

### Authentication Flow

1. Visit `http://localhost:3000` in your browser
2. Click on the "Authenticate with Salesforce" button
3. Complete the Salesforce OAuth flow by logging in
4. You'll be redirected back to the dashboard once authenticated

## Using the Dashboard

### Browsing Accounts

1. Navigate to the "All Accounts" page
2. Browse accounts grouped by industry
3. Use the search bar to filter accounts by name or industry
4. Click on an account card to view detailed information

### Viewing Account Details

1. Enter a Salesforce Account ID in the search bar or click on an account from the account listing
2. View account details including name and industry
3. See a list of all contacts associated with the account

### Editing Contacts

1. View an account's details
2. Hover over a contact card and click the "Edit" button
3. Modify the contact's information in the modal dialog
4. Click "Save Changes" to update the contact in Salesforce

## Project Structure

```
├── server.js                # Express server and Apollo Server setup
├── schema.js                # GraphQL schema definition
├── resolvers.js             # GraphQL resolvers
├── oauth.js                 # OAuth configuration
├── react-dashboard/         # React frontend application
│   ├── src/
│   │   ├── index.js         # Application entry point with routing
│   │   ├── Dashboard.js     # Account details component
│   │   ├── Accounts.js      # Account listing component
│   │   ├── ContactEdit.js   # Contact editing component
│   │   ├── ApolloProvider.js # Apollo Client configuration
```

## JSForce - A Powerful Salesforce JavaScript Library

This project leverages JSForce, a comprehensive JavaScript library for Salesforce integration. While only a subset of JSForce's capabilities are used in this project, the library offers much more functionality.

### How JSForce is Used in This Project

1. **Authentication**: Managing OAuth 2.0 flow and token refresh
2. **Data Retrieval**: Executing SOQL queries to fetch account and contact data
3. **Data Modification**: Updating contact records in Salesforce

```javascript
// Example: Creating a connection to Salesforce
const conn = new jsforce.Connection({
  instanceUrl,
  accessToken,
  refreshToken,
  oauth2
});

// Example: Querying data with related records
const result = await conn.query(`
  SELECT Id, Name, Industry,
    (SELECT Id, FirstName, LastName, Email FROM Contacts)
  FROM Account
  WHERE Id = '${id}'
  LIMIT 1
`);

// Example: Updating a record
await conn.sobject('Contact').update({ 
  Id: id, 
  FirstName: firstName,
  LastName: lastName,
  Email: email 
});
```

### JSForce Capabilities Beyond This Project

JSForce can do much more than what's implemented in this application:

#### 1. Comprehensive API Access
- **REST API**: Complete CRUD operations on all Salesforce objects
- **SOAP API**: Access to all Salesforce SOAP web services
- **Bulk API**: Process millions of records efficiently
- **Streaming API**: Subscribe to real-time platform events
- **Metadata API**: Deploy and retrieve metadata components
- **Apex REST**: Call custom Apex REST endpoints
- **Chatter API**: Interact with Salesforce Chatter feeds

#### 2. Advanced Query Capabilities
```javascript
// Query builder pattern
conn.sobject('Opportunity')
  .select('Id, Name, Amount, StageName')
  .where("StageName = 'Closed Won'")
  .limit(5)
  .execute((err, records) => {
    // Handle results
  });

// Relationship queries
conn.sobject('Account')
  .select('Name, Owner.Name, CreatedBy.Name')
  .where("Industry = 'Technology'")
  .execute();
```

#### 3. Bulk Data Operations
```javascript
// Bulk API for large data sets
const job = conn.bulk.createJob("Contact", "insert");
const batch = job.createBatch();
batch.execute(contactsArray);
batch.on("queue", batchInfo => {
  // Monitor batch status
});
```

#### 4. Apex Code Execution
```javascript
// Execute Apex methods from JavaScript
conn.apex.post("/MyApexRestResource", data, (err, result) => {
  // Handle result
});

// Call named Apex methods
conn.execute("MyApexClass.myStaticMethod", param1, param2);
```

#### 5. Real-Time Data with Streaming API
```javascript
// Subscribe to platform events
conn.streaming.topic("/event/MyEvent__e").subscribe(message => {
  console.log("Received event: ", message);
});

// Subscribe to PushTopic for record changes
conn.streaming.topic("/topic/AccountUpdates").subscribe(message => {
  console.log("Account updated: ", message);
});
```

#### 6. Metadata Management
```javascript
// Deploy metadata components
conn.metadata.deploy("path/to/package.zip")
  .complete((err, result) => {
    console.log("Deployment complete: ", result.success);
  });

// Retrieve metadata about objects
conn.metadata.retrieve({
  types: [{ name: 'CustomObject', members: ['Account', 'Contact'] }]
}).complete();
```

#### 7. Change Data Capture
```javascript
// Subscribe to change events
conn.streaming.topic("/data/AccountChangeEvent").subscribe(event => {
  console.log("Change detected: ", event);
});
```

For more information on JSForce, visit the [official documentation](https://jsforce.github.io/).

## Security Considerations

- This application stores OAuth tokens in the server's session storage, which is suitable for development but should be enhanced for production
- All communication with Salesforce is secured via TLS
- The application validates user input before sending to Salesforce

## Troubleshooting

- If you encounter authentication errors, ensure your Connected App settings in Salesforce match your environment variables
- If queries fail, check that your OAuth flow completed successfully by visiting the `/auth/status` endpoint
- For detailed session information, visit the `/auth/debug` endpoint

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [Apollo Server](https://www.apollographql.com/docs/apollo-server/)
- Uses [JSForce](https://jsforce.github.io/) for Salesforce connectivity
- UI inspired by Salesforce Lightning Design System 