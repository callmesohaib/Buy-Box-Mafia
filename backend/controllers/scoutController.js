const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { db } = require("../utils/firebase");
const { ROLES } = require("../utils/constants");
const nodemailer = require("nodemailer");

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Send email with credentials
const sendScoutCredentials = async (email, password, name) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Welcome to Buy Box Mafia - Your Scout Account`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #d72638, #ff1744); color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Buy Box Mafia</h1>
          <p style="margin: 10px 0 0 0;">Scout Account Created</p>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">Welcome, ${name}!</h2>
          <p style="color: #666; line-height: 1.6;">
            Your scout account has been successfully created. Below are your login credentials:
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d72638;">
            <h3 style="margin: 0 0 15px 0; color: #333;">Login Credentials</h3>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 5px 0;"><strong>Password:</strong> ${password}</p>
            <p style="margin: 5px 0;"><strong>Role:</strong> Scout</p>
          </div>
          <p style="color: #666; margin-top: 30px;">
            You can now access the dashboard and manage your assigned responsibilities.
          </p>
        </div>
        <div style="background: #333; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0;">© 2025 Buy Box Mafia. All rights reserved.</p>
        </div>
      </div>
    `,
  };
  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Email sending failed:", error);
    return false;
  }
};

// Register Scout
const registerScout = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "First name, last name, email, and password are required fields",
      });
    }
    // Check if user already exists
    const existingUserQuery = await db.collection("users").where("email", "==", email).get();
    if (!existingUserQuery.empty) {
      return res.status(400).json({
        success: false,
        message: "A user with this email already exists",
      });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    const name = `${firstName} ${lastName}`;
    // Save user in Firestore
    const userRef = await db.collection("users").add({
      name,
      firstName,
      lastName,
      email,
      phone: phone || "",
      password: hashedPassword,
      role: ROLES.SCOUT,
      status: "active",
      createdAt: new Date(),
    });
    // Send email with credentials
    let emailSent = false;
    try {
      emailSent = await sendScoutCredentials(email, password, name);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
    }
    res.status(201).json({
      success: true,
      message: `Scout created successfully`,
      data: {
        id: userRef.id,
        name,
        email,
        role: ROLES.SCOUT,
        emailSent,
      },
    });
  } catch (error) {
    console.error("Error creating scout:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create scout",
      error: error.message,
    });
  }
};


module.exports = {
  registerScout,
};
