const { db } = require("../utils/firebase");
const bcrypt = require("bcryptjs");
const { SUCCESS_MESSAGES } = require("../utils/constants");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

// Email transporter configuration (same as scoutController)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const forgotPasswordController = {
  // Step 1: Verify email exists
  verifyEmail: async (req, res, next) => {
    const { email } = req.body;
    try {
      const userSnap = await db
        .collection("users")
        .where("email", "==", email)
        .get();
      if (userSnap.empty) {
        return res
          .status(404)
          .json({ success: false, message: "Email not found" });
      }
      const userDoc = userSnap.docs[0];
      const userId = userDoc.id;
      // Generate a secure token
      const token = crypto.randomBytes(32).toString("hex");
      const expires = Date.now() + 1000 * 60 * 30; 
      // Save token and expiry to user doc
      await db.collection("users").doc(userId).update({
        resetPasswordToken: token,
        resetPasswordExpires: expires,
      });
      // Send email with reset link
      const resetUrl = `${
        process.env.FRONTEND_URL || "http://localhost:5173"
      }/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
      console.log(`Reset URL: ${resetUrl}`);
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Reset your Buy Box Mafia password",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #d72638, #ff1744); color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">Buy Box Mafia</h1>
              <p style="margin: 10px 0 0 0;">Password Reset Request</p>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
              <h2 style="color: #333;">Reset Your Password</h2>
              <p style="color: #666; line-height: 1.6;">We received a request to reset your password. Click the button below to verify your email and reset your password. This link will expire in 30 minutes.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background: #d72638; color: white; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: bold;">Verify & Reset Password</a>
              </div>
              <p style="color: #999; font-size: 13px;">If you did not request this, you can safely ignore this email.</p>
            </div>
            <div style="background: #333; color: white; padding: 20px; text-align: center;">
              <p style="margin: 0;">© 2025 Buy Box Mafia. All rights reserved.</p>
            </div>
          </div>
        `,
      };
      await transporter.sendMail(mailOptions);
      return res.json({ success: true, message: "Password reset email sent" });
    } catch (error) {
      next(error);
    }
  },

  // Step 1.5: Verify reset token
  verifyResetToken: async (req, res, next) => {
    const { email, token } = req.query;
    try {
      const userSnap = await db
        .collection("users")
        .where("email", "==", email)
        .where("resetPasswordToken", "==", token)
        .get();
      if (userSnap.empty) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid or expired token" });
      }
      const user = userSnap.docs[0].data();
      if (
        !user.resetPasswordExpires ||
        user.resetPasswordExpires < Date.now()
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Token expired" });
      }
      return res.json({ success: true, message: "Token valid" });
    } catch (error) {
      next(error);
    }
  },

  // Step 2: Reset password
  resetPassword: async (req, res, next) => {
    const { email, password } = req.body;
    try {
      const userSnap = await db
        .collection("users")
        .where("email", "==", email)
        .get();
      if (userSnap.empty) {
        return res
          .status(404)
          .json({ success: false, message: "Email not found" });
      }
      const userDoc = userSnap.docs[0];
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.collection("users").doc(userDoc.id).update({
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      });
      return res.json({
        success: true,
        message: SUCCESS_MESSAGES.PASSWORD_RESET || "Password reset successful",
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = forgotPasswordController;
