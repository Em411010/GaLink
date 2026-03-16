import User from "../models/User.model.js";
import Post from "../models/Post.model.js";
import Reel from "../models/Reel.model.js";
import { refreshBadge } from "../services/badge.service.js";
import { createNotification } from "../services/notification.service.js";

// ── GET /api/admin/stats ──────────────────────────────────────────────────────
export async function getStats(req, res, next) {
  try {
    const [total, byLevel, pendingClearances, pendingKYC, banned, totalPosts, totalReels, recentUsers] = await Promise.all([
      User.countDocuments({ isAdmin: false }),
      User.aggregate([
        { $match: { isAdmin: false } },
        { $group: { _id: "$badgeLevel", count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      User.countDocuments({ clearanceStatus: "pending" }),
      User.countDocuments({ kycStatus: "pending" }),
      User.countDocuments({ isActive: false, isAdmin: false }),
      Post.countDocuments(),
      Reel.countDocuments(),
      User.countDocuments({
        isAdmin: false,
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }),
    ]);

    const levelMap = { 0: 0, 1: 0, 2: 0, 3: 0 };
    byLevel.forEach(({ _id, count }) => { levelMap[_id] = count; });

    res.json({ total, levelMap, pendingClearances, pendingKYC, banned, totalPosts, totalReels, recentUsers });
  } catch (error) { next(error); }
}

// ── GET /api/admin/users ──────────────────────────────────────────────────────
export async function getUsers(req, res, next) {
  try {
    const { page = 1, limit = 20, search = "", badgeLevel } = req.query;
    const query = { isAdmin: false };

    if (search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { email: { $regex: search.trim(), $options: "i" } },
      ];
    }
    if (badgeLevel !== undefined && badgeLevel !== "") {
      query.badgeLevel = Number(badgeLevel);
    }

    const [users, totalCount] = await Promise.all([
      User.find(query)
        .select("name email profilePhoto badgeLevel isHirer isFreelancer isVerified isActive kycStatus kycRejectedReason clearanceStatus clearanceRejectedReason governmentId selfieUrl selfieVerified emailVerified createdAt")
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit)),
      User.countDocuments(query),
    ]);

    res.json({ users, totalCount, page: Number(page), totalPages: Math.ceil(totalCount / Number(limit)) });
  } catch (error) { next(error); }
}

// ── GET /api/admin/pending-clearances ─────────────────────────────────────────
export async function getPendingClearances(req, res, next) {
  try {
    const users = await User.find({ clearanceStatus: "pending" })
      .select("name email profilePhoto badgeLevel clearance clearanceStatus createdAt")
      .sort({ "clearance.uploadedAt": 1 });
    res.json({ users });
  } catch (error) { next(error); }
}

// ── POST /api/admin/users/:id/approve-clearance ────────────────────────────────
export async function approveClearance(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.clearance?.url) return res.status(400).json({ message: "No clearance uploaded" });

    user.clearance.verified = true;
    user.clearanceStatus = "approved";
    user.clearanceRejectedReason = "";
    await refreshBadge(user);
    await createNotification({ recipient: user._id, sender: req.user._id, type: "clearance_approved", message: "Your police/NBI clearance has been approved." });
    res.json({ message: "Clearance approved", badgeLevel: user.badgeLevel });
  } catch (error) { next(error); }
}

// ── POST /api/admin/users/:id/reject-clearance ─────────────────────────────────
export async function rejectClearance(req, res, next) {
  try {
    const { reason = "Document not accepted" } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.clearance.verified = false;
    user.clearanceStatus = "rejected";
    user.clearanceRejectedReason = reason;
    await user.save();
    await createNotification({ recipient: user._id, sender: req.user._id, type: "clearance_rejected", message: reason });
    res.json({ message: "Clearance rejected" });
  } catch (error) { next(error); }
}

// ── POST /api/admin/users/:id/approve-kyc ─────────────────────────────────────
// Admin reviews the uploaded gov ID + selfie and approves them
export async function approveKYC(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.governmentId?.url || !user.selfieUrl) {
      return res.status(400).json({ message: "User has not uploaded ID and selfie yet" });
    }

    user.governmentId.verified = true;
    user.selfieVerified = true;
    user.kycStatus = "approved";
    user.kycRejectedReason = "";
    await refreshBadge(user);

    res.json({ message: "KYC approved", badgeLevel: user.badgeLevel });
  } catch (error) { next(error); }
}

