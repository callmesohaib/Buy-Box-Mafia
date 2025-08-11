// routes/uploadRoutes.js
const express = require("express");
const router = express.Router();
const uploadController = require("../controllers/uploadController");

// POST /api/uploads  -> uploads single file (field name: 'file')
router.post("/", uploadController.singleUpload);

// DELETE /api/uploads/:publicId -> deletes file by public_id (Cloudinary)
router.delete("/:publicId", uploadController.deleteByPublicId);

module.exports = router;
