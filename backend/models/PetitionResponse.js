const mongoose = require("mongoose");

const petitionResponseSchema = new mongoose.Schema({
  petition_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Petition",
    required: true,
  },
  official_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  comment: {
    type: String,
  },
  status_update: {
    type: String,
    enum: ["active", "under_review", "closed", "resolved"],
  },
}, { timestamps: true });

module.exports = mongoose.model("PetitionResponse", petitionResponseSchema);