# 📋 Ariza Manager - Backend API

> A complete NestJS application for managing workplace requests (Ariza), inventory, and employee assignments with full history tracking.

## 🚀 What is This Project?

Ariza Manager is a backend API built with **NestJS** (TypeScript) that helps organizations manage:
- **Applications (Ariza)** - User requests/tickets with status tracking
- **Inventory** - Asset management with assignment history and QR code integration
- **Users & Employees** - User profiles and employee management
- **Organizations** - Branches and departments structure

**Key Features:**
- 🔐 JWT Authentication (Users, Employees, Admins)
- 📁 File uploads to local "/uploads" folder
- 📊 Complete history tracking for all changes
- 🔔 Telegram notifications (optional)
- 🌐 Real-time updates via WebSocket
- 📖 Auto-generated API documentation (Swagger)

---

## 📦 Tech Stack

- **Framework:** NestJS 11.x (Node.js + TypeScript)
- **Database:** MongoDB (with Mongoose ODM)
- **Storage:** Local filesystem (project root `/uploads`)
- **Authentication:** JWT (JSON Web Tokens)
- **Validation:** class-validator + class-transformer
- **Real-time:** Socket.IO (WebSocket)
- **Notifications:** Telegram Bot API
- **Documentation:** Swagger/OpenAPI

---

## 🛠️ Installation & Setup

### Prerequisites

Make sure you have installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (local or Atlas cloud)

### Step 1: Clone & Install

```bash
# Clone the repository
git clone <repository-url>
cd application-manager

# Install dependencies
npm install
```

### Step 2: Environment Configuration

Create a `.env` file in the root directory:

```bash
# Copy example file
cp .env.example .env
```

Edit `.env` with your actual values:

```ini
# Database
MONGO_URI=mongodb://localhost:27017/ariza-db
# Or use MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ariza-db

# Server
PORT=3000

# JWT Secret (use a strong random string)
JWT_SECRET=your_super_secret_jwt_key_change_this

# No S3 needed — images saved to local uploads/

# Telegram (Optional - leave empty to disable)
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
TELEGRAM_CHAT_ID=your_chat_id

# Admin User (Auto-created on startup)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=SecurePassword123
ADMIN_FULLNAME=System Administrator
```

### Step 3: Run the Application

```bash
# Development mode (with hot reload)
npm run start:dev

# Production mode
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

### Step 4: Access the API

- **API Base URL:** `http://localhost:3000/api`
- **Swagger Docs:** `http://localhost:3000/docs`
- **Health Check:** `http://localhost:3000/api` (returns "Hello World!")

✅ If you see Swagger docs, you're ready to go!

---

## 📂 Project Structure & Modules

The application is organized into modules, each handling specific functionality:

```
src/
├── admins/              # Admin user management
├── applications/        # Application (Ariza) requests
├── auth/                # Authentication & JWT
├── branches/            # Organization branches
├── database/            # Database seeding
├── departments/         # Departments within branches
├── employees/           # Employee management
├── inventory/           # Inventory/Asset management
├── tools/               # Tools (requirements for inventory)
├── positions/           # Employee positions & permissions
├── telegram/            # Telegram bot integration
├── users/               # End-user management
├── app.module.ts        # Main application module
└── main.ts              # Application entry point
```

### Module Breakdown

#### 1. **Users Module** (`src/users/`)
**Purpose:** Manage end-users (clients/employees who submit requests)

**What it does:**
- Create users with unique table numbers
- User profile management (phone, gender)
- Track profile completion status
- Maintain inventory assignment history

**Key Endpoints:**
- `POST /api/users` - (Admin only) Create new user
- `GET /api/users` - List all users
- `PATCH /api/users/profile` - Update user profile (JWT required)

