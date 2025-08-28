const express = require("express");
const router = express.Router();
const forgotPasswordController = require("../controllers/forgotPasswordController");

// POST /api/auth/verify-email
router.post("/verify-email", forgotPasswordController.verifyEmail);

// GET /api/auth/verify-reset-token
router.get("/verify-reset-token", forgotPasswordController.verifyResetToken);

// POST /api/auth/reset-password
router.post("/reset-password", forgotPasswordController.resetPassword);
// POST /api/auth/change-password
router.post("/change-password", forgotPasswordController.changePassword);

module.exports = router;
