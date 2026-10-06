const Poll = require("../models/Poll");
const User = require("../models/User");

const escapeRegExp = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const isPollExpired = (poll) => {
  if (!poll?.closesOn) return false;
  return Date.now() > new Date(poll.closesOn).getTime();
};

exports.createPoll = async (req, res) => {
  try {
    const { question, description, state, city, closesOn, options } = req.body;

    const normalizedOptions = Array.isArray(options)
      ? options
          .map((option) => (typeof option === "string" ? option : option?.text))
          .filter((text) => typeof text === "string" && text.trim())
          .map((text) => ({ text: text.trim() }))
      : [];

    if (normalizedOptions.length < 2) {
      return res
        .status(400)
        .json({ message: "Please provide at least 2 options" });
    }

    const poll = await Poll.create({
      question,
      description,
      state,
      city,
      closesOn,
      options: normalizedOptions,
      creator: req.user.id,
    });

    res.status(201).json({ message: "Poll created successfully", poll });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllPolls = async (req, res) => {
  try {
    const polls = await Poll.find()
      .populate("creator", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(polls);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getOfficialLocalityPolls = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("role location");

    const isOfficialOrAdmin = user && ["official", "admin"].includes(user.role);

    if (!isOfficialOrAdmin) {
      return res
        .status(403)
        .json({ message: "Only officials or admins can access this data" });
    }

    const normalizedLocation = String(user.location || "").trim();

    if (!normalizedLocation) {
      return res.status(400).json({ message: "Official location is not set" });
    }

    const polls = await Poll.find({
      state: {
        $regex: `^${escapeRegExp(normalizedLocation)}$`,
        $options: "i",
      },
    })
      .populate("creator", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(polls);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.votePoll = async (req, res) => {
  try {
    const { id } = req.params;
    const { optionIndex } = req.body;

    const poll = await Poll.findById(id);
    if (!poll) return res.status(404).json({ message: "Poll not found" });

    if (poll.status === "closed" || isPollExpired(poll)) {
      if (poll.status !== "closed") {
        poll.status = "closed";
        await poll.save();
      }
      return res.status(400).json({ message: "Poll is closed" });
    }

    const alreadyVoted = poll.votedBy.some(
      (userId) => String(userId) === String(req.user.id),
    );
    if (alreadyVoted) {
      return res
        .status(400)
        .json({ message: "You have already voted on this poll" });
    }

    const index = Number(optionIndex);
    if (Number.isNaN(index) || index < 0 || index >= poll.options.length) {
      return res.status(400).json({ message: "Invalid option" });
    }

    poll.options[index].votes += 1;
    poll.votedBy.push(req.user.id);
    await poll.save();

    const updated = await Poll.findById(id).populate("creator", "name email");

    res
      .status(200)
      .json({ message: "Vote recorded successfully", poll: updated });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.closePoll = async (req, res) => {
  try {
    const { id } = req.params;

    const poll = await Poll.findById(id);
    if (!poll) return res.status(404).json({ message: "Poll not found" });

    if (String(poll.creator) !== String(req.user.id)) {
      return res
        .status(403)
        .json({ message: "Only creator can close this poll" });
    }

    poll.status = "closed";
    await poll.save();

    const updated = await Poll.findById(id).populate("creator", "name email");

    res
      .status(200)
      .json({ message: "Poll closed successfully", poll: updated });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.deletePoll = async (req, res) => {
  try {
    const { id } = req.params;

    const poll = await Poll.findById(id);
    if (!poll) return res.status(404).json({ message: "Poll not found" });

    if (String(poll.creator) !== String(req.user.id)) {
      return res
        .status(403)
        .json({ message: "Only creator can delete this poll" });
    }

    await Poll.findByIdAndDelete(id);

    res.status(200).json({ message: "Poll deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
