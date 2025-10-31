# Migration Guide - Ariza Manager v2

## Overview
This guide helps you migrate from the old schema to the new extended version with history tracking.

---

## Option 1: Fresh Installation (Recommended for Development)

If you're starting fresh or can reset your database:

```bash
# Drop the database
mongo
> use ariza-db
> db.dropDatabase()

# Restart the application
npm run start:dev
```

All new records will automatically have the correct structure.

---

## Option 2: Migrate Existing Data

### Prerequisites
```bash
# Backup your database first!
mongodump --uri="mongodb://localhost:27017/ariza-db" --out=./backup
```

### Step 1: Update Users Collection

```javascript
// Connect to MongoDB
mongo
use ariza-db

// Add new fields to existing users
db.users.updateMany(
  {},
  {
    $set: {
      profileComplete: false
    }
  }
)

// Verify
db.users.findOne()
```

### Step 2: Update Applications Collection

```javascript
// Add inventory field and history to existing applications
db.applications.updateMany(
  { history: { $exists: false } },
  {
    $set: {
      history: []
    }
  }
)

// Optional: Backfill initial history for existing applications
db.applications.find({ history: { $size: 0 } }).forEach(function(app) {
  db.applications.updateOne(
    { _id: app._id },
    {
      $push: {
        history: {
          status: app.status || 'new',
          changedBy: app.user,
          changedByModel: 'User',
          changedAt: app.createdAt || new Date(),
          comment: 'Migrated from old system'
        }
      }
    }
  )
})

// Verify
db.applications.findOne()
```

### Step 3: Update Inventory Collection

⚠️ **This is the most critical migration**

```javascript
// Step 3a: Add name field (REQUIRED - update with actual names)
// You'll need to manually set appropriate names for each item
db.inventory.find().forEach(function(inv) {
  // Example: Use inventoryNumber as temporary name
  db.inventory.updateOne(
    { _id: inv._id },
    {
      $set: {
        name: 'Asset ' + inv.inventoryNumber // UPDATE THIS WITH REAL NAMES
      }
    }
  )
})

// Step 3b: Rename user field to assignedTo
db.inventory.updateMany(
  {},
  {
    $rename: { "user": "assignedTo" }
  }
)

// Step 3c: Convert serial from number to string (if needed)
db.inventory.find({ serial: { $type: "number" } }).forEach(function(inv) {
  db.inventory.updateOne(
    { _id: inv._id },
    {
      $set: {
        serial: inv.serial.toString()
      }
    }
  )
})

// Step 3d: Add status and history fields
db.inventory.updateMany(
  { status: { $exists: false } },
  {
    $set: {
      status: 'active',
      history: []
    }
  }
)

// Step 3e: Backfill initial history
db.inventory.find({ history: { $size: 0 } }).forEach(function(inv) {
  db.inventory.updateOne(
    { _id: inv._id },
    {
      $push: {
        history: {
          action: 'assigned',
          by: inv.assignedTo,
          byModel: 'User',
          at: inv.createdAt || new Date(),
          comment: 'Migrated from old system'
        }
      }
    }
  )
})

// Verify
db.inventory.findOne()
```

### Step 4: Verify Migration

```javascript
// Check users
db.users.findOne()
// Should have: phone (optional), gender (optional), profileComplete

// Check applications
db.applications.findOne()
// Should have: inventory (optional), history array with proper structure

// Check inventory
db.inventory.findOne()
// Should have: name, assignedTo (not user), serial (string), status, history

// Count documents to ensure nothing was lost
db.users.countDocuments()
db.applications.countDocuments()
db.inventory.countDocuments()
```

---

## Option 3: Gradual Migration Script

Create a migration script for safer production migration:

```typescript
// scripts/migrate.ts
import { MongoClient } from 'mongodb';

async function migrate() {
  const client = await MongoClient.connect('mongodb://localhost:27017');
  const db = client.db('ariza-db');

  try {
    console.log('Starting migration...');

    // Users
    console.log('Migrating users...');
    await db.collection('users').updateMany(
      { profileComplete: { $exists: false } },
      { $set: { profileComplete: false } }
    );

    // Applications
    console.log('Migrating applications...');
    await db.collection('applications').updateMany(
      { history: { $exists: false } },
      { $set: { history: [] } }
    );

    // Inventory - Add name field
    console.log('Migrating inventory...');
    const inventories = await db.collection('inventory').find({ name: { $exists: false } }).toArray();
    
    for (const inv of inventories) {
      await db.collection('inventory').updateOne(
        { _id: inv._id },
        {
          $set: {
            name: `Asset ${inv.inventoryNumber}`, // Update with real logic
            status: 'active',
            history: []
          },
          $rename: { user: 'assignedTo' }
        }
      );
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.close();
  }
}

migrate();
```

Run with:
```bash
npx ts-node scripts/migrate.ts
```

---

## Post-Migration Checklist

- [ ] Backup created and verified
- [ ] All users have `profileComplete` field
- [ ] All applications have `history` array
- [ ] All inventory items have:
  - [ ] `name` field (with real names, not placeholders)
  - [ ] `assignedTo` instead of `user`
  - [ ] `status` field
  - [ ] `history` array
  - [ ] `serial` as string (if applicable)
- [ ] Document counts match pre-migration
- [ ] Test API endpoints work correctly
- [ ] Swagger docs updated and accessible

---

## Rollback Plan

If something goes wrong:

```bash
# Restore from backup
mongorestore --uri="mongodb://localhost:27017/ariza-db" ./backup/ariza-db

# Or restore specific collection
mongorestore --uri="mongodb://localhost:27017/ariza-db" --collection=inventory ./backup/ariza-db/inventory.bson
```

---

## Common Issues

### Issue: "name is required" error on inventory
**Solution:** Ensure all inventory items have the `name` field before starting the app.

### Issue: History not showing in API responses
**Solution:** Check that populate is working. Verify `changedByModel` and `byModel` fields are set correctly.

### Issue: JWT validation fails for employees
**Solution:** This is fixed in the new JWT strategy. Ensure you're using the updated code.

### Issue: Old `user` field still referenced
**Solution:** Search codebase for `populate('user')` in inventory context and replace with `populate('assignedTo')`.

---

## Support

If you encounter issues during migration:
1. Check the logs for specific error messages
2. Verify database schema with `db.collection.findOne()`
3. Ensure all required fields are present
4. Test with a small subset of data first

Remember: **Always backup before migrating!**
