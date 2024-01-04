
## Building a CRM Integration with Next.js and Alloy

### Introduction

This tutorial will guide you through building a CRM integration using Next.js and Alloy. The integration allows users to connect to Salesforce, list contacts, and create new contacts. This is intended for JavaScript developers familiar with React and Next.js.

### Prerequisites

-   Node.js (version 12 or higher)
-   Basic knowledge of React and Next.js
-   Text editor or IDE
-   Salesforce account for testing (optional)

### Step 1: Setting Up the Next.js Project

1.  **Create a New Next.js App**:
    
    -   Run `npx create-next-app my-crm-app`.
    -   Replace `my-crm-app` with your project name.
    -   Choose the following options when prompted:
        -   TypeScript: No
        -   ESLint: Yes
        -   Tailwind CSS: No
        -   `src/` directory: Yes
        -   App Router: Yes
        -   Customize default import alias: No
2.  **Navigate to Your Project Directory**:
        
    `cd my-crm-app` 
    
3.  **Install Axios** (for API requests):
        
    `npm install axios` 
    

### Step 2: Structuring the Application

Create the following directories and files inside your project:

```
my-crm-app/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── ConnectApp.js
│   │   │   ├── ConnectApp.module.css
│   │   │   ├── ContactList.js
│   │   │   ├── ContactList.module.css
│   │   │   ├── CreateContact.js
│   │   │   └── CreateContact.module.css
│   │   ├── _app.js
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.js
│   │   └── page.js
│   └── pages/
│       └── api/
│           ├── contacts.js
│           └── get-jwt-token.js
├── public/
│   ├── next.svg
│   └── vercel.svg
├── .env.local
├── next.config.js
├── package-lock.json
└── package.json
``` 


### Step 3: Environment Variables and User Setup

1.  **Set Up Environment Variables**:
    
    -   Create `.env.local` and add:
                
        ```
        ALLOY_API_KEY=your_alloy_api_key
        ALLOY_USER_ID=your_alloy_user_id
        ```
        
    -   Configure `next.config.js`:
        
        ```        
        module.exports = {
          env: {
            ALLOY_API_KEY: process.env.ALLOY_API_KEY,
            ALLOY_USER_ID: process.env.ALLOY_USER_ID,
          },
        };
        ```
        
2.  **Create an Alloy User (_as needed_)**:
    
    -   If you don't have a user ID, use this sample cURL request to create one:
        
        ```
        curl --request POST \
             --url 'https://embedded.runalloy.com/2023-06/one/users' \
             --header 'Authorization: bearer YOUR_API_KEY' \
             --header 'accept: application/json' \
             --header 'content-type: application/json' \
             --data '{ "username": "MsoyC1KI" }'
          ``` 
        
    -   Replace `YOUR_API_KEY` with your actual Alloy API key.
    


### Step 4: Building the Frontend

### Connect to Salesforce (Step 1)

#### Creating the Connection Component

1.  **Open or Create `ConnectApp.js`** in the `src/app/components/ConnectApp` directory.
    
2.  **Implement `ConnectApp.js`**:
    
    -   This component facilitates the connection to Salesforce using Alloy's SDK. When a user clicks the "Connect App" button, it triggers the authentication process. A successful connection will store the `connectionId` in local storage and in the component's state.
        
    ```
    import React, { useEffect } from 'react';
    import axios from 'axios';
    import styles from './ConnectApp.module.css';
    
    export default function ConnectApp({ onConnectionEstablished }) {
      useEffect(() => {
        // Load the Alloy SDK script
        const script = document.createElement('script');
        script.src = "https://cdn.runalloy.com/scripts/embedded.js";
        script.type = "text/javascript";
        script.onload = () => console.log("Alloy SDK loaded");
        document.body.appendChild(script);
      }, []);
    
      const fetchTokenAndAuthenticate = async () => {
        try {
          const response = await axios.get('/api/get-jwt-token');
          if (window.Alloy) {
            window.Alloy.setToken(response.data.token);
            window.Alloy.authenticate({
              category: 'crm',
              callback: (data) => {
                if (data.success) {
                  localStorage.setItem('connectionId', data.connectionId);
                  onConnectionEstablished(data.connectionId);
                }
              }
            });
          } else {
            console.error('Alloy SDK not found');
          }
        } catch (error) {
          console.error('Error fetching JWT token:', error);
        }
      };
    
      return (
        <div className={styles.connectContainer}>
          <button className={styles.connectButton} onClick={fetchTokenAndAuthenticate}>
            Connect App
          </button>
        </div>
      );
    }` 
    
