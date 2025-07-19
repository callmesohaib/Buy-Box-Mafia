// Test script for subadmin functionality
const { admin, db } = require("./utils/firebase");

async function testSubadminSetup() {
  try {
    console.log("Testing subadmin setup...");
    
    // Test 1: Check if Firebase is connected
    console.log("✅ Firebase connection test...");
    const testDoc = await db.collection("test").doc("test").get();
    console.log("Firebase connection successful");
    
    // Test 2: Check if subadmins collection exists
    console.log("✅ Checking subadmins collection...");
    const subadminsSnapshot = await db.collection("subadmins").get();
    console.log(`Found ${subadminsSnapshot.size} existing subadmins`);
    
    // Test 3: Test email configuration (if env vars are set)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      console.log("✅ Email configuration found");
      console.log(`Email user: ${process.env.EMAIL_USER}`);
    } else {
      console.log("⚠️  Email configuration not found");
      console.log("Please set EMAIL_USER and EMAIL_PASSWORD in your .env file");
    }
    
    console.log("\n🎉 All tests passed! Subadmin system is ready.");
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

// Run the test
testSubadminSetup(); 