import Rating from "../models/Rating.model.js";
import User from "../models/User.model.js";
import Contract from "../models/Contract.model.js";

export async function submitRating(req, res, next) {
  try {
    const { workQuality, communication, reliability, comment, contractId } = req.body;
    const { freelancerId } = req.params;
    if (freelancerId === req.user._id.toString()) return res.status(400).json({ message: "Cannot rate yourself" });

    // If contractId is provided, validate it
    if (contractId) {
      const contract = await Contract.findById(contractId);
      if (!contract) return res.status(404).json({ message: "Contract not found" });
      if (contract.hirer.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Only the hirer can rate for this contract" });
      }
      if (contract.status !== "completed") {
        return res.status(400).json({ message: "Can only rate completed contracts" });
      }
      if (contract.freelancer.toString() !== freelancerId) {
        return res.status(400).json({ message: "Freelancer does not match contract" });
      }
    }

    const query = { reviewer: req.user._id, freelancer: freelancerId, contract: contractId || null };
    const existing = await Rating.findOne(query);
    let rating;
    if (existing) {
      Object.assign(existing, { workQuality, communication, reliability, comment });
      rating = await existing.save();
    } else {
      rating = await Rating.create({ ...query, workQuality, communication, reliability, comment });
    }

    // Link rating to contract
    if (contractId) {
      await Contract.findByIdAndUpdate(contractId, { rating: rating._id });
    }

    const ratings = await Rating.find({ freelancer: freelancerId });
    const avg = ratings.reduce((sum, r) => sum + r.averageScore, 0) / ratings.length;
    await User.findByIdAndUpdate(freelancerId, { averageRating: Math.round(avg * 10) / 10, totalRatings: ratings.length });
    res.json(rating);
  } catch (error) { next(error); }
}
export async function getFreelancerRatings(req, res, next) {
  try {
    const ratings = await Rating.find({ freelancer: req.params.freelancerId }).populate("reviewer", "name profilePhoto").sort({ createdAt: -1 });
    const stats = ratings.length ? {
      total: ratings.length,
      average: Math.round((ratings.reduce((s, r) => s + r.averageScore, 0) / ratings.length) * 10) / 10,
      workQuality: Math.round((ratings.reduce((s, r) => s + r.workQuality, 0) / ratings.length) * 10) / 10,
      communication: Math.round((ratings.reduce((s, r) => s + r.communication, 0) / ratings.length) * 10) / 10,
      reliability: Math.round((ratings.reduce((s, r) => s + r.reliability, 0) / ratings.length) * 10) / 10,
    } : { total: 0, average: 0 };
    res.json({ ratings, stats });
  } catch (error) { next(error); }
}
