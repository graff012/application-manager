# 📖 Swagger API Documentation Guide

## 🎯 What is Swagger?

Swagger (OpenAPI) is an **interactive API documentation** tool that's already built into this project. It allows you to:
- ✅ View all available endpoints
- ✅ See request/response schemas
- ✅ Test APIs directly in your browser
- ✅ No Postman needed for basic testing!

---

## 🚀 Accessing Swagger

### Step 1: Start the Application

```bash
npm run start:dev
```

Wait for the message:
```
[Nest] Application successfully started
[Nest] Listening on port 3000
```

### Step 2: Open Swagger UI

Open your browser and go to:
```
http://localhost:3000/docs
```

You should see the Swagger UI interface with all your API endpoints! 🎉

---

## 🎨 Understanding the Swagger Interface

### Main Components

```
┌─────────────────────────────────────────────┐
│  Ariza Manager API                          │  ← Title
│  Version 1.0                                │
├─────────────────────────────────────────────┤
│  Servers                                    │
│  http://localhost:3000                      │  ← Base URL
├─────────────────────────────────────────────┤
│  📁 admins                                  │  ← Module groups
│  📁 applications                            │
│  📁 auth                                    │
│  📁 branches                                │
│  📁 departments                             │
│  📁 employees                               │
│  📁 inventory                               │
│  📁 positions                               │
│  📁 users                                   │
└─────────────────────────────────────────────┘
```

### Endpoint Information

Each endpoint shows:
- **HTTP Method** (GET, POST, PATCH, DELETE) with color coding
- **Endpoint Path** (e.g., `/api/users`)
- **Description** of what it does
- **🔒 Lock Icon** = Requires JWT authentication

---

## 🔧 How to Test APIs with Swagger

### Example 1: Create a Branch (No Auth Required)

**Step 1:** Find the `branches` section and click to expand

**Step 2:** Click on `POST /api/branches`

**Step 3:** Click the **"Try it out"** button (top right)

**Step 4:** Edit the request body:
```json
{
  "name": "Head Office"
}
```

**Step 5:** Click **"Execute"** button

**Step 6:** See the response below:
```json
{
  "_id": "673c1234567890abcdef1234",
  "id": "uuid-here",
  "name": "Head Office",
  "createdAt": "2025-11-03T05:34:00.000Z",
  "updatedAt": "2025-11-03T05:34:00.000Z"
}
```

✅ **Success!** Copy the `_id` for later use.

---

### Example 2: Create a User (No Auth Required)

**Step 1:** Expand the `users` section

**Step 2:** Click on `POST /api/users`

**Step 3:** Click **"Try it out"**

**Step 4:** Fill in the request body:
```json
{
  "tableNumber": 101,
  "fullName": "John Doe",
  "branch": "673c1234567890abcdef1234",
  "department": "673c1234567890abcdef5678"
}
```
(Use the branch `_id` from previous step)

**Step 5:** Click **"Execute"**

**Step 6:** Copy the returned user `id` (UUID format)

---

### Example 3: Login and Get JWT Token

**Step 1:** Expand the `auth` section

**Step 2:** Click on `POST /api/auth/login`

**Step 3:** Click **"Try it out"**

**Step 4:** Enter the request body:
```json
{
  "tableNumber": 101
}
```

**Step 5:** Click **"Execute"**

**Step 6:** Copy the `access_token` from response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLWlkIiwiaWF0IjoxNjk5..."
}
```

---

### Example 4: Using JWT Token for Protected Endpoints

**Step 1:** Click the **"Authorize"** button at the top right of Swagger UI

**Step 2:** A modal will appear with "Available authorizations"

**Step 3:** In the "Value" field, paste your token:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLWlkIiwiaWF0IjoxNjk5...
```

**Step 4:** Click **"Authorize"** button

**Step 5:** Click **"Close"**

✅ **Now you're authenticated!** All endpoints with 🔒 will use this token automatically.

---

### Example 5: Update User Profile (Requires Auth)

**Step 1:** Make sure you're authorized (see Example 4)

**Step 2:** Expand the `users` section

**Step 3:** Click on `PATCH /api/users/profile` (has 🔒 icon)

**Step 4:** Click **"Try it out"**

**Step 5:** Enter the request body:
```json
{
  "phone": "+998901234567",
  "gender": "male"
}
```

**Step 6:** Click **"Execute"**

**Step 7:** See the updated user with `profileComplete: true`

---

### Example 6: Create Application with File Upload

**Step 1:** Make sure you're authorized

**Step 2:** Expand the `applications` section

