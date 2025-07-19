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
const sendSubadminCredentials = async (email, password, name) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Welcome to Buy Box Mafia - Your Subadmin Account",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #d72638, #ff1744); color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Buy Box Mafia</h1>
          <p style="margin: 10px 0 0 0;">Subadmin Account Created</p>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">Welcome, ${name}!</h2>
          <p style="color: #666; line-height: 1.6;">
            Your subadmin account has been successfully created. Below are your login credentials:
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d72638;">
            <h3 style="margin: 0 0 15px 0; color: #333;">Login Credentials</h3>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 5px 0;"><strong>Password:</strong> ${password}</p>
          </div>
          

          
          <p style="color: #666; margin-top: 30px;">
            You can now access the subadmin dashboard and manage your assigned responsibilities.
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

// Add new subadmin
const addSubadmin = async (req, res) => {
  try {
    const { name, email, phone, location, role, permissions } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !location) {
      return res.status(400).json({
        success: false,
        message: "Name, email, phone, and location are required fields",
      });
    }

    // Check if subadmin already exists
    try {
      const existingUser = await admin.auth().getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "A user with this email already exists",
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
      // Remove phoneNumber as it might cause issues if not in proper format
    });

    // Set custom claims for subadmin role
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      role: ROLES.SUBADMIN,
      permissions: permissions || ["read", "write"],
    });

    // Store additional data in Firestore
    const subadminData = {
      uid: userRecord.uid,
      name: name,
      email: email,
      phone: phone,
      location: location,
      role: role || ROLES.SUBADMIN,
      permissions: permissions || ["read", "write"],
      status: "active",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: req.user?.uid || "admin", // Assuming you have user info in request
    };

    await db.collection("subadmins").doc(userRecord.uid).set(subadminData);

    // Send email with credentials
    let emailSent = false;
    try {
      emailSent = await sendSubadminCredentials(email, password, name);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Don't fail the entire request if email fails
    }

    res.status(201).json({
      success: true,
      message: "Subadmin created successfully",
      data: {
        uid: userRecord.uid,
        name: name,
        email: email,
        emailSent: emailSent,
      },
    });
  } catch (error) {
    console.error("Error creating subadmin:", error);
    console.error("Error details:", {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: "Failed to create subadmin",
      error: error.message,
    });
  }
};

// Get all subadmins
const getAllSubadmins = async (req, res) => {
  try {
    const subadminsSnapshot = await db.collection("subadmins").get();
    const subadmins = [];

    subadminsSnapshot.forEach((doc) => {
      subadmins.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    res.status(200).json({
      success: true,
      data: subadmins,
    });
  } catch (error) {
    console.error("Error fetching subadmins:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch subadmins",
      error: error.message,
    });
  }
};

// Get subadmin by ID
const getSubadminById = async (req, res) => {
  try {
    const { id } = req.params;
    const subadminDoc = await db.collection("subadmins").doc(id).get();

    if (!subadminDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Subadmin not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: subadminDoc.id,
        ...subadminDoc.data(),
      },
    });
  } catch (error) {
    console.error("Error fetching subadmin:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch subadmin",
      error: error.message,
    });
  }
};

// Update subadmin
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

    await db.collection("subadmins").doc(id).update(updateData);

    res.status(200).json({
      success: true,
      message: "Subadmin updated successfully",
    });
  } catch (error) {
    console.error("Error updating subadmin:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update subadmin",
      error: error.message,
    });
  }
};

// Delete subadmin
const deleteSubadmin = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Attempting to delete subadmin with ID:", id);

    // First, check if the subadmin exists in Firestore
    const subadminDoc = await db.collection("subadmins").doc(id).get();
    if (!subadminDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Subadmin not found",
      });
    }

    const subadminData = subadminDoc.data();
    console.log("Found subadmin data:", { uid: subadminData.uid, email: subadminData.email });

    // Delete from Firebase Auth using the uid from Firestore
    try {
      await admin.auth().deleteUser(subadminData.uid);
      console.log("Successfully deleted user from Firebase Auth");
    } catch (authError) {
      console.error("Error deleting from Firebase Auth:", authError);
      // Continue with Firestore deletion even if Auth deletion fails
      // This handles cases where the user might not exist in Auth anymore
    }

    // Delete from Firestore
    await db.collection("subadmins").doc(id).delete();
    console.log("Successfully deleted subadmin from Firestore");

    res.status(200).json({
      success: true,
      message: "Subadmin deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting subadmin:", error);
    console.error("Error details:", {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: "Failed to delete subadmin",
      error: error.message,
    });
  }
};

// Reset subadmin password
const resetSubadminPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const password = generatePassword();

    // Update password in Firebase Auth
    await admin.auth().updateUser(id, {
      password: password,
    });

    // Get subadmin data to send email
    const subadminDoc = await db.collection("subadmins").doc(id).get();
    if (!subadminDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Subadmin not found",
      });
    }

    const subadminData = subadminDoc.data();
    const emailSent = await sendSubadminCredentials(
      subadminData.email,
      password,
      subadminData.name
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