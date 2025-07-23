const express = require("express");
const router = express.Router();
const { registerScout, loginScout } = require("../controllers/scoutController");

// Register Scout
router.post("/register", registerScout);

module.exports = router;
