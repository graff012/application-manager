# Testing Guide - Ariza Manager v2

## Quick Start

```bash
# Start the application
npm run start:dev

# Access Swagger docs
open http://localhost:3000/docs
```

---

## Authorization and Role Rules for Structure

- Only admins (admin_token) can create, edit, or delete:
  - Branches (/api/branches)
  - Departments (/api/departments)
  - Positions (/api/positions)
  - Employees (/api/employees)
  - Users (/api/users)
- Employees and users may only view these entities, and users can update their own profile via PATCH `/api/users/profile`.

---

## Test Scenario 1: User Profile Management

### 1.1 Create a User
**POST** `/api/users`
```json
{
  "tableNumber": 101,
  "fullName": "Test User",
  "branch": "673c1234567890abcdef1234",
  "department": "673c1234567890abcdef5678"
}
```

**Expected:** User created with `profileComplete: false`

### 1.2 Login as User
**POST** `/api/auth/login`
```json
{
  "tableNumber": 101
}
```

**Expected:** Receive JWT token
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 1.3 Update Profile (First Time)
**PATCH** `/api/users/profile`

**Headers:**
```
Authorization: Bearer {token_from_login}
```

**Body:**
```json
{
  "phone": "+998901234567"
}
```

**Expected:** 
- User updated with phone
- `profileComplete: false` (still missing gender)

### 1.4 Complete Profile
**PATCH** `/api/users/profile`

**Body:**
```json
{
  "gender": "male"
}
```

**Expected:**
- User updated with gender
- `profileComplete: true` ✅

### 1.5 Verify Profile
**GET** `/api/users`

**Expected:** User object contains:
```json
{
  "id": "...",
  "tableNumber": 101,
  "fullName": "Test User",
  "phone": "+998901234567",
  "gender": "male",
  "profileComplete": true
}
```

---

## Test Scenario 2: Application History Tracking

### 2.1 Create Application
**POST** `/api/applications`

**Headers:**
```
Authorization: Bearer {user_token}
Content-Type: multipart/form-data
```

**Form Data:**
```
user: 673c1234567890abcdef1234
branch: 673c1234567890abcdef1234
department: 673c1234567890abcdef5678
room: 201
issue: Printer not working
issueComment: Paper jam
images: [file1.jpg, file2.jpg] (stored in uploads/)
```

**Expected:**
- Application created with `status: 'new'`
- History array contains initial entry:
```json
{
  "history": [
    {
      "status": "new",
      "changedBy": "673c1234567890abcdef1234",
      "changedByModel": "User",
      "changedAt": "2025-10-30T15:30:00.000Z",
      "comment": "Ariza yaratildi"
    }
  ]
}
```

### 2.2 Login as Employee
**POST** `/api/auth/admin/login`
```json
{
  "email": "employee@example.com",
  "password": "password123"
}
```

**Expected:** Receive JWT with role
```json
{
  "access_token": "...",
  "userId": "...",
  "role": "employee"
}
```

### 2.3 Assign Application to Self
**PATCH** `/api/applications/{applicationId}/assign`

**Headers:**
```
Authorization: Bearer {employee_token}
```

**Expected:**
- Application `status: 'assigned'`
- `assignedTo` set to employee ID
- New history entry:
```json
{
  "status": "assigned",
  "changedBy": {
    "_id": "...",
    "fullName": "Employee Name"
  },
  "changedByModel": "Employee",
  "changedAt": "2025-10-30T15:35:00.000Z",
  "comment": "Assigned to Employee Name"
}
```

### 2.4 Update Application Status
**PATCH** `/api/applications/{applicationId}/status`

**Body:**
```json
{
  "status": "progressing"
}
```

**Expected:**
- Application `status: 'progressing'`
- New history entry added
- History array now has 3 entries (new → assigned → progressing)

### 2.5 Get Application with Full History
**GET** `/api/applications/{applicationId}`

