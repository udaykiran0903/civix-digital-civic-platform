const express = require("express");
const router = express.Router();

const {
  sendContactMessage,
  getOfficialMessages,
  getCitizenMessages,
  respondToMessage,
  markMessageAsRead,
} = require("../controllers/contactController");
const authMiddleware = require("../middleware/authMiddleware");

// Citizen routes
router.post("/send", authMiddleware, sendContactMessage);
router.get("/my-messages", authMiddleware, getCitizenMessages);

// Official routes
router.get("/official/messages", authMiddleware, getOfficialMessages);
router.post("/official/respond/:messageId", authMiddleware, respondToMessage);
router.put("/:messageId/read", authMiddleware, markMessageAsRead);

module.exports = router;
