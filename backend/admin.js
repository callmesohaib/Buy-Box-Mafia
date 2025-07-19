const admin = require('./utils/firebase').admin;

async function makeAdmin(email) {
  try {
    const user = await admin.auth().getUserByEmail(email);
    
    // Set admin claim
    await admin.auth().setCustomUserClaims(user.uid, { role: "admin" });
    
    console.log(`Success! ${email} is now an admin`);
    
    // Verify the change
    const updatedUser = await admin.auth().getUser(user.uid);
    console.log('Updated claims:', updatedUser.customClaims);
  } catch (error) {
    console.error('Error making admin:', error);
  }
}

makeAdmin('buyboxmafia.official@gmail.com');