**Expected:** Full application with populated history:
```json
{
  "id": "...",
  "index": "00001-2025",
  "status": "progressing",
  "user": { "fullName": "Test User" },
  "assignedTo": { "fullName": "Employee Name" },
  "history": [
    {
      "status": "new",
      "changedBy": { "fullName": "Test User" },
      "changedByModel": "User",
      "changedAt": "...",
      "comment": "Ariza yaratildi"
    },
    {
      "status": "assigned",
      "changedBy": { "fullName": "Employee Name" },
      "changedByModel": "Employee",
      "changedAt": "...",
      "comment": "Assigned to Employee Name"
    },
    {
      "status": "progressing",
      "changedBy": { "fullName": "Employee Name" },
      "changedByModel": "Employee",
      "changedAt": "...",
      "comment": "Status changed by Employee Name"
    }
  ]
}
```

---

## Test Scenario 3: Inventory Management

### 3.1 Create Inventory Item
**POST** `/api/inventory`

**Headers:**
```
Authorization: Bearer {employee_token}
Content-Type: multipart/form-data
```

**Form Data:**
```
name: Canon MF3010
inventoryNumber: 2000102
serial: SN123456789
user: 673c1234567890abcdef1234
branch: 673c1234567890abcdef1234
department: 673c1234567890abcdef5678
images: [photo1.jpg] (stored in uploads/)
```

**Expected:**
- Inventory created with `status: 'active'`
- `assignedTo` set to user ID
- Initial history entry:
```json
{
  "history": [
    {
      "action": "assigned",
      "by": {
        "_id": "...",
        "fullName": "Employee Name"
      },
      "byModel": "Employee",
      "at": "2025-10-30T15:40:00.000Z",
      "comment": "Initial assignment"
    }
  ]
}
```

### 3.2 Update Inventory Status to Repair
**PATCH** `/api/inventory/{inventoryId}`

**Headers:**
```
Authorization: Bearer {employee_token}
Content-Type: application/json
```

**Body:**
```json
{
  "status": "repair"
}
```

**Expected:**
- Inventory `status: 'repair'`
- New history entry:
```json
{
  "action": "repair",
  "by": { "fullName": "Employee Name" },
  "byModel": "Employee",
  "at": "...",
  "comment": "Status changed to repair"
}
```

### 3.3 Reassign Inventory to Different User
**PATCH** `/api/inventory/{inventoryId}`

**Body:**
```json
{
  "user": "673c1234567890abcdef9999"
}
```

**Expected:**
- `assignedTo` updated to new user
- New history entry:
```json
{
  "action": "assigned",
  "by": { "fullName": "Employee Name" },
  "byModel": "Employee",
  "at": "...",
  "comment": "Reassigned to new user"
}
```

### 3.4 Get Inventory with Full History
**GET** `/api/inventory/{inventoryId}`

**Expected:** Full inventory object:
```json
{
  "id": "...",
  "name": "Canon MF3010",
  "inventoryNumber": "2000102",
  "serial": "SN123456789",
  "status": "repair",
  "assignedTo": {
    "_id": "...",
    "fullName": "New User Name"
  },
  "branch": { "name": "HQ" },
  "department": { "name": "IT" },
  "images": ["https://s3.amazonaws.com/..."],
  "history": [
    {
      "action": "assigned",
      "by": { "fullName": "Employee Name" },
      "byModel": "Employee",
      "at": "...",
      "comment": "Initial assignment"
    },
    {
      "action": "repair",
      "by": { "fullName": "Employee Name" },
      "byModel": "Employee",
      "at": "...",
      "comment": "Status changed to repair"
    },
    {
      "action": "assigned",
      "by": { "fullName": "Employee Name" },
      "byModel": "Employee",
      "at": "...",
      "comment": "Reassigned to new user"
    }
  ]
}
```

---

## Test Scenario 4: JWT Token Validation

### 4.1 Test User Token
**GET** `/api/users`

**Headers:**
```
Authorization: Bearer {user_token}
```

**Expected:** ✅ Success - User token validated

