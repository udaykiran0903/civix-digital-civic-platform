const Petition = require("../models/Petition");
const Signature = require("../models/Signature");
const User = require("../models/User");
const PetitionResponse = require("../models/PetitionResponse");
const OfficialLog = require("../models/OfficialLog");

const escapeRegExp = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
exports.createPetition = async (req, res) => {
  try {
    const { title, description, category, location } = req.body;

    const petition = new Petition({
      title,
      description,
      category,
      location,
      creator: req.user.id,
    });

    await petition.save();

    res.status(201).json({
      message: "Petition created successfully",
      petition,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};
exports.getAllPetitions = async (req, res) => {
  try {
    const petitions = await Petition.find().populate("creator", "name email");

    res.status(200).json(petitions);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getOfficialLocalityPetitions = async (req, res) => {
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

    const petitions = await Petition.find({
      location: {
        $regex: `^${escapeRegExp(normalizedLocation)}$`,
        $options: "i",
      },
    }).populate("creator", "name email");

    res.status(200).json(petitions);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.editPetition = async (req, res) => {
  try {
    const { id } = req.params;

    const petition = await Petition.findById(id);

    if (!petition) {
      return res.status(404).json({ message: "Petition not found" });
    }

    // allow only creator to edit
    if (petition.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const updated = await Petition.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    res.json({
      message: "Petition updated successfully",
      petition: updated,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deletePetition = async (req, res) => {
  try {
    const { id } = req.params;

    const petition = await Petition.findById(id);

    if (!petition) {
      return res.status(404).json({ message: "Petition not found" });
    }

    if (petition.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await Petition.findByIdAndDelete(id);
    await Signature.deleteMany({ petition: id });

    res.json({ message: "Petition deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.filterPetitions = async (req, res) => {
  try {
    const { location, category } = req.query;

    let filter = {};

    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }

    if (category) {
      filter.category = { $regex: category, $options: "i" };
    }

    const petitions = await Petition.find(filter);

    res.json(petitions);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const petition = await Petition.findById(id);

    if (!petition)
      return res.status(404).json({ message: "Petition not found" });

    if (petition.creator.toString() !== req.user.id)
      return res.status(403).json({
        message: "Only creator can update status",
      });

    petition.status = status;
    await petition.save();

    res.json({
      message: "Status updated successfully",
      petition,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.signPetition = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // check petition exists
    const petition = await Petition.findById(id);
    if (!petition)
      return res.status(404).json({ message: "Petition not found" });

    // create signature (unique index handles duplicate)
    await Signature.create({
      petition: id,
      user: userId,
    });

    // increment count safely
    await Petition.findByIdAndUpdate(id, {
      $inc: { signatureCount: 1 },
      $addToSet: { signatures: userId },
    });

    res.json({
      message: "Petition signed successfully",
    });
  } catch (error) {
    // duplicate sign attempt
    if (error.code === 11000) {
      return res.status(200).json({
        message: "You already signed this petition",
      });
    }

    res.status(500).json({ error: error.message });
  }
};

exports.officialRespondToPetition = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment, status } = req.body;

    const officialUser = await User.findById(req.user.id).select(
      "role location name",
    );

    const isOfficialOrAdmin = officialUser
      && ["official", "admin"].includes(officialUser.role);

    if (!isOfficialOrAdmin) {
      return res.status(403).json({
        message: "Only officials can respond to petitions",
      });
    }

    const petition = await Petition.findById(id).populate("creator", "name email");

    if (!petition) {
      return res.status(404).json({ message: "Petition not found" });
    }

    const sameLocality =
      String(petition.location || "").trim().toLowerCase()
      === String(officialUser.location || "").trim().toLowerCase();

    if (!sameLocality && officialUser.role !== "admin") {
      return res.status(403).json({
        message: "You can only respond to petitions in your locality",
      });
    }

    const nextStatus = status || "under_review";

    if (!["active", "under_review", "closed", "resolved"].includes(nextStatus)) {
      return res.status(400).json({ message: "Invalid status update" });
    }

    await PetitionResponse.create({
      petition_id: petition._id,
      official_id: req.user.id,
      comment: comment || "",
      status_update: nextStatus,
    });

    petition.status = nextStatus;
    await petition.save();

    await OfficialLog.create({
      action: `Responded to petition \"${petition.title}\" with status ${nextStatus}`,
      user_id: req.user.id,
    });

    res.status(200).json({
      message: "Official response submitted successfully",
      petition,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
};
