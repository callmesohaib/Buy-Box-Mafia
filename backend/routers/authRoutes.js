const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { errorHandler } = require('../middlewares/authmiddleware');
const { ROLES } = require('../utils/constants');

// Admin login route
router.post('/admin/login', authController.login);

// Protected admin route
router.get(
  '/admin/dashboard',
  authController.verifyRole(ROLES.ADMIN),
  (req, res) => {
    res.json({
      success: true,
      message: 'Welcome to Admin Dashboard',
      user: req.user,
    });
  }
);

// Error handling middleware
router.use(errorHandler);

module.exports = router;