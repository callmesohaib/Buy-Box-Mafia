const express = require("express");
const router = express.Router();
const { registerScout, getScoutDetails } = require("../controllers/scoutController");

// Register Scout
router.post("/register", registerScout);


// Get logged-in scout details (requires auth middleware to set req.user)
router.get("/all", getScoutDetails);

module.exports = router;
