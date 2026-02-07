/**
 * Firebase Cloud Functions for ATHAR Library App
 * Security & Rate Limiting
 * 
 * Deploy: firebase deploy --only functions
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// ═══════════════════════════════════════════════════════════════════
// Rate Limiting Functions
// ═══════════════════════════════════════════════════════════════════

/**
 * Rate limit for book creation - max 10 books per minute per user
 * Triggered on book document creation
 */
exports.rateLimitBookCreate = functions.firestore
  .document('books/{bookId}')
  .onCreate(async (snap, context) => {
    const userId = context.auth.uid;
    const rateLimitRef = admin.firestore().doc(`rateLimits/${userId}`);
    const now = admin.firestore.Timestamp.now();
    
    try {
      const doc = await rateLimitRef.get();
      
      if (doc.exists) {
        const data = doc.data();
        const lastWriteTime = data.timestamp;
        const minutesDiff = (now.toMillis() - lastWriteTime.toMillis()) / 60000;
        
        // Reset if 1 minute passed
        if (minutesDiff >= 1) {
          await rateLimitRef.set({
            count: 1,
            timestamp: now,
            lastAction: 'book_create'
          });
        } else if (data.count >= 10) {
          // Rate limit exceeded - log and alert
          await admin.firestore().collection('securityLogs').add({
            type: 'rate_limit_exceeded',
            userId: userId,
            action: 'book_create',
            count: data.count,
            timestamp: now,
            severity: 'warning'
          });
          
          // Delete the created book
          await snap.ref.delete();
          
          throw new functions.https.HttpsError(
            'aborted', 
            'Rate limit exceeded: Maximum 10 books per minute'
          );
        } else {
          await rateLimitRef.set({
            count: data.count + 1,
            timestamp: now,
            lastAction: 'book_create'
          });
        }
      } else {
        await rateLimitRef.set({
          count: 1,
          timestamp: now,
          lastAction: 'book_create'
        });
      }
      
      // Update the book with userId from auth
      await snap.ref.set({
        userId: userId
      }, { merge: true });
      
    } catch (error) {
      console.error('Rate limit error:', error);
      if (error.message.includes('Rate limit exceeded')) {
        throw error;
      }
    }
  });

/**
 * Rate limit for book updates - max 30 updates per minute per user
 */
exports.rateLimitBookUpdate = functions.firestore
  .document('books/{bookId}')
  .onUpdate(async (change, context) => {
    const userId = context.auth.uid;
    const rateLimitRef = admin.firestore().doc(`rateLimits/${userId}`);
    const now = admin.firestore.Timestamp.now();
    
    try {
      const doc = await rateLimitRef.get();
      
      if (doc.exists) {
        const data = doc.data();
        const minutesDiff = (now.toMillis() - data.timestamp.toMillis()) / 60000;
        
        if (minutesDiff < 1 && data.count >= 30) {
          await admin.firestore().collection('securityLogs').add({
            type: 'rate_limit_exceeded',
            userId: userId,
            action: 'book_update',
            timestamp: now,
            severity: 'low'
          });
          return null; // Silent fail - don't block updates
        }
      }
      
    } catch (error) {
      console.error('Rate limit update error:', error);
    }
    
    return null;
  });

// ═══════════════════════════════════════════════════════════════════
// Security & Monitoring Functions
// ═══════════════════════════════════════════════════════════════════

/**
 * Log all security-related events
 */
exports.logSecurityEvent = functions.firestore
  .document('securityLogs/{logId}')
  .onCreate(async (snap, context) => {
    const logData = snap.data();
    
    // Send to Google Cloud Logging
    console.log('Security Event:', JSON.stringify({
      type: logData.type,
      userId: logData.userId,
      severity: logData.severity,
      timestamp: logData.timestamp
    }));
    
    // Alert for high severity events
    if (logData.severity === 'critical') {
      // In production, integrate with Slack/email alerts here
      console.error('CRITICAL SECURITY EVENT:', logData);
    }
    
    return null;
  });

/**
 * Clean up old rate limit documents (run daily)
 */
exports.cleanupRateLimits = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const now = admin.firestore.Timestamp.now();
    const oneDayAgo = new Date(now.toMillis() - 86400000);
    
    const snapshot = await admin.firestore()
      .collection('rateLimits')
      .where('timestamp', '<', oneDayAgo)
      .get();
    
    const batch = admin.firestore().batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log(`Cleaned up ${snapshot.size} expired rate limit documents`);
    
    return null;
  });

/**
 * Validate book data on creation
 */
