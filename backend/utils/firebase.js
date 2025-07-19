const admin = require("firebase-admin");
const serviceAccount = require("../buybox-mafia-firebase-adminsdk-fbsvc-38d0d0b172.json"); // path to your service account JSON

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore(); 

module.exports = { admin, db };