3.  **Implement CSS in `ConnectApp.module.css`**:
    
    -   Style the connection button to enhance user experience.
    
    cssCopy code
    
    ```/* styles/ConnectApp.module.css */
    .connectContainer {
        margin: 2rem;
        text-align: center;
    }
    
    .connectButton {
        background-color: #005eff;
        color: white;
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }
    
    .connectButton:hover {
        background-color: #004ecc;
    }
    ```
By completing this step, you have set up the first crucial part of the CRM integration - connecting to Salesforce. Users can now authenticate and establish a connection to their Salesforce account, setting the stage for further interactions like listing and creating contacts.

----------

#### List Contacts (Step 2)

1.  **Open or Create `ContactList.js` and `ContactList.module.css`** in the `src/app/components/ContactList` directory.
    
2.  **Implementing `ContactList.js`**:
    
    -   This component fetches and displays the list of contacts. It includes a refresh button to reload the contacts list.
        
```
// components/ContactList.js
'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './ContactList.module.css';

export default function ContactList({ connectionId }) {
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Define fetchContacts outside of useEffect
  const fetchContacts = async () => {
    if (connectionId) {
      setIsLoading(true);
      try {
        const response = await axios.get(`/api/contacts?connectionId=${connectionId}`);
        setContacts(response.data.contacts); // Assuming the response returns an array of contacts
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching contacts:', error);
        setIsLoading(false);
      }
    }
  };

  // Call fetchContacts inside useEffect
  useEffect(() => {
    fetchContacts();
  }, [connectionId]);

  if (!connectionId) {
    return (
      <div className={styles.contactList}>
        <p>Please complete Step 1 to connect an app and view contacts.</p>
      </div>
    );
  }

  return (
    <div className={styles.contactList}>
      <h2 className={styles.title}>Contacts</h2>
      {isLoading ? (
        <p className={styles.loading}>Loading contacts...</p>
      ) : (
        <div>
          {contacts.length > 0 ? (
            <ul className={styles.list}>
              {contacts.map(contact => (
                <li key={contact.id} className={styles.item}>
                  {contact.firstName} {contact.lastName}
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.noContacts}>No contacts found. Please try refreshing.</p>
          )}
          <button className={styles.refreshButton} onClick={fetchContacts} disabled={!connectionId || isLoading}>
            Refresh Contacts
          </button>
        </div>
      )}
    </div>
  );
}
```
    
3.  **Add CSS Styles** in `ContactList.module.css`:
    
  ```
  /* styles/ContactList.module.css */
.listContainer {
    margin: 2rem;
  }
  
  .contactItem {
    padding: 0.5rem;
    border-bottom: 1px solid #eee;
  }
  
  .refreshButton {
    background-color: #f0f0f0;
    border: 1px solid #ddd;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 1rem;
  }
  
  .refreshButton:hover {
    background-color: #e4e4e4;
  }
```

----------

#### Create a Contact (Step 3)

1.  **Open or Create `CreateContact.js` and `CreateContact.module.css`** in the `src/app/components/CreateContact` directory.
    
2.  **Implementing `CreateContact.js`**:
    
    -   This component allows users to add new contacts to their connected CRM system. It checks for a valid `connectionId` before enabling the contact creation functionality.
        
   ```
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
  if (!connectionId) {
    return (
      <div>
        <p>Please complete Step 1 to connect an app before adding contacts.</p>
      </div>
    );
  }

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
```
    
