# ⚡ Quick Start Guide - Ariza Manager

## 🎯 Goal
Get the Ariza Manager API running on your machine in **5 minutes**.

---

## Step 1: Prerequisites (2 min)

Check you have these installed:

```bash
node --version  # Should be v18+
npm --version   # Should be 9+
mongo --version # Or have MongoDB Atlas account
```

---

## Step 2: Install & Configure (2 min)

```bash
# Clone and install
git clone <repo-url>
cd application-manager
npm install

# Setup environment
cp .env.example .env
# Edit .env with your MongoDB URI and AWS S3 credentials
```

**Minimum .env configuration:**
```ini
MONGO_URI=mongodb://localhost:27017/ariza-db
PORT=3000
JWT_SECRET=my_secret_key_change_in_production
AWS_S3_ACCESS_KEY_ID=your_key
AWS_S3_SECRET_ACCESS_KEY=your_secret
AWS_S3_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-bucket
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

---

## Step 3: Run (1 min)

```bash
npm run start:dev
```

**You should see:**
```
[Nest] Application successfully started
[Nest] Listening on port 3000
✅ Admin user created successfully: admin@example.com
```

---

## Step 4: Test It Works

Open browser:
- **Swagger Docs:** http://localhost:3000/docs
- **API:** http://localhost:3000/api

If you see Swagger UI, **you're done!** ✅

---

## 🚀 Next Steps

### Option A: Use Swagger UI (Easiest)
1. Go to http://localhost:3000/docs
2. Click on any endpoint
3. Click "Try it out"
4. Fill in the request body
5. Click "Execute"

### Option B: Use Postman (Recommended)
1. Import Swagger: `http://localhost:3000/docs-json`
2. Follow the [README.md](./README.md) Postman guide

### Option C: Use curl

**Create a user:**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "tableNumber": 101,
    "fullName": "John Doe",
    "branch": "673c1234567890abcdef1234",
    "department": "673c1234567890abcdef5678"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"tableNumber": 101}'
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 📚 Full Documentation

- **[README.md](./README.md)** - Complete documentation
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Step-by-step testing
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Technical details

---

## 🆘 Troubleshooting

**Port 3000 already in use?**
```bash
# Change PORT in .env to 3001 or any available port
PORT=3001
```

**MongoDB connection failed?**
```bash
# Make sure MongoDB is running
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # Mac

# Or use MongoDB Atlas (cloud)
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/ariza-db
```

**AWS S3 errors?**
- Verify credentials are correct
- Check bucket exists and region matches
- Ensure bucket has proper permissions

---

## 🎓 Understanding the Flow

```
1. Create Organization Structure
   ├─ Branch (e.g., "Head Office")
   └─ Department (e.g., "IT Department")

2. Create Users
   ├─ User (client who submits requests)
   └─ Employee (handles requests)

3. User Flow
   ├─ User logs in (tableNumber)
   ├─ Creates application (request)
   └─ Tracks status

4. Employee Flow
   ├─ Employee logs in (email + password)
   ├─ Gets assigned applications
   ├─ Updates status
   └─ Manages inventory
```

---

## 🔑 Key Concepts

**3 Types of Users:**
- **Users** - Login with tableNumber (no password)
- **Employees** - Login with email + password
- **Admins** - Full access (auto-created from .env)

**History Tracking:**
- Every change is recorded
- Shows who did what and when
- Includes comments

**File Uploads:**
- Images stored in AWS S3
- URLs saved in database
- Supports multiple files

---

## 💡 Pro Tips

1. **Use Swagger for quick testing** - No Postman needed!
2. **Check startup logs** - Admin creation status shown here
3. **Save JWT tokens** - You'll need them for protected routes
4. **Use environment variables** - In Postman for easy testing
5. **Read the full README** - Detailed Postman guide included

---

**Ready to build? Start with [README.md](./README.md)!** 🚀
