# Firebase Security Configuration for ATHAR Library App

## 📋 Overview

This document describes the complete Firebase security configuration implemented for the ATHAR Library application, including Firestore rules, Storage rules, and Cloud Functions for advanced security features.

---

## 🚀 Quick Start

### Deploy All Security Rules

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage:rules

# Deploy Cloud Functions (requires Firebase Blaze plan)
firebase deploy --only functions

# Deploy everything
firebase deploy
```

### Test Rules Locally

```bash
# Start Firebase emulators
firebase emulators:start

# Open emulator UI
# Visit http://localhost:4000
```

---

## 📁 File Structure

```
athr/
├── firestore.rules          # Firestore database security rules
├── firestore.indexes.json  # Firestore query indexes
├── storage.rules           # Firebase Storage security rules
├── firebase.json           # Firebase configuration
└── functions/
    ├── index.js           # Cloud Functions (security & rate limiting)
    └── package.json       # Functions dependencies
```

---

## 🔒 Firestore Security Rules

### Collections Protected

| Collection | Read Access | Write Access |
|------------|------------|--------------|
| `users/{userId}` | Owner only | Owner only |
| `books/{bookId}` | Owner only | Owner only |
| `suggestedBooks` | Public | Authenticated (own docs) |
| `rateLimits` | Owner only | Cloud Functions only |
| `securityLogs` | Owner only | Cloud Functions only |

### Key Security Features

1. **Authentication Required**: All write operations require authentication
2. **Ownership Verification**: Users can only access their own documents
3. **Email Verification**: Write operations require verified email
4. **Data Validation**: Strict validation on all fields
5. **NoSQL Injection Protection**: Rejects suspicious keys starting with `$`
6. **Rate Limiting**: Max 10 book creations per minute per user

### Example Rule (Books Collection)

```firestore
match /books/{bookId} {
  // Read: Only authenticated users can read their own books
  allow read: if isAuthenticated() 
    && resource.data.userId == request.auth.uid;
  
  // Create: Requires valid data + email verification
  allow create: if isAuthenticated()
    && request.resource.data.userId == request.auth.uid
    && isValidBookData()
    && isCleanData();
}
```

---

## 📦 Firebase Storage Security Rules

### Buckets Protected

| Path | Read Access | Write Access |
|------|-------------|--------------|
| `users/{userId}/profile/*` | Authenticated | Owner only |
| `books/{userId}/covers/*` | Authenticated | Owner only |
| `public/*` | Public | Admin only |
| `temp/*` | Authenticated | Authenticated |

### File Restrictions

- **Allowed Types**: Images (JPEG, PNG, GIF, WebP) and PDFs
- **Max Size**: 5MB for images, 10MB for PDFs
- **Dimensions**: Max 2048x2048 for images
- **Naming**: Alphanumeric with `_`, `-`, `.` only

---

## ⚡ Cloud Functions

### Rate Limiting

**Function**: `rateLimitBookCreate`
- **Trigger**: Firestore `onCreate` for `books/{bookId}`
- **Limit**: 10 books per minute per user
- **Action**: Deletes excess books and logs event

**Function**: `rateLimitBookUpdate`
- **Trigger**: Firestore `onUpdate` for `books/{bookId}`
- **Limit**: 30 updates per minute per user
- **Action**: Logs event (soft limit)

### Data Validation

**Function**: `validateBookData`
- **Trigger**: Firestore `onBeforeCreate`
- **Validates**:
  - Title (required, string, max 500 chars)
  - Author (required, string, max 200 chars)
  - Status (enum: planned, reading, completed, on-hold, dropped)
  - Rating (optional, number 0-5)
  - Ownership verification

### User Statistics

**Function**: `updateUserStats`
- **Trigger**: Firestore `onWrite` for `books/{bookId}`
- **Updates**: User statistics in `users/{userId}/stats/summary`
- **Stats**: Total books, completed, reading, planned, average rating

### Security Logging

**Function**: `logSecurityEvent`
- **Trigger**: Firestore `onCreate` for `securityLogs/{logId}`
- **Logs**: All security-related events
- **Alerts**: Critical events logged to console

### Maintenance

**Function**: `cleanupRateLimits`
- **Schedule**: Runs daily
- **Action**: Deletes expired rate limit documents (> 24 hours)

---

## 🔐 Authentication Security

### Email Verification Required

All write operations require verified email:

```javascript
function isEmailVerified() {
  return isAuthenticated() && 
    request.auth.token.email_verified == true;
}
```

### User Registration Flow

1. User creates account → Verification email sent automatically
2. User must verify email before logging in
3. Login blocked if email not verified

### Security Features

- **Reauthentication Required**: For password/email changes
- **Password Strength Validation**: Minimum 6 characters
- **Email Format Validation**: Standard email regex
- **Session Management**: Firebase Auth persistence

---

## 🚨 Security Events Logged

| Event Type | Severity | Action |
|------------|----------|--------|
| Rate limit exceeded | Warning | Block operation |
| Failed login attempts | Info | Log event |
| Profile changes | Info | Log event |
| Suspicious activity | Critical | Alert |

---

## ⚠️ Production Checklist

Before deploying to production:

- [ ] Enable Firebase App Check
- [ ] Configure email templates in Firebase Console
- [ ] Set up monitoring alerts
- [ ] Configure backup rules
- [ ] Test all security rules locally
- [ ] Review and adjust rate limits

### Enable App Check

```bash
firebase appcheck:reCaptcha3:activate --project your-project-id
```

### Configure Email Templates

1. Go to Firebase Console → Authentication → Templates
2. Customize email verification template
3. Set up custom domain if needed

---

## 📊 Monitoring

### View Security Logs

```bash
# View function logs
firebase functions:log

# View Firestore logs
firebase firestore:logs
```

### Set Up Alerts

In Firebase Console:
1. Project Settings → Notifications
2. Configure email alerts for:
   - Function errors
   - Usage quotas
   - Security events

---

## 🐛 Troubleshooting

### Rules Not Working

1. Check emulator logs
2. Verify rule syntax: `firebase firestore:rules`
3. Test with specific user IDs

### Rate Limiting Issues

1. Check `rateLimits` collection
2. Verify Cloud Functions deployed
3. Check function logs for errors

### Authentication Problems

1. Verify email template configured
2. Check spam folder for verification emails
3. Test in emulator first

---

## 📚 References

- [Firestore Security Rules](https://firebase.google.com/docs/rules)
- [Storage Security Rules](https://firebase.google.com/docs/storage/security-rules)
- [Cloud Functions](https://firebase.google.com/docs/functions)
- [Firebase App Check](https://firebase.google.com/docs/app-check)