**Schema Fields:**
```typescript
{
  _id: ObjectId,           // MongoDB primary key
  tableNumber: number,     // Unique identifier (used for login)
  fullName: string,
  phone: string,           // Required phone number (9 digits)
  passportNumber: string,  // Required passport number (14 digits, jshshir)
  gender?: string,         // 'male' | 'female' | 'other'
  profileComplete: boolean, // Auto-set when required fields are provided
  branch: ObjectId,        // Reference to Branch
  department: ObjectId,    // Reference to Department
  inventoryHistory: []     // History of inventory assignments
}
```

---

#### 2. **Applications Module** (`src/applications/`)
**Purpose:** Handle user requests/tickets (Ariza) with full lifecycle tracking

**What it does:**
- Create applications with auto-generated index (#00001-2025)
- Track status changes (new → assigned → progressing → completed/rejected)
- Assign applications to employees
- Maintain complete history of all changes
- Upload supporting images to local storage
- Send Telegram notifications

**Key Endpoints:**
- `POST /api/applications` - Create application (with file upload)
- `GET /api/applications` - List all applications
- `GET /api/applications/:id` - Get single application with history
- `PATCH /api/applications/:id/assign` - Assign to employee
- `PATCH /api/applications/:id/status` - Update status

**Schema Fields:**
```typescript
{
  _id: ObjectId,
  index: string,           // Auto-generated: "00001-2025"
  status: string,          // 'new' | 'assigned' | 'progressing' | 'completed' | 'rejected'
  user: ObjectId,          // Who created it
  branch: ObjectId,
  department: ObjectId,
  room: string,            // Room/location
  issue: string,           // Problem description
  issueComment?: string,
  images: string[],        // File paths (relative to `/uploads`)
  inventory?: ObjectId,    // Related inventory item
  assignedTo?: ObjectId,   // Assigned employee
  history: [{              // Complete audit trail
    status: string,
    changedBy: ObjectId,   // User or Employee
    changedByModel: string, // 'User' | 'Employee'
    changedAt: Date,
    comment?: string
  }]
}
```

**History Tracking:**
- ✅ Auto-creates history on application creation
- ✅ Tracks who assigned it to whom
- ✅ Records every status change with timestamp
- ✅ Populates full names in responses

---

#### 3. **Inventory Module** (`src/inventory/`)
**Purpose:** Manage organizational assets with assignment and status tracking

**What it does:**
- Register assets with unique inventory numbers
- Track asset status (active/repair/broken)
- Assign assets to users
- Generate and manage QR codes for quick asset identification
- Maintain complete history of assignments and status changes
- Upload asset images to local storage

**Key Endpoints:**
- `POST /api/inventory` - Create inventory item (with file upload)
- `GET /api/inventory` - List all inventory
- `GET /api/inventory/:id` - Get single item with history
- `PATCH /api/inventory/:id` - Update item (status, assignment, etc.)
- `GET /api/inventory/qr/:inventoryNumber` - Get inventory details via QR code
- `GET /api/inventory/qrcode/:inventoryNumber/download` - Download QR code image

**Schema Fields:**
```typescript
{
  _id: ObjectId,
  name: string,            // Asset name (e.g., "Canon MF3010")
  inventoryNumber: string, // Unique ID (e.g., "2000102")
  serial?: string,         // Serial number (optional)
  images: string[],        // Local image file paths
  qrCodeUrl?: string,      // Path to generated QR code image
  assignedTo?: ObjectId,   // Current user
  tags?: ObjectId[],       // Optional special tags linked from Tags module
  tools?: ObjectId[],      // Optional tools linked from Tools module
  branch?: ObjectId,
  department?: ObjectId,
  status: string,          // 'active' | 'repair' | 'broken'
  history: [{              // Complete audit trail
    action: string,        // 'assigned' | 'repair' | 'returned' | 'broken'
    by: ObjectId,          // User or Employee who made change
    byModel: string,       // 'User' | 'Employee'
    at: Date,
    comment?: string
  }]
}
```

**History Tracking:**
- ✅ Auto-creates history on inventory creation
- ✅ Tracks all assignments and reassignments
- ✅ Records status changes (repair, broken, etc.)
- ✅ Logs who made each change
- ✅ Generates QR code on inventory creation
- ✅ QR codes link to inventory details page
- ✅ Downloadable QR code images for printing
 - ✅ Supports optional special tags and tools references

---

#### 4. **Tools Module** (`src/tools/`)
**Purpose:** Manage tools that are required for or associated with inventory

**What it does:**
- Register tools with unique tool numbers
- Optionally track tool serial numbers
- Allow employees/admins to manage tool catalog

**Key Endpoints:**
- `POST /api/tools` - Create tool
- `GET /api/tools` - List all tools
- `GET /api/tools/:id` - Get a single tool
- `PATCH /api/tools/:id` - Update tool
- `DELETE /api/tools/:id` - Delete tool

**Schema Fields:**
```typescript
{
  _id: ObjectId,
  name: string,        // Tool name (e.g., "Screwdriver set")
  toolNumber: string,  // Unique tool number (e.g., "TL-0001")
  serial?: string,     // Optional serial/serie number
  createdAt: Date,     // Auto-generated by Mongoose timestamps
  updatedAt: Date,     // Auto-generated by Mongoose timestamps
}
```

---

#### 5. **Employees Module** (`src/employees/`)
**Purpose:** Manage employees who handle applications

**What it does:**
- Create employee accounts with email/password
- Assign positions with specific permissions
- Track assigned applications
- WebSocket gateway for real-time notifications

**Key Endpoints:**
- `POST /api/employees` - (Admin only) Create employee
- `GET /api/employees` - List all employees
- `GET /api/applications/assigned` - Get my assigned applications

**Schema Fields:**
```typescript
{
  _id: ObjectId,
  fullName: string,
  email: string,           // Unique, used for login
  password: string,        // Hashed with bcrypt
  position: ObjectId,      // Reference to Position
  status: string,          // 'active' | 'inactive'
  branch?: ObjectId,
  department?: ObjectId,
  phone: string,           // Required phone number (9 digits)
  passportNumber: string,  // Required passport number (14 digits, jshshir)
  assignedApplications: ObjectId[], // Array of application IDs
  role: string             // 'employee' (default)
}
```

---

#### 5. **Auth Module** (`src/auth/`)
**Purpose:** Handle authentication for all user types

**What it does:**
- User login (by tableNumber, no password)
- Employee/Admin login (email + password)
- JWT token generation and validation
- Role-based access control

**Key Endpoints:**
- `POST /api/auth/login` - User login (tableNumber)
- `POST /api/auth/admin/login` - Employee/Admin login (email + password)

**Authentication Flow:**
```
User Login:
  tableNumber → JWT (userId, tableNumber)

Employee/Admin Login:
  email + password → bcrypt verify → JWT (userId, email, role)
```

---

#### 6. **Branches & Departments Modules**
**Purpose:** Organize users and employees by location and department

**Branches** (`src/branches/`):
- `POST /api/branches` - (Admin only) Create branch
- `GET /api/branches` - List branches

**Departments** (`src/departments/`):
- `POST /api/departments` - (Admin only) Create department
- `GET /api/departments` - List departments

---

#### 7. **Positions Module** (`src/positions/`)
**Purpose:** Define employee roles with specific permissions

**What it does:**
- Create positions (e.g., "Technician", "Manager")
- Define permissions for each position
- Control what status changes employees can make

**Permissions Example:**
```typescript
{
  name: "Technician",
  permissions: [
    "change_to_progressing",
    "change_to_completed"
  ]
}
```

---

#### 8. **Admins Module** (`src/admins/`)
**Purpose:** Super admin management

**What it does:**
- Auto-create admin user on startup (from .env)
- Full access to all endpoints
- Manage other admins

---

#### 9. **Telegram Module** (`src/telegram/`)
**Purpose:** Send notifications to Telegram

**What it does:**
- Send notifications when applications are created
- Send notifications when status changes
- Optional - can be disabled by leaving TELEGRAM_CHAT_ID empty

---

#### 10. **Database Module** (`src/database/`)
**Purpose:** Database initialization and seeding

**What it does:**
- Auto-create admin user on first startup
- Check if admin already exists (no duplicates)
- Uses credentials from .env file

---

## 🔐 Authentication & Authorization

### Three Types of Users:

1. **Users (Clients)**
   - Login with `tableNumber` only (no password)
   - Can create applications
   - Can update their own profile
   - Limited access

2. **Employees**
   - Login with email + password
   - Can be assigned applications
   - Can update application status (based on position permissions)
   - Can manage inventory

3. **Admins**
   - Login with email + password
   - Full access to everything
   - Only admins can create/update/delete: branches, departments, positions, employees, users (except self-profile update by users).
   - Auto-created on startup from .env

### How JWT Works:

```
1. User/Employee logs in
2. Server validates credentials
3. Server generates JWT token
4. Client stores token
5. Client sends token in Authorization header for protected routes
6. Server validates token and extracts user info
```

**Protected Routes:**
Add `Authorization: Bearer <token>` header to requests

---

## 🧪 Testing with Postman

### Setup Postman

1. **Import Swagger to Postman:**
   - Open Postman
   - Click "Import" → "Link"
   - Enter: `http://localhost:3000/docs-json`
   - All endpoints will be imported automatically!

2. **Create Environment Variables:**
   - Click "Environments" → "Create Environment"
   - Add variables:
     ```
     base_url = http://localhost:3000
     user_token = (will be set after login)
     employee_token = (will be set after login)
     admin_token = (will be set after login)
     ```

### Complete Testing Flow

#### Step 1: Create Organization Structure

**1.1 Create Branch (Admin only — must use admin_token)**
```http
POST {{base_url}}/api/branches
Content-Type: application/json

{
  "name": "Head Office"
}
```
Save the returned `_id` as `branch_id`

**1.2 Create Department (Admin only — must use admin_token)**
```http
POST {{base_url}}/api/departments
Content-Type: application/json

{
  "name": "IT Department",
  "branch": "{{branch_id}}"
}
```
Save the returned `_id` as `department_id`

---

#### Step 2: Create Users

**2.1 Create a User**
```http
POST {{base_url}}/api/users
Content-Type: application/json

{
  "tableNumber": 101,
  "fullName": "John Doe",
  "branch": "{{branch_id}}",
  "department": "{{department_id}}"
}
```
Save the returned `id` as `user_id`

**2.2 Login as User**
```http
POST {{base_url}}/api/auth/login
Content-Type: application/json

{
  "tableNumber": 101
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
Copy the `access_token` and save it as `user_token` in your environment

**2.3 Update User Profile**
```http
PATCH {{base_url}}/api/users/profile
Authorization: Bearer {{user_token}}
Content-Type: application/json

{
  "phone": "+998901234567",
  "gender": "male"
}
```

---

#### Step 3: Login as Admin

```http
POST {{base_url}}/api/auth/admin/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "SecurePassword123"
}
```
(Use the credentials from your .env file)

Save the `access_token` as `admin_token`

---

#### Step 4: Create Employee

**4.1 Create Position First**
```http
POST {{base_url}}/api/positions
Authorization: Bearer {{admin_token}}
Content-Type: application/json

