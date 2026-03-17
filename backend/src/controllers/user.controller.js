import User from "../models/User.model.js";
import { extractResumeData, recommendSeminars } from "../services/ai.service.js";
import { refreshBadge } from "../services/badge.service.js";

// Simple in-memory seminar cache keyed by userId, TTL 30 minutes
const seminarCache = new Map();
const SEMINAR_TTL = 30 * 60 * 1000;
// Clear cached entries so updated prompt takes effect immediately
seminarCache.clear();
export async function getFreelancers(req, res, next) {
  try {
    const { skill, q, location, page = 1, limit = 12 } = req.query;
    const query = { isFreelancer: true, isActive: true };
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: "i" } },
        { skills: { $regex: q, $options: "i" } },
        { bio: { $regex: q, $options: "i" } },
      ];
    } else if (skill) {
      query.skills = { $regex: skill, $options: "i" };
    }
    if (location) query.location = { $regex: location, $options: "i" };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [freelancers, total] = await Promise.all([
      User.find(query).select("-password -chatbotQueries -resumeText").sort({ averageRating: -1 }).skip(skip).limit(parseInt(limit)),
      User.countDocuments(query),
    ]);
    res.json({ freelancers, pagination: { page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), total } });
  } catch (error) { next(error); }
}
export async function getUserProfile(req, res, next) {
  try {
    const user = await User.findById(req.params.id).select("-password -chatbotQueries -resumeText");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) { next(error); }
}
export async function updateProfile(req, res, next) {
  try {
    const { name, bio, location, skills, experience, hourlyRate, serviceCategories, yearsOfExperience, rateType, serviceAreas, availableDays } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;
    if (skills) updateData.skills = Array.isArray(skills) ? skills : skills.split(",").map((s) => s.trim());
    if (serviceCategories) updateData.serviceCategories = Array.isArray(serviceCategories) ? serviceCategories : serviceCategories.split(",").map((s) => s.trim());
    if (experience !== undefined) updateData.experience = experience;
    if (yearsOfExperience !== undefined) updateData.yearsOfExperience = parseInt(yearsOfExperience) || 0;
    if (hourlyRate !== undefined) updateData.hourlyRate = parseFloat(hourlyRate) || 0;
    if (rateType !== undefined) updateData.rateType = rateType;
    if (serviceAreas) updateData.serviceAreas = Array.isArray(serviceAreas) ? serviceAreas : serviceAreas.split(",").map((s) => s.trim());
    if (availableDays) updateData.availableDays = Array.isArray(availableDays) ? availableDays : availableDays.split(",").map((s) => s.trim());
    if (req.file) updateData.profilePhoto = req.file.path;
    const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true }).select("-password -chatbotQueries -resumeText");
    await refreshBadge(user);
    res.json(user);
  } catch (error) { next(error); }
}
export async function uploadResume(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const resumeUrl = req.file.path;
    const extractedData = await extractResumeData(req.file.originalname || "resume").catch(() => ({ skills: [], experienceYears: 0, summary: "" }));
    const updateData = { resumeUrl, isFreelancer: true };
    if (extractedData.skills?.length) updateData.skills = [...new Set([...req.user.skills, ...extractedData.skills])];
    if (extractedData.summary) updateData.bio = extractedData.summary;
    const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true }).select("-password -chatbotQueries -resumeText");
    await refreshBadge(user);
    res.json({ user, extractedData });
  } catch (error) { next(error); }
}

export async function toggleAvailability(req, res, next) {
  try {
    const user = await User.findById(req.user._id);
    user.isOpenForWork = !user.isOpenForWork;
    await user.save();
    res.json({ isOpenForWork: user.isOpenForWork });
  } catch (error) { next(error); }
}

export async function getSidebarData(req, res, next) {
  try {
    const [topFreelancers, totalVerified, totalPosts, hiringPosts, trendingAgg] = await Promise.all([
      User.find({ isFreelancer: true, badgeLevel: 3, isActive: true })
        .select("name profilePhoto location skills averageRating totalRatings badgeLevel isHirer isOpenForWork")
        .sort({ averageRating: -1 })
        .limit(10),
      User.countDocuments({ isVerified: true, isActive: true }),
      (await import("../models/Post.model.js")).default.countDocuments({ isPublic: true }),
      (await import("../models/Post.model.js")).default.find({ isPublic: true, tags: { $regex: /hiring/i } })
        .populate("author", "name profilePhoto")
        .sort({ createdAt: -1 })
        .limit(3),
      (await import("../models/Post.model.js")).default.aggregate([
        { $match: { isPublic: true } },
        { $unwind: "$tags" },
        { $group: { _id: { $toLower: "$tags" }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 12 },
      ]),
    ]);
    // Shuffle top freelancers and pick 5
    const shuffled = topFreelancers.sort(() => Math.random() - 0.5).slice(0, 5);
    res.json({
      topFreelancers: shuffled,
      trendingSkills: trendingAgg.map(t => ({ name: t._id, count: t.count })),
      hiringPosts,
      stats: { verifiedWorkers: totalVerified, totalPosts },
    });
  } catch (error) { next(error); }
}

export async function getSuggestedUsers(req, res, next) {
  try {
    const me = req.user;
    const query = { _id: { $ne: me._id }, isActive: true, isFreelancer: true, badgeLevel: { $gte: 1 } };
    if (me.skills?.length) {
      query.skills = { $in: me.skills };
    }
    const users = await User.find(query)
      .select("name profilePhoto location skills badgeLevel isHirer averageRating")
      .limit(20);
    const shuffled = users.sort(() => Math.random() - 0.5).slice(0, 5);
    res.json(shuffled);
  } catch (error) { next(error); }
}

export async function getSeminars(req, res, next) {
  try {
    const userId = req.user._id.toString();
    const cached = seminarCache.get(userId);
    if (cached && Date.now() - cached.ts < SEMINAR_TTL) {
      return res.json(cached.data);
    }
    const seminars = await recommendSeminars(req.user.skills || [], req.user.badgeLevel || 0);
    seminarCache.set(userId, { ts: Date.now(), data: seminars });
    res.json(seminars);
  } catch (error) { next(error); }
}
