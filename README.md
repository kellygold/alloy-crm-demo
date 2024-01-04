
## Building a CRM Integration with Next.js and Alloy!

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
    
    javascriptCopy code
    
    `// Full code for ContactList.js` 
    
3.  **Add CSS Styles** in `ContactList.module.css`:
    
    -   ContactList.module.css {paste your css here}

----------

#### Create a Contact (Step 3)

1.  **Open or Create `CreateContact.js` and `CreateContact.module.css`** in the `src/app/components/CreateContact` directory.
    
2.  **Implementing `CreateContact.js`**:
    
    -   This component allows users to add new contacts to their connected CRM system. It checks for a valid `connectionId` before enabling the contact creation functionality.
    
    javascriptCopy code
    
    `// Full code for CreateContact.js` 
    
3.  **Add CSS Styles** in `CreateContact.module.css`:
    
    -   CreateContact.module.css {paste your css here}

### Step 5: Setting Up API Routes

1.  **Create `pages/api/contacts.js`**:
    
    -   Set up GET and POST routes.
    -   Use Axios to communicate with Alloy's API.
2.  **Create `pages/api/get-jwt-token.js`**:
    
    -   Implement route to retrieve JWT token.

### Step 6: Styling the Components

Add styles to `ConnectApp.module.css`, `ContactList.module.css`, and `CreateContact.module.css`.

### Step 7: Running the Application

1.  **Run the Development Server**:
        
    `npm run dev` 
    
    Visit `http://localhost:3000` to see your application.

### Step 8: Building and Testing

1.  **Build the Application**:
        
    `npm run build` 
    
2.  **Test the Application**:
    
    -   Connect to Salesforce.
    -   List and refresh contacts.
    -   Add new contacts.

### Conclusion

By completing this tutorial, you have built a CRM integration using Next.js and Alloy, gaining experience in connecting to Salesforce, managing contacts, and integrating front-end and back-end in a Next.js application.