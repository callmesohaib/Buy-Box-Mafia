const admin = require("firebase-admin");

let appInitialized = false;
try {
  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || "../buybox-mafia-firebase-adminsdk-fbsvc-38d0d0b172.json";
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  appInitialized = true;
} catch (e) {
  console.warn("Firebase service account not found or failed to load. Running without Firebase admin.", e.message);
  try {
    admin.initializeApp();
    appInitialized = true;
  } catch (err) {
    console.error("Failed to initialize Firebase admin:", err.message);
  }
}

const db = appInitialized ? admin.firestore() : null;

module.exports = { admin, db };