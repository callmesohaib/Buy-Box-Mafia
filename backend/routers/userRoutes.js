// const express = require('express');
// const router = express.Router();
// const { db } = require('../utils/firebase');

// // GET /api/users/by-email/:email
// router.get('/by-email/:email', async (req, res) => {
//   try {
//     const { email } = req.params;
//     const usersSnap = await db.collection('users').where('email', '==', email).get();
//     if (usersSnap.empty) return res.status(404).json({ success: false, message: 'User not found' });
//     const user = usersSnap.docs[0].data();
//     user.id = usersSnap.docs[0].id;
//     res.json({ success: true, user });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// module.exports = router; 