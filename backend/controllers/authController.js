
const { admin, db } = require("../utils/firebase");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  ROLES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} = require("../utils/constants");

const authController = {
  login: async (req, res, next) => {
    const { email, password } = req.body;
    try {
      // 1. Find user in Firestore
      const userSnap = await db.collection("users").where("email", "==", email).get();
      if (userSnap.empty) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
      }
      const userDoc = userSnap.docs[0];
      const user = userDoc.data();

      // 2. Verify password using bcrypt
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
      }

      // 3. Generate JWT (or Firebase custom token if you want)
      // We'll use JWT for simplicity
      const token = jwt.sign(
        { id: userDoc.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({
        success: true,
        message: SUCCESS_MESSAGES.LOGIN_SUCCESS || "Login successful",
        token,
        user: {
          id: userDoc.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  verifyRole: (requiredRole) => async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error(ERROR_MESSAGES.UNAUTHORIZED));
      }

      const decodedToken = await admin.auth().verifyIdToken(token);
      
      // Check if user has the required role or higher
      if (
        (requiredRole === ROLES.SCOUT && decodedToken.role) ||
        (requiredRole === ROLES.SUBADMIN && 
          (decodedToken.role === ROLES.SUBADMIN || decodedToken.role === ROLES.ADMIN)) ||
        (requiredRole === ROLES.ADMIN && decodedToken.role === ROLES.ADMIN)
      ) {
        req.user = decodedToken;
        return next();
      }

      return next(new Error(ERROR_MESSAGES.ACCESS_DENIED));
    } catch (error) {
      next(error);
    }
  }
};

module.exports = authController;