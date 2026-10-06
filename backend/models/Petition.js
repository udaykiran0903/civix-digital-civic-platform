const mongoose = require("mongoose");

const PetitionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true
    },

    category: {
      type: String,
      required: true
    },

    location: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: ["active", "closed", "resolved","under_review"],
      default: "active"
    },

    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // 👇 signatures count + users list
    signatures: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    signatureCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Petition", PetitionSchema);
