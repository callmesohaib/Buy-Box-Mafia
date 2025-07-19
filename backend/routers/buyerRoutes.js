const express = require("express");
const router = express.Router();
const { addBuyer, importBuyers, getBuyers, deleteBuyer, updateBuyer } = require("../controllers/buyerController");

router.post("/", addBuyer);
router.post("/import", importBuyers);
router.get("/", getBuyers);
router.delete("/:id", deleteBuyer);
router.put("/:id", updateBuyer);

module.exports = router; 