// ── POST /api/admin/users/:id/approve-government-id ───────────────────────────
export async function approveGovernmentId(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.governmentId?.url) return res.status(400).json({ message: "No government ID uploaded" });
    user.governmentId.verified = true;
    if (user.selfieVerified) { user.kycStatus = "approved"; user.kycRejectedReason = ""; }
    await refreshBadge(user);
    await createNotification({ recipient: user._id, sender: req.user._id, type: "kyc_approved", message: "Your Government ID has been approved." });
    res.json({ message: "Government ID approved", badgeLevel: user.badgeLevel });
  } catch (error) { next(error); }
}

// ── POST /api/admin/users/:id/reject-government-id ───────────────────────────
export async function rejectGovernmentId(req, res, next) {
  try {
    const { reason = "Government ID not accepted" } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.governmentId = { url: "", type: "", verified: false };
    user.kycStatus = "rejected";
    user.kycRejectedReason = reason;
    await user.save();
    await createNotification({ recipient: user._id, sender: req.user._id, type: "kyc_rejected", message: reason });
    res.json({ message: "Government ID rejected" });
  } catch (error) { next(error); }
}

// ── POST /api/admin/users/:id/approve-selfie ──────────────────────────────────
export async function approveSelfie(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.selfieUrl) return res.status(400).json({ message: "No selfie uploaded" });
    user.selfieVerified = true;
    if (user.governmentId?.verified) { user.kycStatus = "approved"; user.kycRejectedReason = ""; }
    await refreshBadge(user);
    await createNotification({ recipient: user._id, sender: req.user._id, type: "selfie_approved", message: "Your selfie photo has been approved." });
    res.json({ message: "Selfie approved", badgeLevel: user.badgeLevel });
  } catch (error) { next(error); }
}

// ── POST /api/admin/users/:id/reject-selfie ───────────────────────────────────
export async function rejectSelfie(req, res, next) {
  try {
    const { reason = "Selfie not accepted" } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.selfieUrl = "";
    user.selfieVerified = false;
    user.kycStatus = "rejected";
    user.kycRejectedReason = reason;
    await user.save();
    await createNotification({ recipient: user._id, sender: req.user._id, type: "selfie_rejected", message: reason });
    res.json({ message: "Selfie rejected" });
  } catch (error) { next(error); }
}

// ── POST /api/admin/users/:id/reject-kyc ──────────────────────────────────────
export async function rejectKYC(req, res, next) {
  try {
    const { reason = "Documents not accepted" } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.governmentId = { url: "", type: "", verified: false };
    user.selfieUrl = "";
    user.selfieVerified = false;
    user.kycStatus = "rejected";
    user.kycRejectedReason = reason;
    await user.save();

    res.json({ message: "KYC rejected" });
  } catch (error) { next(error); }
}

// ── GET /api/admin/pending-kyc ────────────────────────────────────────────────
export async function getPendingKYC(req, res, next) {
  try {
    const { user } = req.query;
    // If a specific user is requested, fetch that user directly
    const filter = user
      ? { _id: user }
      : {
          $or: [
            { "governmentId.url": { $ne: "" }, "governmentId.verified": false },
            { selfieUrl: { $ne: "" }, selfieVerified: false },
          ],
        };
    // Only show users who have at least one uploaded doc that is NOT yet verified
    const users = await User.find(filter)
      .select("name email profilePhoto badgeLevel governmentId selfieUrl selfieVerified kycStatus kycRejectedReason createdAt")
      .sort({ createdAt: 1 });
    res.json({ users });
  } catch (error) { next(error); }
}

// ── POST /api/admin/users/:id/revoke ──────────────────────────────────────────
export async function revokeUser(req, res, next) {
  try {
    const { reason = "" } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.governmentId = { url: "", type: "", verified: false };
    user.selfieUrl = "";
    user.selfieVerified = false;
    user.kycStatus = "";
    user.kycRejectedReason = "";
    user.clearance = { url: "", type: "", verified: false };
    user.clearanceStatus = "";
    user.clearanceRejectedReason = reason;
    user.badgeLevel = 0;
    user.isHirer = false;
    user.isFreelancer = false;
    user.isVerified = false;
    await user.save();
    await createNotification({ recipient: user._id, sender: req.user._id, type: "verification_revoked", message: reason || "Your verification has been revoked by an admin." });

    res.json({ message: "User verification revoked" });
  } catch (error) { next(error); }
}

