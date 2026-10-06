const express = require("express");
const router = express.Router();

const { respondToPetition } = require("../controllers/officialController");
const authMiddleware = require("../middleware/authMiddleware");
const { getOfficialPetitions } = require("../controllers/officialController");
const { getReportSummary } = require("../controllers/officialController");
const { getOfficialMonthlyLogs } = require("../controllers/officialController");
console.log("official routes loaded");

router.get("/test", (req, res) => {
  res.send("official working");
});

// Official response route
router.post("/respond", authMiddleware, respondToPetition);
router.get("/petitions", authMiddleware, getOfficialPetitions);
router.get("/reports", authMiddleware, getReportSummary);
router.get("/logs/monthly", authMiddleware, getOfficialMonthlyLogs);

module.exports = router;
