// schema.js
const { gql } = require('apollo-server');

const typeDefs = gql`
  type Query {
    account(id: ID!): Account,
    accounts: [Account]
  }

  type Mutation {
    updateContact(id: ID!, input: ContactInput!): Contact
  }

  input ContactInput {
    firstName: String
    lastName: String
    email: String
  }

  type Account {
    id: ID!
    name: String
    industry: String
    contacts: [Contact]
  }

  type Contact {
    id: ID!
    firstName: String
    lastName: String
    email: String
  }
`;

module.exports = typeDefs;