Format change_to_<status>

Valid permissions (exact strings):

change_to_new
change_to_assigned
change_to_progressing
change_to_completed
change_to_rejected

{
  "name": "Technician",
  "permissions": [
    "change_to_assigned",
    "change_to_progressing",
    "change_to_completed"
  ]
}
```
Save the returned `_id` as `position_id`

**4.2 Create Employee**
```http
POST {{base_url}}/api/employees
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
  "fullName": "Jane Smith",
  "email": "jane@example.com",
  "password": "password123",
  "position": "{{position_id}}",
  "status": "active" or "inactive"
  "branch": "{{branch_id}}",
  "department": "{{department_id}}"
}
```

**4.3 Login as Employee**
```http
POST {{base_url}}/api/auth/admin/login
Content-Type: application/json

{
  "email": "jane@example.com",
  "password": "password123"
}
```
Save the `access_token` as `employee_token`

---

#### Step 5: Create Application (with File Upload)

```http
POST {{base_url}}/api/applications
Authorization: Bearer {{user_token}}
Content-Type: multipart/form-data

# In Postman:
# 1. Select "Body" → "form-data"
# 2. Add fields:
user: {{user_id}}
branch: {{branch_id}}
department: {{department_id}}
room: 201
issue: Printer not working
issueComment: Paper jam error
images: [Select File] (can add multiple)
```

**Response includes history:**
```json
{
  "id": "...",
  "index": "00001-2025",
  "status": "new",
  "history": [
    {
      "status": "new",
      "changedBy": "...",
      "changedByModel": "User",
      "changedAt": "2025-10-31T06:12:00.000Z",
      "comment": "Ariza yaratildi"
    }
  ]
}
```
Save the `id` as `application_id`

---

#### Step 6: Assign Application to Employee

```http
PATCH {{base_url}}/api/applications/{{application_id}}/assign
Authorization: Bearer {{employee_token}}
```

This will:
- Set `assignedTo` to the employee
- Change status to "assigned"
- Add history entry
- Send WebSocket notification
- Send Telegram notification (if configured)

---

#### Step 7: Update Application Status

```http
PATCH {{base_url}}/api/applications/{{application_id}}/status
Authorization: Bearer {{employee_token}}
Content-Type: application/json

