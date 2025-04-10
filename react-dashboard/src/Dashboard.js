// src/Dashboard.js
import React from 'react';
import { useQuery, gql } from '@apollo/client';

const GET_ACCOUNT = gql`
  query GetAccount($id: ID!) {
    account(id: $id) {
      name
      industry
      contacts {
        firstName
        lastName
        email
      }
    }
  }
`;

const Dashboard = () => {
  // Replace with a valid Account Id from your Salesforce org
  const accountId = "001aj000011qf62AAA";
  const { loading, error, data } = useQuery(GET_ACCOUNT, {
    variables: { id: accountId },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error fetching data: {error.message}</p>;

  const { account } = data;
  return (
    <div>
      <h1>Account Details</h1>
      {account ? (
        <>
          <h2>{account.name}</h2>
          <p>Industry: {account.industry}</p>
          <h3>Contacts</h3>
          <ul>
            {account.contacts.map(contact => (
              <li key={contact.email}>
                {contact.firstName} {contact.lastName} - {contact.email}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>No account found.</p>
      )}
    </div>
  );
};

export default Dashboard;