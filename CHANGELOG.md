# Changelog - Ariza Manager

## [2.0.0] - 2025-10-30

### 🎉 Major Features

#### User Profile Management
- **Added** `phone`, `gender`, and `profileComplete` fields to User schema
- **Added** `PATCH /api/users/profile` endpoint for profile updates
- **Added** Automatic profile completion detection
- **Added** Phone number validation (international format)
- **Added** Gender enum validation (male/female/other)

#### Application History Tracking
- **Added** Complete history tracking for all status changes
- **Added** Polymorphic references (User/Employee) in history
- **Added** `inventory` reference field to link applications with assets
- **Added** Automatic history entry on application creation
- **Added** Automatic history entry on assignment
- **Added** Automatic history entry on status changes
- **Added** Population of `changedBy` with full name in responses
- **Added** Comments field in history entries

#### Inventory Management Enhancements
- **Added** `name` field (required) for asset identification
- **Added** `status` field (active/repair/broken)
- **Added** Complete history tracking for all changes
- **Added** Polymorphic references in history (User/Employee)
- **Changed** `serial` from required number to optional string
- **Changed** `user` field renamed to `assignedTo` for clarity
- **Changed** `branch` and `department` now optional
- **Added** Automatic history entry on creation
- **Added** Automatic history entry on status changes
- **Added** Automatic history entry on reassignment
- **Added** Population of `history.by` with full name

### 🔧 Technical Improvements

#### Authentication
- **Fixed** JWT strategy to handle both user and employee/admin tokens
- **Fixed** Token validation for polymorphic user types
- **Improved** Request context handling for history tracking

#### API Enhancements
- **Updated** All DTOs with proper validation decorators
- **Updated** Swagger documentation with examples
- **Updated** All service methods to populate history references
- **Added** Employee ID tracking in inventory operations

#### Database Schema
- **Updated** User schema with profile fields
- **Updated** Application schema with inventory reference and new history structure
- **Updated** Inventory schema with status, assignedTo, and history
- **Added** Polymorphic reference support with `refPath`

### 📚 Documentation

#### New Documents
- **Added** `IMPLEMENTATION_SUMMARY.md` - Complete feature overview
- **Added** `MIGRATION_GUIDE.md` - Database migration instructions
- **Added** `TESTING_GUIDE.md` - Comprehensive testing scenarios
- **Added** `CHANGELOG.md` - This file

#### Updated Documents
- **Updated** API endpoint documentation in README
- **Updated** Swagger/OpenAPI specifications

### 🔄 Breaking Changes

⚠️ **Inventory Schema Changes:**
- `user` field renamed to `assignedTo`
- `serial` changed from required number to optional string
- New required field: `name`

**Migration Required:** Existing inventory data must be migrated. See `MIGRATION_GUIDE.md`.

### 📦 Dependencies

No new dependencies added. All features implemented using existing packages:
- `@nestjs/common` ^11.0.1
- `@nestjs/mongoose` ^11.0.3
- `mongoose` ^8.19.2
- `class-validator` ^0.14.2
- `class-transformer` ^0.5.1

### 🐛 Bug Fixes

- **Fixed** JWT validation failing for employee/admin tokens
- **Fixed** Inconsistent population of references in responses
- **Fixed** Missing error handling in profile update

### 🚀 Performance

- **Optimized** Population queries with selective field projection
- **Added** Recommendations for database indexes in documentation
- **Improved** Query efficiency with proper reference population

### 🔒 Security

- **Added** Phone number format validation
- **Added** Gender enum validation
- **Improved** JWT token handling for multiple user types
- **Maintained** Existing authentication guards and authorization

### 📊 API Changes

#### New Endpoints
```
PATCH /api/users/profile - Update user profile
```

#### Modified Endpoints (Response Structure)
```
GET  /api/applications - Now includes populated history
GET  /api/applications/:id - Now includes inventory and populated history
POST /api/applications - Auto-creates history entry
GET  /api/inventory - Now includes status and populated history
GET  /api/inventory/:id - Now includes full history
POST /api/inventory - Requires name field, auto-creates history
PATCH /api/inventory/:id - Supports status updates, auto-adds history
```

### 🧪 Testing

- **Added** Comprehensive testing guide
- **Added** Postman collection examples
- **Added** Validation checklist
- **Verified** Build completes without errors
- **Verified** TypeScript compilation successful

### 📝 Notes

#### For Developers
- Review `IMPLEMENTATION_SUMMARY.md` for detailed technical overview
- Follow `MIGRATION_GUIDE.md` for database updates
- Use `TESTING_GUIDE.md` for testing procedures

#### For DevOps
- No infrastructure changes required
- Database migration needed for existing data
- Backup database before deploying
- Consider adding recommended indexes for performance

#### For Product Team
- User profile completion flow ready for frontend integration
- Full audit trail available for applications and inventory
- History tracking provides transparency for all changes
- Ready for Figma design implementation

### 🎯 Next Release (Planned)

- [ ] Pagination for history arrays
- [ ] Export history to CSV/PDF
- [ ] Email notifications alongside Telegram
- [ ] Advanced filtering by status and date ranges
- [ ] Bulk operations for inventory management
- [ ] Analytics dashboard for application metrics

---

## [1.0.0] - 2025-10-29

### Initial Release
- User management with tableNumber authentication
- Branch and Department organization
- Application (Ariza) submission and tracking
- Inventory management
- Employee and Position management
- JWT authentication
- AWS S3 file uploads
- Telegram notifications
- WebSocket real-time updates
- Swagger API documentation

---

## Version History

- **v2.0.0** (2025-10-30) - History tracking, profile management, inventory enhancements
- **v1.0.0** (2025-10-29) - Initial MVP release

---

## Upgrade Instructions

### From v1.0.0 to v2.0.0

1. **Backup your database**
   ```bash
   mongodump --uri="mongodb://localhost:27017/ariza-db" --out=./backup
   ```

2. **Pull latest code**
   ```bash
   git pull origin main
   npm install
   ```

3. **Run migration** (see MIGRATION_GUIDE.md)
   ```bash
   # Follow steps in MIGRATION_GUIDE.md
   ```

4. **Build and test**
   ```bash
   npm run build
   npm run start:dev
   ```

5. **Verify endpoints**
   - Test profile update: `PATCH /api/users/profile`
   - Check application history: `GET /api/applications/:id`
   - Verify inventory status: `GET /api/inventory/:id`

6. **Deploy**
   ```bash
   npm run start:prod
   ```

---

## Support

For issues or questions:
- Check documentation in project root
- Review TESTING_GUIDE.md for common scenarios
- See MIGRATION_GUIDE.md for database issues
- Contact development team

---

## Contributors

- Development Team - Initial implementation and v2.0.0 features
- Product Team - Requirements and specifications
- QA Team - Testing and validation

---

## License

UNLICENSED - Private project
