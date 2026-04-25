# Security Specification - findNED

## 1. Data Invariants
- A Report must have a valid `userId` matching the authenticated user.
- A Match must link two existing Reports (lost and found).
- Only Admins can modify User status or Report status (Approved/Rejected/Matched).
- Notifications are primarily for Admins from Users (flags).
- Users can only read their own non-public data.

## 2. The "Dirty Dozen" Payloads

### Payload 1: Identity Spoofing (Create Report for someone else)
```json
{
  "userId": "victim_id",
  "userName": "Victim",
  "itemName": "Laptop",
  "status": "Pending",
  "type": "lost"
}
```
**Expected**: PERMISSION_DENIED (userId must match request.auth.uid)

### Payload 2: Privilege Escalation (Self-Approve Report)
```json
{
  "status": "Approved"
}
```
**Expected**: PERMISSION_DENIED (Only admin can change status)

### Payload 3: State Shortcutting (Set status to Matched directly)
```json
{
  "status": "Matched"
}
```
**Expected**: PERMISSION_DENIED (Status matched requires atomicity/admin)

### Payload 4: Resource Poisoning (Giant Item Name)
```json
{
  "itemName": "A".repeat(2000)
}
```
**Expected**: PERMISSION_DENIED (size check)

### Payload 5: Orphaned Match (Link non-existent reports)
```json
{
  "lostReportId": "ghost_1",
  "foundReportId": "ghost_2",
  "status": "Suggested"
}
```
**Expected**: PERMISSION_DENIED (exists() check)

### Payload 6: User Status Manipulation
```json
{
  "status": "Active"
}
```
**Expected**: PERMISSION_DENIED (Users cannot change their own status/role)

### Payload 7: Shadow Update (Inject Ghost Field)
```json
{
  "isAdmin": true
}
```
**Expected**: PERMISSION_DENIED (affectedKeys().hasOnly() guard)

### Payload 8: PII Leak (Read other user's private info)
**Action**: `get(/users/other_user)`
**Expected**: PERMISSION_DENIED (Unauthorized read)

### Payload 9: Timestamp Spoofing
```json
{
  "createdAt": "2020-01-01T00:00:00Z"
}
```
**Expected**: PERMISSION_DENIED (must match request.time)

### Payload 10: Invalid Type Poisoning
```json
{
  "read": "yes"
}
```
**Expected**: PERMISSION_DENIED (must be boolean)

### Payload 11: ID Poisoning (Path injection)
**Action**: `set(/reports/invalid/path/123)`
**Expected**: PERMISSION_DENIED (isValidId check)

### Payload 12: Unauthorized Delete
**Action**: `delete(/reports/somebody_elses_report)`
**Expected**: PERMISSION_DENIED (Admin or owner only)

## 3. Test Runner (Draft)
A `firestore.rules.test.ts` would verify these against `request.auth`.