exports.validateBookData = functions.firestore
  .document('books/{bookId}')
  .onBeforeCreate(async (snap, context) => {
    const data = snap.data();
    const userId = context.auth?.uid;
    
    // Validate required fields
    if (!data.title || typeof data.title !== 'string') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Book title is required and must be a string'
      );
    }
    
    if (data.title.length > 500) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Book title must be 500 characters or less'
      );
    }
    
    if (!data.author || typeof data.author !== 'string') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Book author is required and must be a string'
      );
    }
    
    // Validate status
    const validStatuses = ['planned', 'reading', 'completed', 'on-hold', 'dropped'];
    if (data.status && !validStatuses.includes(data.status)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Invalid book status'
      );
    }
    
    // Validate rating (if provided)
    if (data.rating !== undefined && (data.rating < 0 || data.rating > 5)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Rating must be between 0 and 5'
      );
    }
    
    // Ensure userId matches authenticated user
    if (userId && data.userId !== userId) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Cannot create book for another user'
      );
    }
    
    return snap;
  });

/**
 * Calculate and update user statistics
 */
exports.updateUserStats = functions.firestore
  .document('books/{bookId}')
  .onWrite(async (change, context) => {
    const userId = context.auth?.uid;
    if (!userId) return null;
    
    const statsRef = admin.firestore().doc(`users/${userId}/stats/summary`);
    const booksRef = admin.firestore().collection('books');
    
    try {
      const snapshot = await booksRef
        .where('userId', '==', userId)
        .get();
      
      let total = 0;
      let completed = 0;
      let reading = 0;
      let planned = 0;
      let totalPages = 0;
      let totalRating = 0;
      let ratedBooks = 0;
      
      snapshot.forEach(doc => {
        const book = doc.data();
        total++;
        
        if (book.status === 'completed') {
          completed++;
          totalPages += Number(book.pages) || 0;
          if (book.rating) {
            totalRating += Number(book.rating);
            ratedBooks++;
          }
        } else if (book.status === 'reading') {
          reading++;
        } else if (book.status === 'planned') {
          planned++;
        }
      });
      
      await statsRef.set({
        totalBooks: total,
        completedBooks: completed,
        readingBooks: reading,
        plannedBooks: planned,
        totalPages: totalPages,
        averageRating: ratedBooks > 0 ? totalRating / ratedBooks : 0,
        lastUpdated: admin.firestore.Timestamp.now()
      }, { merge: true });
      
    } catch (error) {
      console.error('Error updating user stats:', error);
    }
    
    return null;
  });

/**
 * Send welcome email on new user registration
 * Requires Firebase Extensions or external email service
 */
exports.onNewUserCreated = functions.firestore
  .document('users/{userId}')
  .onCreate(async (snap, context) => {
    const userId = context.params.userId;
    const userData = snap.data();
    
    // Log welcome event
    await admin.firestore().collection('securityLogs').add({
      type: 'user_registered',
      userId: userId,
      email: userData.email,
      timestamp: admin.firestore.Timestamp.now(),
      severity: 'info'
    });
    
    // In production, integrate with email service like SendGrid/Mailgun
    // Example:
    // await sendWelcomeEmail(userData.email, userData.displayName);
    
    return null;
  });

// ═══════════════════════════════════════════════════════════════════
// HTTP Callable Functions (for client-side calls)
// ═══════════════════════════════════════════════════════════════════

/**
 * Get user's current rate limit status
 */
exports.getRateLimitStatus = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Must be logged in'
    );
  }
  
  const userId = context.auth.uid;
  const rateLimitRef = admin.firestore().doc(`rateLimits/${userId}`);
  const doc = await rateLimitRef.get();
  
  if (doc.exists) {
    const data = doc.data();
    const now = Date.now();
    const minutesLeft = Math.max(0, 1 - (now - data.timestamp.toMillis()) / 60000);
    
    return {
      count: data.count,
      remaining: Math.max(0, 10 - data.count),
      resetIn: Math.ceil(minutesLeft * 60) + ' seconds'
    };
  }
  
  return {
    count: 0,
    remaining: 10,
    resetIn: '0 seconds'
  };
});

/**
 * Reset user's rate limit (for testing or admin use)
 */
exports.resetRateLimit = functions.https.onCall(async (data, context) => {
  // Only allow admin or self-reset
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Must be logged in'
    );
  }
  
  const userId = context.auth.uid;
  
  await admin.firestore().doc(`rateLimits/${userId}`).delete();
  
  return { success: true, message: 'Rate limit reset' };
});
