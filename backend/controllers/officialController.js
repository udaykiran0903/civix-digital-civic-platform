const Petition = require("../models/Petition");
const PetitionResponse = require("../models/PetitionResponse");
const OfficialLog = require("../models/OfficialLog");

// Official response to petition
exports.respondToPetition = async (req, res) => {
  try {
    const { petition_id, comment, status } = req.body;

    // save response
    const response = await PetitionResponse.create({
      petition_id,
      official_id: req.user.id,
      comment,
      status_update: status,
    });

    // update petition status
    await Petition.findByIdAndUpdate(petition_id, {
      status: status,
    });

    res.json({
      message: "Response added successfully",
      response,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getOfficialPetitions = async (req, res) => {
  try {
    const userLocation = req.user.location;

    const petitions = await Petition.find({
      location: userLocation,
    });

    res.json(petitions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const Poll = require("../models/Poll");

exports.getReportSummary = async (req, res) => {
  try {
    const totalPetitions = await Petition.countDocuments();
    const totalPolls = await Poll.countDocuments();

    const statusData = await Petition.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      totalPetitions,
      totalPolls,
      statusData,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOfficialMonthlyLogs = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month } = req.query;

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({
        message: "Month is required in YYYY-MM format",
      });
    }

    const [year, mon] = month.split("-").map(Number);
    const startDate = new Date(Date.UTC(year, mon - 1, 1));
    const endDate = new Date(Date.UTC(year, mon, 1));

    const logs = await OfficialLog.find({
      user_id: userId,
      timestamp: {
        $gte: startDate,
        $lt: endDate,
      },
    })
      .sort({ timestamp: -1 })
      .limit(200);

    return res.status(200).json({
      month,
      count: logs.length,
      logs,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
