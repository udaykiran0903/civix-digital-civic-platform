const mongoose = require("mongoose");

const pollOptionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    votes: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const pollSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    closesOn: {
      type: Date,
      required: true,
    },
    options: {
      type: [pollOptionSchema],
      validate: {
        validator: function (options) {
          return Array.isArray(options) && options.length >= 2;
        },
        message: "At least 2 options are required",
      },
    },
    status: {
      type: String,
      enum: ["active", "closed"],
      default: "active",
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    votedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Poll", pollSchema);