{
  "status": "progressing"
}
```

---

#### Step 8: Get Application with Full History

```http
GET {{base_url}}/api/applications/{{application_id}}
Authorization: Bearer {{user_token}}
```

**Response shows complete history:**
```json
{
  "id": "...",
  "index": "00001-2025",
  "status": "progressing",
  "user": {
    "fullName": "John Doe"
  },
  "assignedTo": {
    "fullName": "Jane Smith"
  },
  "history": [
    {
      "status": "new",
      "changedBy": { "fullName": "John Doe" },
      "changedByModel": "User",
      "changedAt": "2025-10-31T06:12:00.000Z",
      "comment": "Ariza yaratildi"
    },
    {
      "status": "assigned",
      "changedBy": { "fullName": "Jane Smith" },
      "changedByModel": "Employee",
      "changedAt": "2025-10-31T06:15:00.000Z",
      "comment": "Assigned to Jane Smith"
    },
    {
      "status": "progressing",
      "changedBy": { "fullName": "Jane Smith" },
      "changedByModel": "Employee",
      "changedAt": "2025-10-31T06:20:00.000Z",
      "comment": "Status changed by Jane Smith"
    }
  ]
}
```

---

#### Step 9: Create Inventory Item

```http
POST {{base_url}}/api/inventory
Authorization: Bearer {{employee_token}}
Content-Type: multipart/form-data

