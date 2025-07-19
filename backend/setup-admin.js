const { admin, db } = require('./utils/firebase');
const bcrypt = require('bcryptjs');

async function makeAdmin(email) {
  try {
    console.log(`Attempting to make ${email} an admin...`);
    
    let user;
    
    // Try to get existing user
    try {
      user = await admin.auth().getUserByEmail(email);
      console.log(`Found existing user: ${user.uid}`);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log(`User ${email} not found, creating new user...`);
        
        // Create new user in Firebase Auth
        const adminPassword = "Admin@1234";
        user = await admin.auth().createUser({
          email: email,
          password: adminPassword,
          displayName: "Buy Box Mafia"
        });
        
        console.log(`Created new user: ${user.uid}`);
      } else {
        throw error;
      }
    }
    
    // Set admin claim
    await admin.auth().setCustomUserClaims(user.uid, { role: "admin" });
    
    console.log(`Success! ${email} is now an admin`);
    
    // Verify the change
    const updatedUser = await admin.auth().getUser(user.uid);
    console.log('Updated claims:', updatedUser.customClaims);
    
    // Hash the admin password
    const adminPassword = "Admin@1234";
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    
    // Create admin user in Firestore "users" collection
    const adminData = {
      uid: user.uid,
      name: user.displayName || "Buy Box Mafia",
      email: user.email,
      password: hashedPassword,
      phone: "",
      location: "",
      role: "admin",
      permissions: ["read", "write", "admin"],
      status: "",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: "system"
    };

    // Check if admin already exists in Firestore
    const existingAdmin = await db.collection("users").doc(user.uid).get();
    if (existingAdmin.exists) {
      console.log('Admin already exists in Firestore, updating...');
      await db.collection("users").doc(user.uid).update({
        role: "admin",
        password: hashedPassword,
        permissions: ["read", "write", "admin"],
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } else {
      console.log('Creating admin in Firestore...');
      await db.collection("users").doc(user.uid).set(adminData);
    }
    
    console.log('Admin user created/updated in Firestore successfully!');
    console.log('Admin password: Admin@1234 (stored as hashed value)');
    
    return true;
  } catch (error) {
    console.error('Error making admin:', error);
    return false;
  }
}

// Usage: node setup-admin.js <email>
const email = process.argv[2];
if (!email) {
  console.log('Usage: node setup-admin.js <email>');
  console.log('Example: node setup-admin.js your-email@example.com');
  process.exit(1);
}

makeAdmin(email).then(success => {
  if (success) {
    console.log('Admin setup completed successfully!');
  } else {
    console.log('Admin setup failed!');
    process.exit(1);
  }
}); 