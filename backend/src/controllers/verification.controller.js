import crypto from "crypto";
import User from "../models/User.model.js";
import { refreshBadge, getBadgeChecklist } from "../services/badge.service.js";
import { sendOtpEmail } from "../services/email.service.js";

// GET /api/verification/status — current badge + checklist
export async function getVerificationStatus(req, res, next) {
  try {
    const user = await User.findById(req.user._id).select("-password -chatbotQueries -resumeText");
    const checklist = getBadgeChecklist(user);
    res.json({
      badgeLevel: user.badgeLevel,
      checklist,
      kycStatus: user.kycStatus || "",
      kycRejectedReason: user.kycRejectedReason || "",
      governmentIdUploaded: !!user.governmentId?.url,
      selfieUploaded: !!user.selfieUrl,
      clearanceStatus: user.clearanceStatus || "",
      clearanceRejectedReason: user.clearanceRejectedReason || "",
    });
  } catch (error) { next(error); }
}

// POST /api/verification/email/send-otp — generate & email a 6-digit OTP
export async function sendEmailOtp(req, res, next) {
  try {
    const user = await User.findById(req.user._id);
    if (user.emailVerified) return res.status(400).json({ message: "Email already verified" });
    const otp = String(crypto.randomInt(100000, 999999));
    user.emailOtp = otp;
    user.emailOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();
    await sendOtpEmail(user.email, otp);
    res.json({ message: `OTP sent to ${user.email}` });
  } catch (error) { next(error); }
}

// POST /api/verification/email/verify — confirm OTP and mark email verified
export async function confirmEmailOtp(req, res, next) {
  try {
    const { otp } = req.body;
    if (!otp) return res.status(400).json({ message: "OTP is required" });
    const user = await User.findById(req.user._id);
    if (user.emailVerified) return res.status(400).json({ message: "Email already verified" });
    if (!user.emailOtp || !user.emailOtpExpiresAt)
      return res.status(400).json({ message: "No OTP requested. Please request a new code." });
    if (new Date() > user.emailOtpExpiresAt)
      return res.status(400).json({ message: "OTP has expired. Please request a new code." });
    if (user.emailOtp !== String(otp).trim())
      return res.status(400).json({ message: "Invalid OTP. Please check the code and try again." });
    user.emailVerified = true;
    user.emailOtp = "";
    user.emailOtpExpiresAt = null;
    await refreshBadge(user);
    res.json({ badgeLevel: user.badgeLevel, emailVerified: true });
  } catch (error) { next(error); }
}

// POST /api/verification/government-id — upload gov ID (pending admin review)
export async function uploadGovernmentId(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const { idType } = req.body; // "PhilSys" | "Passport" | "Driver License" | "SSS" | "UMID"
    const user = await User.findById(req.user._id);
    user.governmentId = {
      url: req.file.path,
      type: idType || "Government ID",
      verified: false, // admin must approve
      uploadedAt: new Date(),
    };
    // Mark pending for admin review immediately on upload
    user.kycStatus = "pending";
    user.kycRejectedReason = "";
    await user.save();
    res.json({ message: "Government ID uploaded. Awaiting admin review.", kycStatus: user.kycStatus || "" });
  } catch (error) { next(error); }
}

// POST /api/verification/selfie — upload KYC selfie (pending admin review)
export async function uploadSelfie(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const user = await User.findById(req.user._id);
    user.selfieUrl = req.file.path;
    user.selfieVerified = false; // admin must approve
    // Mark pending for admin review immediately on upload
    user.kycStatus = "pending";
    user.kycRejectedReason = "";
    await user.save();
    res.json({ message: "Selfie uploaded. Awaiting admin review.", kycStatus: user.kycStatus || "" });
  } catch (error) { next(error); }
}

// POST /api/verification/clearance — upload NBI or Police Clearance (pending admin review)
export async function uploadClearance(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const { clearanceType } = req.body; // "NBI" | "Police"
    const user = await User.findById(req.user._id);
    user.clearance = {
      url: req.file.path,
      type: clearanceType || "NBI",
      verified: false, // admin must approve
      uploadedAt: new Date(),
    };
    user.clearanceStatus = "pending";
    user.clearanceRejectedReason = "";
    await user.save();
    res.json({ message: "Clearance uploaded. Awaiting admin review.", clearanceStatus: "pending" });
  } catch (error) { next(error); }
}

// POST /api/verification/portfolio — add portfolio item
export async function addPortfolioItem(req, res, next) {
  try {
    const { title, description, link } = req.body;
    if (!title) return res.status(400).json({ message: "Title is required" });
    const user = await User.findById(req.user._id);
    const item = { title, description: description || "", link: link || "" };
    if (req.file) item.imageUrl = req.file.path;
    user.portfolio.push(item);
    await refreshBadge(user);
    res.json({ badgeLevel: user.badgeLevel, portfolio: user.portfolio });
  } catch (error) { next(error); }
}

// DELETE /api/verification/portfolio/:itemId
export async function removePortfolioItem(req, res, next) {
  try {
    const user = await User.findById(req.user._id);
    user.portfolio = user.portfolio.filter((p) => p._id.toString() !== req.params.itemId);
    await refreshBadge(user);
    res.json({ badgeLevel: user.badgeLevel, portfolio: user.portfolio });
  } catch (error) { next(error); }
}