# In Postman form-data:
name: Canon MF3010 Printer
inventoryNumber: 2000102
serial: SN123456789
user: {{user_id}}
branch: {{branch_id}}
department: {{department_id}}
images: [Select File]
```

Save the returned `_id` as `inventory_id`

---

#### Step 10: Access Inventory via QR Code

1. **Scan the QR Code**
   - QR codes are automatically generated when a new inventory item is created
   - The QR code contains a URL to view the inventory details
   - Example URL: `https://yourapp.com/api/inventory/qr/2000102`

2. **Download QR Code**
   ```http
   GET {{base_url}}/api/inventory/qrcode/{{inventory_number}}/download
   Authorization: Bearer {{employee_token}}
   ```
   - This will download the QR code image file
   - The QR code can be printed and attached to the physical asset

#### Step 11: Update Inventory Status

```http
PATCH {{base_url}}/api/inventory/{{inventory_id}}
Authorization: Bearer {{employee_token}}
Content-Type: application/json

{
  "status": "repair"
}
```

This adds a history entry automatically!

---

#### Step 12: Get Inventory with History

```http
GET {{base_url}}/api/inventory/{{inventory_id}}
Authorization: Bearer {{employee_token}}
```

**Response:**
```json
{
  "id": "...",
  "name": "Canon MF3010 Printer",
  "inventoryNumber": "2000102",
  "status": "repair",
  "assignedTo": {
    "fullName": "John Doe"
  },
  "history": [
    {
      "action": "assigned",
      "by": { "fullName": "Jane Smith" },
      "byModel": "Employee",
      "at": "2025-10-31T06:25:00.000Z",
      "comment": "Initial assignment"
    },
    {
      "action": "repair",
      "by": { "fullName": "Jane Smith" },
      "byModel": "Employee",
      "at": "2025-10-31T06:30:00.000Z",
      "comment": "Status changed to repair"
    }
  ]
}
```