**Step 3:** Click on `POST /api/applications`

**Step 4:** Click **"Try it out"**

**Step 5:** Fill in the form fields:
- `user`: Your user ID
- `branch`: Your branch ID
- `department`: Your department ID
- `room`: "201"
- `issue`: "Printer not working"
- `issueComment`: "Paper jam"
- `images`: Click "Choose Files" and select images

**Step 6:** Click **"Execute"**

**Step 7:** See the created application with auto-generated `index` and initial `history` entry

---

## 🔐 Authentication in Swagger

### Three Ways to Authenticate

#### 1. **Global Authorization (Recommended)**
Click the **"Authorize"** button at the top and enter your token once. All protected endpoints will use it.

#### 2. **Per-Endpoint Authorization**
Each protected endpoint has a 🔒 icon. Click it to enter token for that specific request.

#### 3. **Manual Header**
In the "Try it out" section, you can manually add:
```
Authorization: Bearer your_token_here
```

---

## 📚 Understanding Swagger Schemas

### Request Body Schema

When you click "Try it out", you'll see an example request body:

```json
{
  "tableNumber": 0,        ← number type
  "fullName": "string",    ← string type
  "branch": "string",      ← MongoDB ObjectId (string format)
  "department": "string"   ← MongoDB ObjectId (string format)
}
```

**Field Indicators:**
- **Red asterisk (*)** = Required field
- **No asterisk** = Optional field
- **Type shown** = Data type expected

### Response Schema

Below each endpoint, you'll see possible responses:

```
Responses
  200 - Successful Response
    ↓ Click to expand
    {
      "id": "string",
      "tableNumber": 0,
      "fullName": "string",
      ...
    }
  
  400 - Bad Request
  401 - Unauthorized
  404 - Not Found
```

---

## 🎯 Complete Testing Workflow in Swagger

### Scenario: Create and Track an Application

**Step 1: Setup Organization**
```
1. POST /api/branches → Create "Head Office"
2. POST /api/departments → Create "IT Department"
```

**Step 2: Create User**
```
3. POST /api/users → Create user with tableNumber 101
```

**Step 3: Login**
```
4. POST /api/auth/login → Get JWT token
5. Click "Authorize" → Paste token
```

**Step 4: Update Profile**
```
6. PATCH /api/users/profile → Add phone and gender
```

**Step 5: Create Application**
```
7. POST /api/applications → Submit request with images
```

**Step 6: Login as Admin**
```
8. POST /api/auth/admin/login → Get admin token
9. Click "Authorize" → Update with admin token
```

**Step 7: Create Employee**
```
10. POST /api/positions → Create "Technician" position
11. POST /api/employees → Create employee account
```

**Step 8: Login as Employee**
```
12. POST /api/auth/admin/login → Get employee token
13. Click "Authorize" → Update with employee token
```

**Step 9: Assign Application**
```
14. PATCH /api/applications/{id}/assign → Assign to yourself
```

**Step 10: Update Status**
```
15. PATCH /api/applications/{id}/status → Change to "progressing"
```

**Step 11: View History**
```
16. GET /api/applications/{id} → See complete history
```

---

## 💡 Pro Tips for Using Swagger

### 1. **Keep Multiple Browser Tabs**
- Tab 1: Swagger UI for testing
- Tab 2: MongoDB Compass to see database changes
- Tab 3: Application logs (terminal)

### 2. **Use Browser DevTools**
- Press F12 to open DevTools
- Go to "Network" tab
- See actual HTTP requests Swagger makes
- Copy as cURL for command-line testing

### 3. **Save Common IDs**
Keep a notepad with:
```
branch_id: 673c1234567890abcdef1234
department_id: 673c1234567890abcdef5678
user_id: uuid-here
application_id: uuid-here
```

### 4. **Test Error Cases**
Try invalid data to see error responses:
- Missing required fields
- Invalid ObjectId format
- Expired JWT token
- Wrong data types

### 5. **Download Swagger JSON**
Get the raw API specification:
```
http://localhost:3000/docs-json
```
Use this to import into Postman or other tools.

---

## 🔄 Importing Swagger to Postman

If you prefer Postman over Swagger UI:

**Step 1:** Open Postman

**Step 2:** Click "Import" button

**Step 3:** Select "Link" tab

**Step 4:** Enter:
```
http://localhost:3000/docs-json
```

**Step 5:** Click "Continue" → "Import"

✅ All endpoints are now in Postman!

---

## 🎨 Swagger UI Features

