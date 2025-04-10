const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const session = require('express-session');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const jsforce = require('jsforce');
const oauth2 = require('./oauth'); // our OAuth configuration
const cors = require('cors');
const path = require('path');

require('dotenv').config();
const app = express();

// Configure CORS for Apollo Server
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS']
}));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Use sessions to store OAuth tokens (in a production app, consider a more robust store)
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // set to true in production
    sameSite: 'lax'
  }
}));

// Route to start the OAuth login process
app.get('/oauth2/auth', (req, res) => {
  // Redirect user to the Salesforce authorization page
  res.redirect(oauth2.getAuthorizationUrl({ scope: 'api refresh_token' }));
});

// OAuth callback endpoint: Salesforce redirects here after successful login
app.get('/oauth2/callback', async (req, res) => {
  const conn = new jsforce.Connection({ oauth2 });
  const code = req.query.code;
  
  if (!code) {
    return res.status(400).send('Authorization code is missing');
  }
  
  try {
    // Manually exchange the authorization code for tokens
    const tokenResponse = await oauth2.requestToken(code);
    
    // Set the connection credentials
    conn.accessToken = tokenResponse.access_token;
    conn.refreshToken = tokenResponse.refresh_token;
    conn.instanceUrl = tokenResponse.instance_url;
    
    // Store tokens and instance URL in session for later use
    req.session.accessToken = conn.accessToken;
    req.session.refreshToken = conn.refreshToken;
    req.session.instanceUrl = conn.instanceUrl;
    
    // Get user info
    const userInfo = await conn.identity();
    
    console.log('Salesforce OAuth successful. User ID: ', userInfo.user_id);
    res.redirect('/graphql');
  } catch (err) {
    console.error('OAuth error: ', err);
    return res.status(500).send('Authentication failed: ' + err.message);
  }
});

// Add endpoint to check authentication status
app.get('/auth/status', (req, res) => {
  const isAuthenticated = !!(req.session.accessToken && req.session.instanceUrl);
  res.json({
    authenticated: isAuthenticated,
    message: isAuthenticated ? 'Authenticated with Salesforce' : 'Not authenticated'
  });
});

// Add debug endpoint to view session data (with tokens redacted)
app.get('/auth/debug', (req, res) => {
  // Create a copy of the session to redact sensitive information
  const sessionCopy = { ...req.session };
  
  // Redact sensitive information
  if (sessionCopy.accessToken) {
    sessionCopy.accessToken = `${sessionCopy.accessToken.substring(0, 5)}...${sessionCopy.accessToken.substring(sessionCopy.accessToken.length - 5)}`;
  }
  if (sessionCopy.refreshToken) {
    sessionCopy.refreshToken = `${sessionCopy.refreshToken.substring(0, 5)}...${sessionCopy.refreshToken.substring(sessionCopy.refreshToken.length - 5)}`;
  }
  
  res.json({
    sessionData: sessionCopy,
    cookies: req.headers.cookie,
    hasSession: !!req.session,
    isAuthenticated: !!(req.session && req.session.accessToken && req.session.instanceUrl)
  });
});

// Add endpoint to logout/clear session
app.get('/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.json({ success: true, message: 'Successfully logged out' });
  });
});

// Initialize Apollo Server with your GraphQL schema and resolvers
async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      // Pass session data (tokens) to resolvers via context.
      return {
        oauthData: {
          accessToken: req.session.accessToken,
          instanceUrl: req.session.instanceUrl,
          refreshToken: req.session.refreshToken,
          oauth2: oauth2,
        },
      };
    },
    introspection: true, // Enables GraphQL Playground in development
    playground: {
      settings: {
        'request.credentials': 'include', // Include cookies in requests
        'schema.polling.enable': false,   // Disable polling
      },
    },
  });

  // Start the server first
  await server.start();
  
  // Then apply middleware
  server.applyMiddleware({ 
    app,
    cors: {
      origin: true, // Allow all origins 
      credentials: true,
      methods: ['GET', 'POST', 'OPTIONS']
    },
    // Set a longer timeout if needed
    bodyParserConfig: { 
      limit: '10mb' 
    }
  });

  // Redirect root to the dashboard
  app.get('/', (req, res) => {
    res.redirect('/index.html');
  });

  // Start the Express server
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`🚀 Server is running at http://localhost:${PORT}${server.graphqlPath}`);
    console.log(`👉 Begin OAuth flow by visiting http://localhost:${PORT}/oauth2/auth`);
  });
}

// Start the Apollo server
startServer().catch(err => {
  console.error('Failed to start server:', err);
});
