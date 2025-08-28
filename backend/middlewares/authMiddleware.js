const { ERROR_MESSAGES } = require("../utils/constants");
const admin = require("firebase-admin");
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  const statusCode =
    err.message === ERROR_MESSAGES.UNAUTHORIZED
      ? 401
      : err.message === ERROR_MESSAGES.ADMIN_REQUIRED
      ? 403
      : 500;

  res.status(statusCode).json({
    success: false,
    error: err.message || "Internal Server Error",
  });
};

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log("Decoded token:", decodedToken);

    // Find user in Firestore by Firebase UID
    const usersSnapshot = await db
      .collection("users")
      .where("firebaseUid", "==", decodedToken.uid)
      .get();

    if (usersSnapshot.empty) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Get the first matching user document
    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();

    // Set user information in request
    req.user = {
      id: userDoc.id, // Firestore document ID
      email: userData.email,
      name: userData.name,
      role: userData.role,
      // Add other user properties as needed
    };

    console.log("User set in request:", req.user);
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid token",
    }); 
  }
};

module.exports = {
  errorHandler,
  auth
};
