const express = require("express");
const router = express.Router();
const dealsController = require("../controllers/dealsController");
// const authMiddleware = require("../middlewares/authMiddleware");

// Apply auth middleware to all routes
// router.use(authMiddleware);

// Get all deals
router.get("/", dealsController.getDeals);

// Get a single deal by ID
router.get("/:id", dealsController.getDealById);

// Get deals by MLS number
router.get("/mls/:mlsNumber", dealsController.getDealsByMlsNumber);

// Get deals by status
router.get("/status/:status", dealsController.getDealsByStatus);

// Get potential buyers for a specific deal
router.get("/:id/matches", dealsController.getDealMatches);

// Get potential buyers count for all deals
router.get("/potential-buyers/count", dealsController.getPotentialBuyersCount);

// Get overview analytics data
router.get("/analytics/overview", dealsController.getOverviewAnalytics);

// Add a new deal
router.post("/", dealsController.addDeal);

// Update a deal
router.put("/:id", dealsController.updateDeal);

// Delete a deal
router.delete("/:id", dealsController.deleteDeal);

// Import multiple deals
router.post("/import", dealsController.importDeals);

module.exports = router; 