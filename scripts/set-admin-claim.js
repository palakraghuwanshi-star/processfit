/**
 * Adds an admin custom claim to a Firebase user.
 *
 * Usage: node scripts/set-admin-claim.js <user_email>
 *
 * Prerequisites:
 * 1. A service account key file named 'serviceAccountKey.json' must be present in this directory.
 * 2. Run `npm install` in the root directory to install dependencies, including `firebase-admin`.
 */
const admin = require('firebase-admin');

// Path to your service account key file
const serviceAccount = require('./serviceAccountKey.json');

// The email of the user to make an admin
const userEmail = process.argv[2];

if (!userEmail) {
  console.error('Error: Please provide the user\'s email as an argument.');
  console.log('Usage: node scripts/set-admin-claim.js <user_email>');
  process.exit(1);
}

// Initialize the Firebase Admin SDK
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} catch (error) {
  if (error.code === 'app/duplicate-app') {
    console.log('Admin app already initialized.');
  } else {
    console.error('Error initializing Firebase Admin SDK:', error);
    process.exit(1);
  }
}

async function setAdminClaim() {
  try {
    console.log(`Fetching user: ${userEmail}...`);
    const user = await admin.auth().getUserByEmail(userEmail);

    console.log(`Setting custom claim { isAdmin: true } for user ${user.uid}...`);
    await admin.auth().setCustomUserClaims(user.uid, { isAdmin: true });

    console.log(`\n✅ Success! User '${userEmail}' has been granted admin privileges.`);
    console.log('They will have admin access on their next sign-in or token refresh.');
  } catch (error) {
    console.error('\n❌ Error setting custom claim:', error.message);
    if (error.code === 'auth/user-not-found') {
      console.error(`Could not find a user with the email: ${userEmail}`);
    }
    process.exit(1);
  }
}

setAdminClaim();
