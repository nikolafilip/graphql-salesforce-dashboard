// src/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import { Link, useLocation } from 'react-router-dom';
import ContactEdit from './ContactEdit';
import './Dashboard.css';

const GET_ACCOUNT = gql`
  query GetAccount($id: ID!) {
    account(id: $id) {
      name
      industry
      contacts {
        id
        firstName
        lastName
        email
      }
    }
  }
`;

const Dashboard = () => {
  const location = useLocation();
  const [accountId, setAccountId] = useState('');
  const [searchId, setSearchId] = useState('');
  const [editingContact, setEditingContact] = useState(null);
  const [contacts, setContacts] = useState([]);
  
  // Handle URL parameters for account ID
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const idFromUrl = params.get('id');
    if (idFromUrl) {
      setAccountId(idFromUrl);
      setSearchId(idFromUrl);
    }
  }, [location.search]);
  
  // Only execute the query when searchId has a value
  const { loading, error, data, refetch } = useQuery(GET_ACCOUNT, {
    variables: { id: searchId },
    skip: !searchId,
    fetchPolicy: 'network-only'
  });
  
  // Update local contacts state when data changes
  useEffect(() => {
    if (data?.account?.contacts) {
      setContacts(data.account.contacts);
    }
  }, [data]);
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (accountId) {
      setSearchId(accountId);
      if (searchId === accountId) {
        refetch();
      }
    }
  };

  const handleEditContact = (contact) => {
    setEditingContact(contact);
  };

  const handleSaveContact = (updatedContact) => {
    // Update the local contacts array with the updated contact
    setContacts(prevContacts => 
      prevContacts.map(contact => 
        contact.id === updatedContact.id ? updatedContact : contact
      )
    );
  };

  const renderAccountDetails = () => {
    if (!data || !data.account) return null;
    
    const { account } = data;
    return (
      <div className="account-details">
        <div className="account-header">
          <h2>{account.name}</h2>
          <span className="industry-badge">{account.industry || 'No Industry'}</span>
        </div>
        
        <div className="contacts-section">
          <h3>Contacts ({contacts.length})</h3>
          {contacts.length > 0 ? (
            <div className="contacts-grid">
              {contacts.map(contact => (
                <div key={contact.id} className="contact-card">
                  <div className="contact-avatar">
                    {contact.firstName?.charAt(0) || ''}{contact.lastName?.charAt(0) || ''}
                  </div>
                  <div className="contact-info">
                    <h4>{contact.firstName} {contact.lastName}</h4>
                    <a href={`mailto:${contact.email}`}>{contact.email}</a>
                  </div>
                  <button 
                    className="edit-contact-btn" 
                    onClick={() => handleEditContact(contact)}
                    aria-label="Edit Contact"
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No contacts associated with this account</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Salesforce Account Dashboard</h1>
        <nav className="main-nav">
          <Link to="/" className="nav-link active">Home</Link>
          <Link to="/accounts" className="nav-link">All Accounts</Link>
        </nav>
      </header>
      
      <div className="search-container">
        <form onSubmit={handleSearch}>
          <div className="input-group">
            <input
              type="text"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              placeholder="Enter Salesforce Account ID"
              className="search-input"
            />
            <button type="submit" className="search-button">
              Search
            </button>
          </div>
        </form>
      </div>
      
      <div className="results-container">
        {loading && <div className="loading-spinner">Loading...</div>}
        
        {error && (
          <div className="error-message">
            <h3>Error</h3>
            <p>{error.message}</p>
            <p>Make sure you've completed the OAuth flow by visiting: <a href="http://localhost:4000/oauth2/auth" target="_blank" rel="noopener noreferrer">Authenticate with Salesforce</a></p>
          </div>
        )}
        
        {data?.account ? renderAccountDetails() : (
          searchId && !loading && !error && (
            <div className="no-results">
              <h3>No Account Found</h3>
              <p>No account was found with ID: {searchId}</p>
            </div>
          )
        )}
        
        {!searchId && !loading && !error && (
          <div className="instructions">
            <h3>Welcome to the Salesforce Dashboard</h3>
            <p>Enter a Salesforce Account ID above to view account details and contacts.</p>
            <p>Before searching, make sure you've authenticated with Salesforce.</p>
            <p>Or <Link to="/accounts" className="text-link">view all accounts</Link> to browse your Salesforce data.</p>
            <a href="http://localhost:4000/oauth2/auth" className="auth-link" target="_blank" rel="noopener noreferrer">
              Authenticate with Salesforce
            </a>
          </div>
        )}
      </div>
      
      {editingContact && (
        <ContactEdit 
          contact={editingContact} 
          onClose={() => setEditingContact(null)} 
          onSave={handleSaveContact}
        />
      )}
    </div>
  );
};

export default Dashboard;