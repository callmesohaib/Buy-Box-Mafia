const { admin } = require("../utils/firebase");
const {
  ROLES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} = require("../utils/constants");

const authController = {
  login: async (req, res, next) => {
    const { email, password } = req.body;

    try {
      // 1. Verify user exists
      const user = await admin.auth().getUserByEmail(email);

      // 2. Verify password (using Firebase Auth)
      // Note: This requires client-side Firebase Auth or a different approach
      // (See important note below about password verification)

      // 3. Get user role from custom claims
      const userRecord = await admin.auth().getUser(user.uid);
      const customClaims = userRecord.customClaims || {};
      
      // Determine role (default to 'scout' if no role specified)
      const role = customClaims.role === ROLES.ADMIN ? ROLES.ADMIN : 
                  customClaims.role === ROLES.SUBADMIN ? ROLES.SUBADMIN : 
                  ROLES.SCOUT;

      // 4. Create custom token with role information
      const token = await admin.auth().createCustomToken(user.uid, { role });

      res.json({
        success: true,
        message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
        token,
        user: {
          uid: user.uid,
          email: user.email,
          role: role
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