# Buy Box Mafia Backend

This is the backend server for the Buy Box Mafia application, providing API endpoints for user management, authentication, and other core functionalities.

## Features

- **User Management**: Create, read, update, and delete users with different roles (admin, subadmin, scout)
- **Authentication**: Firebase-based authentication with role-based access control
- **Email Notifications**: Automatic email sending for new user credentials
- **Role-based Access**: Different permissions for admin, subadmin, and scout users

## User Roles

1. **Admin**: Full system access, can manage all users and system settings
2. **Subadmin**: Can manage buyers and deals, limited system access
3. **Scout**: Basic user access for property scouting and deal submission

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the backend directory with the following variables:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=your-cert-url

# Email Configuration (for sending user credentials)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Server Configuration
PORT=3001
NODE_ENV=development
```

### 3. Firebase Setup

1. Download your Firebase service account key JSON file
2. Place it in the backend directory as `buybox-mafia-firebase-adminsdk-fbsvc-38d0d0b172.json`
3. Update the Firebase configuration in `utils/firebase.js` if needed

### 4. Email Setup (Gmail)

To enable email functionality for sending user credentials:

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
3. Use this app password in your `.env` file as `EMAIL_PASSWORD`

### 5. Setup Admin User

Run the admin setup script to create your first admin user:

```bash
node setup-admin.js your-email@example.com
```

This will:
- Set the user as admin in Firebase Auth
- Create the user in the Firestore "users" collection
- Set appropriate permissions

### 6. Start the Server

```bash
npm start
```

The server will start on port 3001 (or the port specified in your .env file).

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### User Management
- `POST /api/subadmin/add` - Create new user (subadmin/scout)
- `GET /api/subadmin/all` - Get all users (with optional role filter)
- `GET /api/subadmin/:id` - Get user by ID
- `PUT /api/subadmin/:id` - Update user
- `DELETE /api/subadmin/:id` - Delete user
- `POST /api/subadmin/:id/reset-password` - Reset user password

## User Management Flow

1. **Admin creates users**: Admin can create subadmin or scout users
2. **Email notification**: New users receive email with login credentials
3. **User login**: Users can log in with their email and password
4. **Role-based access**: Different features available based on user role

## Database Structure

### Users Collection
```javascript
{
  uid: "firebase-auth-uid",
  name: "User Name",
  email: "user@example.com",
  phone: "+1234567890",
  location: "New York, NY",
  role: "admin|subadmin|scout",
  permissions: ["read", "write", "admin"],
  status: "active|inactive",
  createdAt: "timestamp",
  createdBy: "admin-uid",
  updatedAt: "timestamp"
}
```

## Security Features

- Firebase Authentication for secure user management
- Role-based access control
- Password hashing with bcrypt
- Secure email transmission
- Input validation and sanitization

## Development

### Running in Development Mode

```bash
npm run dev
```

### Testing

```bash
node test-subadmin.js
```

## Troubleshooting

### Email Issues
- Ensure Gmail app password is correctly set
- Check that 2-factor authentication is enabled
- Verify email credentials in .env file

### Firebase Issues
- Verify service account key is properly configured
- Check Firebase project ID matches your project
- Ensure Firestore rules allow read/write access

### User Creation Issues
- Check if user already exists in Firebase Auth
- Verify all required fields are provided
- Check Firestore permissions

## Support

For issues or questions, please check the Firebase console logs and server console output for detailed error messages. 