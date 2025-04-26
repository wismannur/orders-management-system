# Orders Management System

A complete CRUD application for managing orders using React, Firebase, and Tailwind CSS.

## Features

- **Order List Page**:
  - Display all orders
  - Search by order number
  - Filter by date range
  - Export to Excel (including large datasets)
  - Delete orders

- **Add/Edit Order Page**:
  - Create new orders
  - Edit existing orders
  - Dynamic product rows with auto-calculated subtotals
  - Auto-generated order numbers

## Tech Stack

- **Frontend**: React 19, Next.js 15
- **Backend**: Firebase (Firestore)
- **Styling**: Tailwind CSS 4, shadcn/ui components
- **State Management**: React Context API
- **Excel Export**: ExcelJS

## Installation

1. Clone the repository:

```bash
git clone https://github.com/wismannur/orders-management-system.git
cd orders-management-system
```

2. Install dependencies:

```bash
pnpm install
```

3. Create a `.env.local` file in the root directory with your Firebase configuration:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_DB_ID=your-db-id
```

## Firebase Setup

1. Create a new Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)

2. Enable Firestore Database:
   - Go to Firestore Database in the Firebase console
   - Click "Create database"
   - Start in production mode
   - Choose a location close to your users

3. Set up Firestore security rules:
   - Go to Firestore Database > Rules
   - Update the rules to allow read/write access:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Basic authentication check
    function isSignedIn() {
      return request.auth != null;
    }

    // Orders collection rules
    match /orders/{orderId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update: if isSignedIn();
      allow delete: if isSignedIn();
      
      // Order products subcollection
      match /orderProducts/{productId} {
        allow read: if isSignedIn();
        allow write: if isSignedIn() && 
                      request.resource.data.order_id == orderId;
      }
    }
    
    // Order products collection (top-level)
    match /orderProducts/{productId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn() && 
                     request.resource.data.order_id != null;
      allow update: if isSignedIn();
      allow delete: if isSignedIn();
    }
    
    // Counters collection for order numbers
    match /counters/{counterId} {
      allow read: if isSignedIn();
      allow write: if isSignedIn();
    }
  }
}
```

Note: These rules allow unrestricted access. For production, implement proper authentication and security rules.

4. Get your Firebase configuration:
   - Go to Project Settings > General
   - Scroll down to "Your apps" section
   - Click the web app icon (</>) if you haven't created one
   - Register your app
   - Copy the Firebase configuration object

## Running the Application

1. Start the development server:

```bash
pnpm run dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

You can deploy this application to Vercel:

1. Push your code to a GitHub repository

2. Connect your repository to Vercel

3. Add your environment variables in the Vercel project settings

4. Deploy!

## Project Structure

```
/src
  /app                  # Next.js app directory
    /orders             # Order pages
      /[action]         # Dynamic route for add/edit
      /edit/[id]        # Edit order route
      /new              # New order route
    layout.tsx          # Root layout
    page.tsx            # Order list page
  /components           # UI components
    /ui                 # shadcn/ui components
  /context              # React Context
    order-context.tsx   # Order context provider
    auth-context.tsx    # Authentication context
  /lib                  # Utility libraries
    firebase.ts         # Firebase configuration
  /types                # TypeScript types
    index.ts            # Type definitions
  /utils                # Utility functions
    excelExport.ts      # Excel export functionality
  /services             # API services
    order-service.ts    # Order-related API calls
```

## License

MIT
