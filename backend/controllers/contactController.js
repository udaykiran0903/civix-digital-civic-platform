const ContactMessage = require("../models/ContactMessage");
const { validationResult } = require("express-validator");

// Send contact message to official
const sendContactMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { citizenId, citizenName, citizenEmail, department, subject, message, location } = req.body;

    const newMessage = new ContactMessage({
      citizenId,
      citizenName,
      citizenEmail,
      department,
      subject,
      message,
      location,
      status: "new",
    });

    await newMessage.save();

    res.status(201).json({
      message: "Contact message sent successfully",
      data: newMessage,
    });
  } catch (error) {
    res.status(500).json({ message: "Error sending contact message", error: error.message });
  }
};

// Get messages for official (for their dashboard)
const getOfficialMessages = async (req, res) => {
  try {
    const { userLocation } = req.query;

    const messages = await ContactMessage.find({
      $or: [{ location: userLocation }, { location: { $exists: false } }],
    }).sort({ createdAt: -1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages", error: error.message });
  }
};

// Get messages for citizen
const getCitizenMessages = async (req, res) => {
  try {
    const { citizenId } = req.query;

    const messages = await ContactMessage.find({ citizenId }).sort({ createdAt: -1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages", error: error.message });
  }
};

// Respond to contact message
const respondToMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { response } = req.body;

    if (!response || !response.trim()) {
      return res.status(400).json({ message: "Response cannot be empty" });
    }

    const message = await ContactMessage.findByIdAndUpdate(
      messageId,
      {
        officialResponse: response,
        status: "responded",
        respondedAt: new Date(),
      },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    res.status(200).json({
      message: "Response sent successfully",
      data: message,
    });
  } catch (error) {
    res.status(500).json({ message: "Error responding to message", error: error.message });
  }
};

// Mark message as read
const markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await ContactMessage.findByIdAndUpdate(
      messageId,
      { status: "read" },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    res.status(200).json({
      message: "Message marked as read",
      data: message,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating message status", error: error.message });
  }
};

module.exports = {
  sendContactMessage,
  getOfficialMessages,
  getCitizenMessages,
  respondToMessage,
  markMessageAsRead,
};
