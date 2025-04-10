// schema.js
const { gql } = require('apollo-server');

const typeDefs = gql`
  type Query {
    account(id: ID!): Account
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
