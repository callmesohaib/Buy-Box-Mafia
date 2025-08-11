// controllers/uploadController.js
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const multer = require("multer");
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// multer memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max - adjust if needed
});

// helper: upload buffer to cloudinary (resource_type: 'raw' for pdfs/docs)
function uploadBufferToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

// Controller: POST / -> upload single file (form field: file)
exports.singleUpload = [
  // middleware to parse single file into req.file
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: "No file provided" });
      }

      // validate mimetype (allow PDF). adjust as needed.
      if (req.file.mimetype !== "application/pdf") {
        return res.status(400).json({ success: false, message: "Only PDF files are allowed" });
      }

      const options = {
        resource_type: "raw",                // important for pdf/doc files
        folder: "deals/contracts",          // optional: organize in folder
        use_filename: true,
        unique_filename: false,             // keep original name when possible
        overwrite: false,
      };

      const result = await uploadBufferToCloudinary(req.file.buffer, options);

      // result contains secure_url, public_id, bytes, format, original_filename ...
      return res.status(201).json({
        success: true,
        message: "File uploaded",
        file: {
          url: result.secure_url,
          public_id: result.public_id,
          bytes: result.bytes,
          format: result.format,
          original_filename: result.original_filename || req.file.originalname,
        },
      });
    } catch (err) {
      console.error("Upload error:", err);
      return res.status(500).json({ success: false, message: err.message || "Upload failed" });
    }
  },
];

// Controller: DELETE /:publicId -> delete file by public_id
exports.deleteByPublicId = async (req, res) => {
  try {
    const { publicId } = req.params;
    if (!publicId) {
      return res.status(400).json({ success: false, message: "Missing publicId param" });
    }

    const result = await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });

    // cloudinary returns result: 'ok' or 'not found' etc
    return res.status(200).json({ success: true, message: "Delete result", result });
  } catch (err) {
    console.error("Cloudinary delete error:", err);
    return res.status(500).json({ success: false, message: err.message || "Delete failed" });
  }
};
