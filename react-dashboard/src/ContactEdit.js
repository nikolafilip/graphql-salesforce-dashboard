import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import './ContactEdit.css';

const UPDATE_CONTACT = gql`
  mutation UpdateContact($id: ID!, $input: ContactInput!) {
    updateContact(id: $id, input: $input) {
      id
      firstName
      lastName
      email
    }
  }
`;

const ContactEdit = ({ contact, onClose, onSave }) => {
  const [firstName, setFirstName] = useState(contact.firstName || '');
  const [lastName, setLastName] = useState(contact.lastName || '');
  const [email, setEmail] = useState(contact.email || '');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [updateContact, { loading }] = useMutation(UPDATE_CONTACT, {
    onCompleted: (data) => {
      onSave(data.updateContact);
      onClose();
    },
    onError: (error) => {
      setErrorMessage(error.message);
    }
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setErrorMessage('All fields are required');
      return;
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Please enter a valid email address');
      return;
    }
    
    setErrorMessage('');
    updateContact({
      variables: {
        id: contact.id,
        input: { firstName, lastName, email }
      }
    });
  };
  
  return (
    <div className="modal-backdrop">
      <div className="contact-edit-modal">
        <header className="modal-header">
          <h2>Edit Contact</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </header>
        
        <form onSubmit={handleSubmit} className="contact-form">
          {errorMessage && (
            <div className="error-message">
              <p>{errorMessage}</p>
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First Name"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last Name"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
            />
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-button" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="save-button"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactEdit; 