import Reel from "../models/Reel.model.js";
import { analyzeReelContent } from "../services/ai.service.js";
import { createNotification } from "../services/notification.service.js";
export async function getReels(req, res, next) {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [reels, total] = await Promise.all([
      Reel.find({ isPublic: true }).populate("author", "name profilePhoto location isFreelancer").sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Reel.countDocuments({ isPublic: true }),
    ]);
    res.json({ reels, pagination: { page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), total } });
  } catch (error) { next(error); }
}
export async function createReel(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ message: "Video file required" });
    const { description, tags } = req.body;
    const aiData = await analyzeReelContent(description || "", "").catch(() => ({ tags: [], detectedSkills: [] }));
    const reel = await Reel.create({ author: req.user._id, videoUrl: req.file.path, description: description || "", tags: [...(tags ? tags.split(",").map((t) => t.trim()) : []), ...aiData.tags], detectedSkills: aiData.detectedSkills });
    await reel.populate("author", "name profilePhoto location isFreelancer");
    res.status(201).json(reel);
  } catch (error) { next(error); }
}
export async function likeReel(req, res, next) {
  try {
    const reel = await Reel.findById(req.params.id);
    if (!reel) return res.status(404).json({ message: "Reel not found" });
    const idx = reel.likes.indexOf(req.user._id);
    idx === -1 ? reel.likes.push(req.user._id) : reel.likes.splice(idx, 1);
    await reel.save();
    // Notify reel author on like (not unlike)
    if (idx === -1) {
      createNotification({ recipient: reel.author, sender: req.user._id, type: "like_reel", reel: reel._id, message: "liked your reel" });
    }
    res.json({ likes: reel.likes.length, liked: idx === -1 });
  } catch (error) { next(error); }
}
