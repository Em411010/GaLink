import mongoose from "mongoose";
import bcrypt from "bcrypt";
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  emailVerified: { type: Boolean, default: false },
  emailOtp: { type: String, default: "" },
  emailOtpExpiresAt: { type: Date },
  profilePhoto: { type: String, default: "" },
  bio: { type: String, default: "", maxlength: 500 },
  location: { type: String, default: "" },
  coords: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number] }, // [longitude, latitude]
  },
  skills: [{ type: String, trim: true }],
  experience: { type: String, default: "" },
  hourlyRate: { type: Number, default: 0 },
  isAdmin: { type: Boolean, default: false },
  isHirer: { type: Boolean, default: false },
  isFreelancer: { type: Boolean, default: false },
  isOpenForWork: { type: Boolean, default: false },
  resumeUrl: { type: String, default: "" },
  resumeText: { type: String, default: "" },
  resumeUploadedAt: { type: Date, default: null },
  portfolio: [{ title: String, description: String, imageUrl: String, link: String }],

  // ── Verification / Badge System ──────────────────────────────────────────
  badgeLevel: { type: Number, default: 0, min: 0, max: 3 },
  // Level 1: Hirer
  governmentId: {
    url: { type: String, default: "" },
    type: { type: String, default: "" },      // e.g. "PhilSys", "Passport", "Driver License"
    verified: { type: Boolean, default: false },
    uploadedAt: Date,
  },
  selfieUrl: { type: String, default: "" },    // KYC live selfie
  selfieVerified: { type: Boolean, default: false },
  kycStatus: { type: String, default: "" }, // "" | "pending" | "approved" | "rejected"
  kycRejectedReason: { type: String, default: "" },
  // Level 3: Verified Freelancer
  clearance: {
    url: { type: String, default: "" },
    type: { type: String, default: "" },       // "NBI" | "Police"
    verified: { type: Boolean, default: false },
    uploadedAt: Date,
  },
  clearanceStatus: { type: String, default: "" }, // "" | "pending" | "approved" | "rejected"
  clearanceRejectedReason: { type: String, default: "" },

  chatbotQueries: [{ query: String, extractedSkills: [String], timestamp: { type: Date, default: Date.now } }],
  averageRating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};
userSchema.index({ skills: 1 });
userSchema.index({ location: 1 });
userSchema.index({ isFreelancer: 1 });
userSchema.index({ coords: "2dsphere" }, { sparse: true });
const User = mongoose.model("User", userSchema);
export default User;
