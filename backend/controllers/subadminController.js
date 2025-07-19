const { admin, db } = require("../utils/firebase");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const { ROLES } = require("../utils/constants");

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Generate random password
const generatePassword = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Send email with credentials
const sendSubadminCredentials = async (email, password, name, role) => {
  const roleDisplayName = role === ROLES.SUBADMIN ? 'Subadmin' : 
                         role === ROLES.SCOUT ? 'Scout' : 'Admin';
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Welcome to Buy Box Mafia - Your ${roleDisplayName} Account`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #d72638, #ff1744); color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Buy Box Mafia</h1>
          <p style="margin: 10px 0 0 0;">${roleDisplayName} Account Created</p>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">Welcome, ${name}!</h2>
          <p style="color: #666; line-height: 1.6;">
            Your ${roleDisplayName.toLowerCase()} account has been successfully created. Below are your login credentials:
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d72638;">
            <h3 style="margin: 0 0 15px 0; color: #333;">Login Credentials</h3>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 5px 0;"><strong>Password:</strong> ${password}</p>
            <p style="margin: 5px 0;"><strong>Role:</strong> ${roleDisplayName}</p>
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

// Add new user (subadmin or scout)
const addSubadmin = async (req, res) => {
  try {
    const { name, email, phone, location, role, permissions } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !location || !role) {
      return res.status(400).json({
        success: false,
        message: "Name, email, phone, location, and role are required fields",
      });
    }

    // Validate role
    if (!Object.values(ROLES).includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be admin, subadmin, or scout",
      });
    }

    // Check if user already exists in Firestore
    const existingUserQuery = await db.collection("users").where("email", "==", email).get();
    if (!existingUserQuery.empty) {
      return res.status(400).json({
        success: false,
        message: "A user with this email already exists",
      });
    }

    // Check if user exists in Firebase Auth
    try {
      const existingAuthUser = await admin.auth().getUserByEmail(email);
      if (existingAuthUser) {
        return res.status(400).json({
          success: false,
          message: "A user with this email already exists in authentication",
        });
      }
    } catch (error) {
      // User doesn't exist, which is what we want
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
    }

    // Generate password
    const password = generatePassword();
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: name,
    });

    // Set custom claims for role
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      role: role,
      permissions: permissions || ["read", "write"],
    });

    // Store user data in Firestore "users" collection
    const userData = {
      uid: userRecord.uid,
      name: name,
      email: email,
      phone: phone,
      location: location,
      role: role,
      permissions: permissions || ["read", "write"],
      status: "active",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: req.user?.uid || "admin", // Assuming you have user info in request
    };

    await db.collection("users").doc(userRecord.uid).set(userData);

    // Send email with credentials
    let emailSent = false;
    try {
      emailSent = await sendSubadminCredentials(email, password, name, role);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Don't fail the entire request if email fails
    }

    res.status(201).json({
      success: true,
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} created successfully`,
      data: {
        uid: userRecord.uid,
        name: name,
        email: email,
        role: role,
        emailSent: emailSent,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    console.error("Error details:", {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: "Failed to create user",
      error: error.message,
    });
  }
};

// Get all users by role (subadmin, scout, or all)
const getAllSubadmins = async (req, res) => {
  try {
    const { role } = req.query;
    let usersQuery = db.collection("users");
    
    // If role is specified, filter by role
    if (role && Object.values(ROLES).includes(role)) {
      usersQuery = usersQuery.where("role", "==", role);
    }
    
    const usersSnapshot = await usersQuery.get();
    const users = [];

    usersSnapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

// Get user by ID
const getSubadminById = async (req, res) => {
  try {
    const { id } = req.params;
    const userDoc = await db.collection("users").doc(id).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: userDoc.id,
        ...userDoc.data(),
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error: error.message,
    });
  }
};

// Update user
const updateSubadmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, location, role, permissions, status } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (location) updateData.location = location;
    if (role) updateData.role = role;
    if (permissions) updateData.permissions = permissions;
    if (status) updateData.status = status;

    updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    await db.collection("users").doc(id).update(updateData);

    // Update custom claims in Firebase Auth if role changed
    if (role) {
      await admin.auth().setCustomUserClaims(id, {
        role: role,
        permissions: permissions || ["read", "write"],
      });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user",
      error: error.message,
    });
  }
};

// Delete user
const deleteSubadmin = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Attempting to delete user with ID:", id);

    // First, check if the user exists in Firestore
    const userDoc = await db.collection("users").doc(id).get();
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userData = userDoc.data();
    console.log("Found user data:", { uid: userData.uid, email: userData.email });

    // Delete from Firebase Auth using the uid from Firestore
    try {
      await admin.auth().deleteUser(userData.uid);
      console.log("Successfully deleted user from Firebase Auth");
    } catch (authError) {
      console.error("Error deleting from Firebase Auth:", authError);
      // Continue with Firestore deletion even if Auth deletion fails
      // This handles cases where the user might not exist in Auth anymore
    }

    // Delete from Firestore
    await db.collection("users").doc(id).delete();
    console.log("Successfully deleted user from Firestore");

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    console.error("Error details:", {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message,
    });
  }
};

// Reset user password
const resetSubadminPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const password = generatePassword();

    // Update password in Firebase Auth
    await admin.auth().updateUser(id, {
      password: password,
    });

    // Get user data to send email
    const userDoc = await db.collection("users").doc(id).get();
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userData = userDoc.data();
    const emailSent = await sendSubadminCredentials(
      userData.email,
      password,
      userData.name,
      userData.role
    );

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
      data: {
        emailSent: emailSent,
      },
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset password",
      error: error.message,
    });
  }
};

module.exports = {
  addSubadmin,
  getAllSubadmins,
  getSubadminById,
  updateSubadmin,
  deleteSubadmin,
  resetSubadminPassword,
  sendSubadminCredentials,
}; 