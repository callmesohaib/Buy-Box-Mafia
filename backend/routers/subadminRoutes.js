const express = require("express");
const router = express.Router();
const {
  addSubadmin,
  getAllSubadmins,
  getSubadminById,
  updateSubadmin,
  deleteSubadmin,
} = require("../controllers/subadminController");

// Import the email function
const { sendSubadminCredentials } = require("../controllers/subadminController");
const { admin } = require("../utils/firebase");
const { ROLES, ERROR_MESSAGES } = require("../utils/constants");

// Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;
    console.log("Auth header:", authHeader ? "Present" : "Missing");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Invalid auth header format");
      return res.status(401).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED,
      });
    }

    const token = authHeader.split("Bearer ")[1];
    console.log("Token length:", token.length);
    
    // Verify the token with Firebase
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log("Decoded token role:", decodedToken.role);
    
    // Check if user has admin role
    if (decodedToken.role !== ROLES.ADMIN) {
      console.log("User does not have admin role");
      return res.status(403).json({
        success: false,
        message: ERROR_MESSAGES.ACCESS_DENIED,
      });
    }

    // Add user info to request
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({
      success: false,
      message: ERROR_MESSAGES.UNAUTHORIZED,
    });
  }
};

// Health check endpoint


// Test email endpoint (remove in production)
router.post("/test-email", async (req, res) => {
  try {
    const { email, name } = req.body;
    const password = "test123";
    const emailSent = await sendSubadminCredentials(email, password, name);
    res.json({ success: true, emailSent });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Subadmin routes (temporarily without auth for testing)
router.post("/add", addSubadmin);
router.get("/all", getAllSubadmins);
router.get("/:id", getSubadminById);
router.put("/:id", updateSubadmin);
router.delete("/:id", deleteSubadmin);

module.exports = router; 