### 4.2 Test Employee Token
**GET** `/api/applications/assigned`

**Headers:**
```
Authorization: Bearer {employee_token}
```

**Expected:** ✅ Success - Employee token validated with role

### 4.3 Test Admin Token
**GET** `/api/users`

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Expected:** ✅ Success - Admin token validated

---

## Automated Test Script (Postman)

Import this collection to Postman:

```json
{
  "info": {
    "name": "Ariza Manager v2 Tests",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "1. User Profile Flow",
      "item": [
        {
          "name": "Create User",
          "request": {
            "method": "POST",
            "url": "{{base_url}}/api/users",
            "body": {
              "mode": "raw",
              "raw": "{\"tableNumber\":101,\"fullName\":\"Test User\",\"branch\":\"{{branch_id}}\",\"department\":\"{{dept_id}}\"}"
            }
          }
        },
        {
          "name": "Login User",
          "request": {
            "method": "POST",
            "url": "{{base_url}}/api/auth/login",
            "body": {
              "mode": "raw",
              "raw": "{\"tableNumber\":101}"
            }
          }
        },
        {
          "name": "Update Profile",
          "request": {
            "method": "PATCH",
            "url": "{{base_url}}/api/users/profile",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{user_token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\"phone\":\"+998901234567\",\"gender\":\"male\"}"
            }
          }
        }
      ]
    }
  ]
}
```

---

## Validation Checklist

### User Profile
- [ ] Profile update requires JWT
- [ ] Phone validation works (rejects invalid formats)
- [ ] Gender enum validation works (rejects invalid values)
- [ ] `profileComplete` auto-updates correctly
- [ ] Can update phone and gender separately

### Application History
- [ ] Initial history entry created on application creation
- [ ] History entry added on assignment
- [ ] History entry added on status change
- [ ] `changedBy` properly populated with fullName
- [ ] Both User and Employee can be in history
- [ ] History array ordered chronologically

### Inventory
- [ ] Cannot create without `name` field
- [ ] `inventoryNumber` must be unique
- [ ] `serial` is optional
- [ ] Status defaults to 'active'
- [ ] History tracks all changes
- [ ] `assignedTo` properly populated
- [ ] Status changes tracked correctly

### JWT Authentication
- [ ] User tokens work for user endpoints
- [ ] Employee tokens work for employee endpoints
- [ ] Admin tokens work for all endpoints
- [ ] Invalid tokens rejected
- [ ] Expired tokens rejected

---

## Performance Tests

### Load Test (Optional)
```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Test profile update endpoint
ab -n 1000 -c 10 -H "Authorization: Bearer {token}" \
   -p profile.json -T application/json \
   http://localhost:3000/api/users/profile

# Test application list
ab -n 1000 -c 10 -H "Authorization: Bearer {token}" \
   http://localhost:3000/api/applications
```

**Expected:** Response times < 200ms for 95% of requests

---

## Troubleshooting

### Issue: "profileComplete not updating"
- Check both phone AND gender are provided
- Verify logic in `users.service.ts`

### Issue: "History not showing"
- Check populate is working
- Verify `changedByModel` is set correctly
- Check MongoDB has the history array

### Issue: "JWT validation fails"
- Verify JWT_SECRET in .env
- Check token hasn't expired
- Ensure jwt.strategy.ts has updated validate method

### Issue: "Inventory creation fails"
- Ensure `name` field is provided
- Check `inventoryNumber` is unique
- Verify S3 credentials are correct

---

## Success Criteria

✅ All endpoints return 200/201 status codes
✅ History arrays properly populated
✅ JWT tokens validated for all user types
✅ Profile completion logic works
✅ No TypeScript compilation errors
✅ Swagger docs accessible and accurate
✅ All validation rules enforced
✅ Database queries optimized (with indexes)

---

## Next Steps After Testing

1. Deploy to staging environment
2. Run integration tests
3. Perform security audit
4. Load test with production-like data
5. Update user documentation
6. Train support team on new features