// ── POST /api/admin/users/:id/ban ─────────────────────────────────────────────
export async function banUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isAdmin) return res.status(400).json({ message: "Cannot ban an admin" });

    user.isActive = false;
    await user.save();
    res.json({ message: "User banned" });
  } catch (error) { next(error); }
}

// ── POST /api/admin/users/:id/unban ───────────────────────────────────────────
export async function unbanUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isActive = true;
    await user.save();
    res.json({ message: "User unbanned" });
  } catch (error) { next(error); }
}

// ── GET /api/admin/posts ──────────────────────────────────────────────────────
export async function getPosts(req, res, next) {
  try {
    const { page = 1, limit = 20, search = "" } = req.query;
    const query = {};
    if (search.trim()) {
      query.content = { $regex: search.trim(), $options: "i" };
    }

    const [posts, totalCount] = await Promise.all([
      Post.find(query)
        .populate("author", "name email profilePhoto badgeLevel")
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit)),
      Post.countDocuments(query),
    ]);

    res.json({ posts, totalCount, page: Number(page), totalPages: Math.ceil(totalCount / Number(limit)) });
  } catch (error) { next(error); }
}

// ── GET /api/admin/posts/:id ──────────────────────────────────────────────────
export async function getPost(req, res, next) {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "name email profilePhoto badgeLevel")
      .populate("comments.author", "name profilePhoto")
      .populate("comments.replies.author", "name profilePhoto");
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json({ post });
  } catch (error) { next(error); }
}

// ── DELETE /api/admin/posts/:id ───────────────────────────────────────────────
export async function deletePost(req, res, next) {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.author) {
      await createNotification({ recipient: post.author, sender: req.user._id, type: "post_removed", message: post.content ? `Your post "${post.content.slice(0, 60)}" was removed by an admin.` : "Your post was removed by an admin." });
    }
    res.json({ message: "Post deleted" });
  } catch (error) { next(error); }
}
// ── DELETE /api/admin/posts/:id/comments/:commentId ───────────────────────────
export async function deleteComment(req, res, next) {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    comment.deleteOne();
    await post.save();
    res.json({ message: "Comment deleted" });
  } catch (error) { next(error); }
}
// ── GET /api/admin/reels ──────────────────────────────────────────────────────
export async function getReels(req, res, next) {
  try {
    const { page = 1, limit = 20, search = "" } = req.query;
    const query = {};
    if (search.trim()) {
      query.description = { $regex: search.trim(), $options: "i" };
    }

    const [reels, totalCount] = await Promise.all([
      Reel.find(query)
        .populate("author", "name email profilePhoto badgeLevel")
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit)),
      Reel.countDocuments(query),
    ]);

    res.json({ reels, totalCount, page: Number(page), totalPages: Math.ceil(totalCount / Number(limit)) });
  } catch (error) { next(error); }
}

// ── GET /api/admin/reels/:id ──────────────────────────────────────────────────
export async function getReel(req, res, next) {
  try {
    const reel = await Reel.findById(req.params.id)
      .populate("author", "name email profilePhoto badgeLevel");
    if (!reel) return res.status(404).json({ message: "Reel not found" });
    res.json({ reel });
  } catch (error) { next(error); }
}

// ── DELETE /api/admin/reels/:id ───────────────────────────────────────────────
export async function deleteReel(req, res, next) {
  try {
    const reel = await Reel.findByIdAndDelete(req.params.id);
    if (!reel) return res.status(404).json({ message: "Reel not found" });
    if (reel.author) {
      await createNotification({ recipient: reel.author, sender: req.user._id, type: "reel_removed", message: reel.description ? `Your reel "${reel.description.slice(0, 60)}" was removed by an admin.` : "Your reel was removed by an admin." });
    }
    res.json({ message: "Reel deleted" });
  } catch (error) { next(error); }
}
