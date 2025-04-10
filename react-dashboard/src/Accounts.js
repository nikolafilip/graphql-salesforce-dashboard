import React, { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import { Link, useNavigate } from 'react-router-dom';
import './Accounts.css';

const GET_ACCOUNTS = gql`
  query GetAccounts {
    accounts {
      id
      name
      industry
    }
  }
`;

const Accounts = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const { loading, error, data } = useQuery(GET_ACCOUNTS, {
    fetchPolicy: 'network-only'
  });

  // Handle viewing a specific account
  const viewAccount = (id) => {
    navigate(`/?id=${id}`);
  };

  // Filter accounts based on search term
  const filteredAccounts = data?.accounts?.filter(account => 
    account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (account.industry && account.industry.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  // Group accounts by industry
  const accountsByIndustry = filteredAccounts.reduce((groups, account) => {
    const industry = account.industry || 'Uncategorized';
    if (!groups[industry]) {
      groups[industry] = [];
    }
    groups[industry].push(account);
    return groups;
  }, {});

  // Sort industries alphabetically
  const sortedIndustries = Object.keys(accountsByIndustry).sort();

  return (
    <div className="accounts-container">
      <header className="accounts-header">
        <h1>Salesforce Accounts</h1>
        <nav className="main-nav">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/accounts" className="nav-link active">All Accounts</Link>
        </nav>
      </header>

      <div className="search-container">
        <div className="input-group">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search accounts by name or industry"
            className="search-input"
          />
          {searchTerm && (
            <button 
              className="clear-search" 
              onClick={() => setSearchTerm('')}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      
      <div className="accounts-content">
        {loading && <div className="loading-spinner">Loading accounts...</div>}
        
        {error && (
          <div className="error-message">
            <h3>Error</h3>
            <p>{error.message}</p>
            <p>Make sure you've completed the OAuth flow by visiting: <a href="http://localhost:4000/oauth2/auth" target="_blank" rel="noopener noreferrer">Authenticate with Salesforce</a></p>
          </div>
        )}
        
        {!loading && !error && (
          <>
            <div className="accounts-summary">
              <div className="accounts-count">
                {filteredAccounts.length} {filteredAccounts.length === 1 ? 'account' : 'accounts'} found
                {searchTerm && <span> for "{searchTerm}"</span>}
              </div>
              
              {searchTerm && filteredAccounts.length === 0 && (
                <div className="no-results">
                  <p>No accounts match your search. Try a different term or <button className="text-button" onClick={() => setSearchTerm('')}>clear search</button></p>
                </div>
              )}
            </div>
            
            {filteredAccounts.length > 0 && (
              <div className="industry-sections">
                {sortedIndustries.map(industry => (
                  <div key={industry} className="industry-section">
                    <h2 className="industry-title">{industry}</h2>
                    <div className="accounts-grid">
                      {accountsByIndustry[industry].map(account => (
                        <div key={account.id} className="account-card" onClick={() => viewAccount(account.id)}>
                          <h3 className="account-name">{account.name}</h3>
                          <div className="account-actions">
                            <button className="view-details-btn">View Details</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Accounts; 