### 1. **Models Section**
Scroll to the bottom to see all data schemas:
- User
- Application
- Inventory
- Branch
- Department
- Employee
- Position
- Admin

Click any model to see its structure.

### 2. **Servers Dropdown**
Change the base URL if testing different environments:
- `http://localhost:3000` (Development)
- `https://api.example.com` (Production)

### 3. **Response Headers**
After executing a request, see response headers:
- `Content-Type`
- `Content-Length`
- `Date`
- etc.

### 4. **Request Duration**
See how long each request takes (shown in milliseconds).

### 5. **Download Response**
Click "Download" to save response as JSON file.

---

## 🐛 Troubleshooting Swagger

### Issue: Swagger Page Not Loading

**Solution:**
```bash
# Check if app is running
curl http://localhost:3000/api

# Check correct URL
http://localhost:3000/docs  ✅ Correct
http://localhost:3000/api/docs  ❌ Wrong
```

### Issue: "Authorize" Button Not Working

**Solution:**
- Make sure you copied the FULL token (very long string)
- Don't add "Bearer " prefix (Swagger adds it automatically)
- Check token hasn't expired (tokens expire after 1 hour by default)

### Issue: File Upload Not Working

**Solution:**
- Use `multipart/form-data` endpoints
- Select actual files, don't paste file paths
- Check file size isn't too large
- Verify AWS S3 credentials in .env

### Issue: 401 Unauthorized Error

**Solution:**
- Click "Authorize" and enter valid JWT token
- Make sure you're using the right token (user vs employee vs admin)
- Token might be expired - login again to get new token

### Issue: 400 Bad Request

**Solution:**
- Check all required fields are filled
- Verify data types match (number vs string)
- ObjectIds must be valid MongoDB ObjectId format
- Check field validation rules (e.g., phone number format)

---

## 📖 Swagger Annotations in Code

### How Swagger is Configured

Swagger is set up in `src/main.ts`:

```typescript
const config = new DocumentBuilder()
  .setTitle('Ariza Manager API')
  .setDescription('API for managing applications and inventory')
  .setVersion('1.0')
  .addBearerAuth()  // Adds JWT authentication
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('docs', app, document);
```

### Common Decorators Used

**In Controllers:**
```typescript
@ApiTags('users')  // Groups endpoints
@ApiBearerAuth()   // Requires JWT
@ApiConsumes('multipart/form-data')  // File upload
```

**In DTOs:**
```typescript
@ApiProperty({ example: 'John Doe' })  // Shows example
@ApiProperty({ required: false })      // Optional field
@ApiProperty({ enum: ['male', 'female', 'other'] })  // Dropdown
```

---

## 🎓 Learning More

### Official Documentation
- [NestJS Swagger](https://docs.nestjs.com/openapi/introduction)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)
- [OpenAPI Specification](https://swagger.io/specification/)

### Video Tutorials
- Search YouTube for "NestJS Swagger tutorial"
- Look for "OpenAPI interactive documentation"

---

## 📝 Quick Reference

### Essential Endpoints to Test First

1. **POST /api/branches** - Create organization structure
2. **POST /api/users** - Create a user
3. **POST /api/auth/login** - Get JWT token
4. **PATCH /api/users/profile** - Test authenticated endpoint
5. **POST /api/applications** - Test file upload
6. **GET /api/applications/{id}** - See history tracking

### Keyboard Shortcuts in Swagger

- **Ctrl/Cmd + F** - Search for endpoints
- **Tab** - Navigate between fields
- **Enter** - Execute request (when focused on Execute button)

---

## ✅ Checklist for First-Time Users

- [ ] Start the application (`npm run start:dev`)
- [ ] Open Swagger UI (`http://localhost:3000/docs`)
- [ ] Create a branch
- [ ] Create a department
- [ ] Create a user
- [ ] Login and get JWT token
- [ ] Click "Authorize" and paste token
- [ ] Update user profile
- [ ] Create an application
- [ ] View the application with history
- [ ] Explore other endpoints

---

## 🎉 Summary

Swagger is your **best friend** for API development and testing:
- ✅ No setup required - already configured
- ✅ Interactive - test directly in browser
- ✅ Visual - see all endpoints and schemas
- ✅ Fast - no need to switch to Postman for quick tests
- ✅ Documentation - always up-to-date with code

**Start exploring at: http://localhost:3000/docs** 🚀

---

**Need more help? Check out:**
- [README.md](./README.md) - Complete project documentation
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Detailed testing scenarios
- [QUICK_START.md](./QUICK_START.md) - Get started in 5 minutes
