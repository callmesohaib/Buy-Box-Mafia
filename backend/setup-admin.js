const admin = require('./utils/firebase').admin;

async function makeAdmin(email) {
  try {
    console.log(`Attempting to make ${email} an admin...`);
    
    const user = await admin.auth().getUserByEmail(email);
    console.log(`Found user: ${user.uid}`);
    
    // Set admin claim
    await admin.auth().setCustomUserClaims(user.uid, { role: "admin" });
    
    console.log(`Success! ${email} is now an admin`);
    
    // Verify the change
    const updatedUser = await admin.auth().getUser(user.uid);
    console.log('Updated claims:', updatedUser.customClaims);
    
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