---

### Quick Postman Tips

**Save Tokens Automatically:**
In Postman, add this to the "Tests" tab of login requests:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("user_token", response.access_token);
}
```

**Use Authorization Tab:**
- Select "Bearer Token" type
- Enter `{{user_token}}` or `{{employee_token}}`

**File Uploads:**
- Use "form-data" in Body tab
- For file fields, change type from "Text" to "File"
- Can upload multiple files with same key name

---

## 📚 Additional Documentation

- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Detailed technical overview of v2.0 features
- **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - Database migration instructions
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Comprehensive testing scenarios
- **[CHANGELOG.md](./CHANGELOG.md)** - Version history and changes
- **[ADMIN_SETUP.md](./ADMIN_SETUP.md)** - Admin user setup guide

---

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Development mode (with hot reload)
npm run start:dev

# Production build
npm run build
npm run start:prod

# Debug mode
npm run start:debug

# Format code
npm run format

# Lint code
npm run lint

# Run tests
npm run test
npm run test:watch
npm run test:cov
```

---

## 🚀 Deployment

### Production Checklist

Before deploying to production:

- [ ] Set strong `JWT_SECRET` in .env
- [ ] Use MongoDB Atlas (not local MongoDB)
- [ ] Configure AWS S3 bucket with proper permissions
- [ ] Set strong admin password
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up monitoring and logging
- [ ] Backup database regularly
- [ ] Test all endpoints
- [ ] Review security settings

### Environment Variables for Production

```ini
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/ariza-db
PORT=3000
JWT_SECRET=<strong-random-secret>
AWS_S3_ACCESS_KEY_ID=<your-key>
AWS_S3_SECRET_ACCESS_KEY=<your-secret>
AWS_S3_REGION=us-east-1
AWS_S3_BUCKET_NAME=<your-bucket>
TELEGRAM_BOT_TOKEN=<optional>
TELEGRAM_CHAT_ID=<optional>
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=<strong-password>
```

---

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Failed**
- Check `MONGO_URI` in .env
- Ensure MongoDB is running (local) or accessible (Atlas)
- Verify network/firewall settings

**JWT Token Invalid**
- Ensure `JWT_SECRET` is set in .env
- Check token hasn't expired
- Verify Authorization header format: `Bearer <token>`

**File Upload Fails**
- Verify AWS credentials in .env
- Check S3 bucket exists and has correct permissions
- Ensure bucket region matches `AWS_S3_REGION`

**Admin Login Fails**
- Check credentials in .env match login request
- Verify admin was created (check startup logs)
- Password is case-sensitive

**Swagger Not Loading**
- Ensure app is running on correct port
- Check `http://localhost:3000/docs` (not `/api/docs`)
- Clear browser cache

---

## 📖 Learning Resources

### NestJS Resources
- [NestJS Documentation](https://docs.nestjs.com)
- [NestJS Discord](https://discord.gg/G7Qnnhy)
- [NestJS Courses](https://courses.nestjs.com/)

### MongoDB Resources
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)

### AWS S3 Resources
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is **UNLICENSED** - Private project

---

## 👥 Support

For questions or issues:
- Check the documentation files in the project root
- Review the Swagger API docs at `/docs`
- Contact the development team

---

**Built with ❤️ using NestJS**
