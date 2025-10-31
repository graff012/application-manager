# Admin Seeding Setup

## How It Works

The application automatically creates an admin user on startup using credentials from your `.env` file.

## Setup Instructions

### 1. Add Admin Credentials to `.env`

```env
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=YourSecurePassword123
ADMIN_FULLNAME=System Administrator
```

### 2. Start the Application

```bash
npm run start
# or
npm run start:dev
```

### 3. Check the Logs

You should see:
```
✅ Admin user created successfully: admin@example.com
Admin ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

If admin already exists:
```
Admin user already exists: admin@example.com
```

## Login as Admin

### Postman Request

**POST** `http://localhost:3000/api/auth/admin/login`

**Body (JSON):**
```json
{
  "email": "admin@example.com",
  "password": "YourSecurePassword123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "role": "admin"
}
```

### Use the Token

Add to all subsequent requests:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Features

- ✅ **Auto-creates admin** on first startup
- ✅ **Skips if exists** - won't create duplicates
- ✅ **Secure password hashing** with bcrypt
- ✅ **JWT authentication** with 7-day expiry
- ✅ **Role-based access** - admin role for full access

## Notes

- Admin is created **once** when the app starts
- If you change the password in `.env`, the existing admin won't be updated
- To reset admin password, either:
  1. Delete the admin from MongoDB and restart the app
  2. Use the `PATCH /api/admins/:id` endpoint
