import mongoose from "mongoose";
const reelSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  videoUrl: { type: String, required: true },
  thumbnailUrl: { type: String, default: "" },
  description: { type: String, default: "", maxlength: 500 },
  tags: [String],
  detectedSkills: [String],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  views: { type: Number, default: 0 },
  duration: { type: Number, default: 0 },
  isPublic: { type: Boolean, default: true },
}, { timestamps: true });
reelSchema.index({ author: 1, createdAt: -1 });
reelSchema.index({ detectedSkills: 1 });
const Reel = mongoose.model("Reel", reelSchema);
export default Reel;
