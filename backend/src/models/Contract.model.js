import mongoose from "mongoose";

const contractSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: "", maxlength: 1000 },
    hirer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    freelancer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    skills: [{ type: String, trim: true }],
    amount: { type: Number, default: 0 },
    rateType: { type: String, enum: ["fixed", "hourly", ""], default: "" },
    status: {
      type: String,
      enum: ["pending", "active", "completed", "cancelled", "disputed"],
      default: "pending",
    },
    startDate: { type: Date },
    endDate: { type: Date },
    completedAt: { type: Date },
    rating: { type: mongoose.Schema.Types.ObjectId, ref: "Rating" },
  },
  { timestamps: true }
);

contractSchema.index({ hirer: 1 });
contractSchema.index({ freelancer: 1 });
contractSchema.index({ status: 1 });

const Contract = mongoose.model("Contract", contractSchema);
export default Contract;
