# Notifications & WebSocket Testing Guide

This guide explains how to test **WebSocket events** and **Telegram notifications** in the Ariza Manager backend.

---

## 1. WebSocket Notifications (Employees)

### 1.1 Overview

WebSocket events are sent from `EmployeeGateway` when:

- An application is **assigned** to an employee.
- An application **status** is changed by an employee.

Events are delivered to **rooms named by employeeId**, so only the target employee (and their open clients) receives them.

### 1.2 Connection URL

The gateway uses Socket.IO with CORS enabled for all origins.

- **URL:** `ws://localhost:3000/socket.io/` (or `http://` in Socket.IO client)
- **Query parameter (required):** `employeeId`

Example connection (JavaScript / browser console):

```js
const socket = io('http://localhost:3000', {
  query: { employeeId: 'EMPLOYEE_DB_ID_HERE' },
});

socket.on('connect', () => {
  console.log('Connected, id =', socket.id);
});

socket.on('appAssigned', (data) => {
  console.log('Application assigned:', data);
});

socket.on('statusChanged', (data) => {
  console.log('Application status changed:', data);
});
```

> Replace `EMPLOYEE_DB_ID_HERE` with the `id` field of the employee document (not `_id`).

### 1.3 How to Trigger Events (with Postman)

1. **Assign application to employee**
   - Endpoint: `PATCH /api/applications/{applicationId}/assign`
   - Auth: Bearer `employee_token` or `admin_token`
   - Body: (depends on your controller, typically includes `employeeId` / pulled from JWT)
   - Effect:
     - Application is assigned.
     - WebSocket event `appAssigned` is sent to room `employeeId`:
       ```json
       {
         "applicationId": "...",
         "employeeId": "...",
         "employeeName": "..."
       }
       ```

2. **Change application status as employee**
   - Endpoint: `PATCH /api/applications/{applicationId}/status` (employee-specific controller)
   - Auth: Bearer `employee_token`
   - Body:
     ```json
     { "status": "progressing" }
     ```
   - Effect:
     - Status is updated and history appended.
     - WebSocket event `statusChanged` is sent to room `employeeId`:
       ```json
       {
         "applicationId": "...",
         "newStatus": "progressing",
         "changedBy": "Employee Name",
         "timestamp": "2025-11-23T09:00:00.000Z",
         "employeeId": "..."
       }
       ```

If your frontend connects with the correct `employeeId`, it will receive only its own updates.

---

## 2. Telegram Notifications

### 2.1 Environment Variables

Set the following in your `.env` file:

```ini
TELEGRAM_BOT_TOKEN=123456789:your_bot_token_from_botfather
TELEGRAM_CHAT_ID=123456789   # Your user or group chat ID
```

- `TELEGRAM_BOT_TOKEN` is required to enable Telegram notifications.
- If it is **not set**, the backend will start but Telegram notifications will be **disabled** (no errors).
- `TELEGRAM_CHAT_ID` is required for test/broadcast notifications.

### 2.2 Getting Chat ID

1. Create a bot via **BotFather** and copy the token.
2. Start a chat with your bot (or add bot to a group).
3. Use any "get chat id" helper bot (e.g. `@userinfobot`) or your own simple script to retrieve your chat ID.
4. Put that ID into `TELEGRAM_CHAT_ID`.

### 2.3 When Notifications Are Sent

From `ApplicationsService`:

1. **Application created**
   - Endpoint: `POST /api/applications`
   - Effect: sends Telegram message to `TELEGRAM_CHAT_ID`:
     > `Application {index} created with issue: {issue}.`

2. **Application status updated (generic)**
   - Endpoint: `PATCH /api/applications/{id}/status`
   - Effect: sends:
     > `Application {index} status updated to {status}.`

3. **Application assigned to employee**
   - Endpoint: (employee/admin path that calls `assignToEmployee`)
   - Effect: sends:
     > `Application {index} assigned to {employeeName}`

4. **Application status changed by employee**
   - Endpoint: employee-specific status update path
   - Effect: sends:
     > `Application {index} status changed to {newStatus} by {employeeName}`

### 2.4 Testing from Postman

1. Ensure `.env` has valid `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`.
2. Restart backend so Telegram bot initializes.
3. Use the existing Postman flow (from README) to:
   - Create an application (`POST /api/applications`).
   - Assign it to an employee.
   - Change its status.
4. Watch your Telegram chat for messages described above.

If tokens/IDs are wrong or missing, the service logs a warning and **skips** sending, without breaking requests.

---

## 3. Troubleshooting

- If WebSocket client does not receive events:
  - Check that `employeeId` in the Socket.IO connection query matches the `employeeId` used in backend methods.
  - Verify backend logs: `Client connected ... joined room for employee ...`.
  - Ensure no firewall/proxy is blocking WebSocket/Socket.IO.

- If Telegram messages do not arrive:
  - Check logs for `TELEGRAM_BOT_TOKEN is not set` or `TELEGRAM_CHAT_ID is not set` warnings.
  - Verify the bot is not blocked and has permission to write to the chat/group.
  - Re-check `.env` values and restart backend.