3.  **Add CSS Styles** in `CreateContact.module.css`:
    
  ```/* styles/ContactForm.module.css */
.formContainer {
    margin: 2rem;
    padding: 1rem;
    border: 1px solid #ccc;
    border-radius: 8px;
  }
  
  .label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
  }
  
  .input {
    margin-bottom: 1rem;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    width: 100%;
  }
  
  .button {
    background-color: #005eff;
    color: white;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .button:hover {
    background-color: #004ecc;
  }
  
```


### Step 5: Setting Up API Routes

In this step, you will set up the backend API routes for your Next.js application. These routes will allow your application to communicate with Alloy's API for fetching and creating contacts, and for retrieving JWT tokens.

#### 5.1: Create the Contacts API Route

1.  **Open or Create `pages/api/contacts.js`**:
    
    -   This file contains the logic for fetching and creating contacts.
2.  **Implement `pages/api/contacts.js`**:
    
    -   Set up GET and POST routes to handle fetching and creating contacts.
    -   Use Axios to make requests to Alloy's API with the provided API key.
        
    ```
    import axios from 'axios';
    
    const YOUR_API_KEY = process.env.ALLOY_API_KEY;
    
    export default async function handler(req, res) {
      const { method } = req;
      const connectionId = req.query.connectionId;
    
      if (!connectionId) {
        return res.status(400).json({ error: 'ConnectionId is required' });
      }
    
      switch (method) {
        case 'GET':
          try {
            const response = await axios.get(`https://embedded.runalloy.com/2023-12/one/crm/contacts?connectionId=${connectionId}`, {
              headers: {
                'Authorization': `bearer ${YOUR_API_KEY}`,
                'accept': 'application/json'
              }
            });
            res.json(response.data);
          } catch (error) {
            console.error('Error fetching contacts:', error);
            res.status(500).json({ error: 'Error fetching contacts' });
          }
          break;
    
        case 'POST':
          try {
            const response = await axios.post(`https://embedded.runalloy.com/2023-12/one/crm/contacts?connectionId=${connectionId}`, req.body, {
              headers: {
                'Authorization': `bearer ${YOUR_API_KEY}`,
                'accept': 'application/json',
                'content-type': 'application/json'
              }
            });
            res.json(response.data);
          } catch (error) {
            console.error('Error creating contact:', error);
            res.status(500).json({ error: 'Error creating contact' });
          }
          break;
    
        default:
          res.setHeader('Allow', ['GET', 'POST']);
          res.status(405).end(`Method ${method} Not Allowed`);
      }
    }
    ``` 
    

#### 5.2: Create the JWT Token API Route

1.  **Open or Create `pages/api/get-jwt-token.js`**:
    
    -   This file sets up the route to retrieve JWT tokens from Alloy's API.
2.  **Implement `pages/api/get-jwt-token.js`**:
    
    -   Implement the logic to generate JWT tokens needed for authentication with Alloy.
        
    ```
    import axios from 'axios';
    
    const YOUR_API_KEY = process.env.ALLOY_API_KEY;
    const userId = process.env.ALLOY_USER_ID;
    
    export default async function handler(req, res) {
      try {
        const response = await axios.get(`https://embedded.runalloy.com/2023-12/users/${userId}/token`, {
          headers: {
            'Authorization': `Bearer ${YOUR_API_KEY}`,
            'accept': 'application/json'
          }
        });
        res.status(200).json({ token: response.data.token });
      } catch (error) {
        console.error('Error generating JWT token:', error);
        res.status(500).json({ error: 'Error generating JWT token' });
      }
    }
    ```

### Step 6: Styling the Components

Add styles to `ConnectApp.module.css`, `ContactList.module.css`, and `CreateContact.module.css`.

### Step 7: Running the Application

1.  **Run the Development Server**:
        
    `npm run dev` 
    
    Visit `http://localhost:3000` to see your application.

### Conclusion

By completing this tutorial, you have built a CRM integration using Next.js and Alloy, gaining experience in connecting to Salesforce, managing contacts, and integrating front-end and back-end in a Next.js application.