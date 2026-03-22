import mongoose from "mongoose";
const ratingSchema = new mongoose.Schema({
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  freelancer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  contract: { type: mongoose.Schema.Types.ObjectId, ref: "Contract", default: null },
  workQuality: { type: Number, min: 1, max: 5, required: true },
  communication: { type: Number, min: 1, max: 5, required: true },
  reliability: { type: Number, min: 1, max: 5, required: true },
  averageScore: { type: Number },
  comment: { type: String, maxlength: 1000 },
}, { timestamps: true });
ratingSchema.pre("save", function (next) {
  this.averageScore = (this.workQuality + this.communication + this.reliability) / 3;
  next();
});
ratingSchema.index({ freelancer: 1 });
ratingSchema.index({ reviewer: 1, freelancer: 1, contract: 1 }, { unique: true });
const Rating = mongoose.model("Rating", ratingSchema);
export default Rating;
