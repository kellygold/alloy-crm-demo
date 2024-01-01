// components/CreateContact.js
'use client';

import React, { useState } from 'react';
import axios from 'axios';
import styles from './CreateContact.module.css';

export default function CreateContact({ connectionId }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (connectionId) {
      try {
        const response = await axios.post(`/api/contacts?connectionId=${connectionId}`, {
          firstName,
          lastName,
        });
        console.log('Contact added:', response.data);
        setFirstName('');
        setLastName('');
        // Optionally, invoke a success callback or state update here
      } catch (error) {
        console.error('Error adding contact:', error);
        // Optionally, invoke an error handling callback or state update here
      }
    } else {
      console.error('No connection ID. Please connect to Salesforce first.');
      // Optionally, invoke a no-connection callback or state update here
    }
  };

  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>
            First Name:
            <input
              className={styles.input}
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              required
            />
          </label>
          <label className={styles.label}>
            Last Name:
            <input
              className={styles.input}
              type="text"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              required
            />
          </label>
        </div>
        <button className={styles.button} type="submit">Add Contact</button>
      </form>
    </div>
  );
}
