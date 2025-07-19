# Buy Box Mafia Backend

## Subadmin Management System

This backend provides comprehensive subadmin management functionality with email notifications.

### Features

- ✅ Create subadmin accounts with automatic password generation
- ✅ Send welcome emails with login credentials
- ✅ Manage subadmin permissions and roles
- ✅ Reset subadmin passwords
- ✅ Full CRUD operations for subadmin management
- ✅ Firebase Authentication integration
- ✅ Firestore database storage

### Setup Instructions

#### 1. Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Server Configuration
PORT=3001

# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id

# Email Configuration (for nodemailer)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:5173
```

#### 2. Email Setup (Gmail)

To use Gmail for sending emails:

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
3. Use this app password in your `EMAIL_PASSWORD` environment variable

#### 3. Firebase Setup

Ensure your Firebase project has:

1. **Authentication** enabled
2. **Firestore Database** enabled
3. **Service Account** key file in the backend directory
4. **Custom Claims** support for role-based access

### API Endpoints

#### Subadmin Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/subadmin/add` | Create new subadmin | Admin |
| GET | `/api/subadmin/all` | Get all subadmins | Admin |
| GET | `/api/subadmin/:id` | Get subadmin by ID | Admin |
| PUT | `/api/subadmin/:id` | Update subadmin | Admin |
| DELETE | `/api/subadmin/:id` | Delete subadmin | Admin |
| POST | `/api/subadmin/:id/reset-password` | Reset password | Admin |

#### Request Examples

**Create Subadmin:**
```json
POST /api/subadmin/add
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "role": "subadmin",
  "permissions": ["read", "write", "delete"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subadmin created successfully",
  "data": {
    "uid": "firebase-user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "emailSent": true
  }
}
```

### Firebase Configuration

#### 1. Authentication Rules

Ensure your Firebase Authentication allows:
- User creation with custom claims
- Role-based access control

#### 2. Firestore Collections

The system uses the following Firestore collection:
- `subadmins` - Stores subadmin profile data

#### 3. Custom Claims

Subadmins are created with custom claims:
```javascript
{
  role: "subadmin",
  permissions: ["read", "write"]
}
```

### Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT token verification
- ✅ Role-based access control
- ✅ Input validation
- ✅ Secure email transmission
- ✅ Firebase security rules integration

### Error Handling

The API includes comprehensive error handling for:
- Invalid input data
- Firebase authentication errors
- Email sending failures
- Database operation errors
- Authorization failures

### Email Templates

The system sends professionally formatted HTML emails with:
- Buy Box Mafia branding
- Login credentials
- Security reminders
- Direct links to admin dashboard 