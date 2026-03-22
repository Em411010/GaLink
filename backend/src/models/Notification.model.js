import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: {
    type: String,
    required: true,
    enum: ["like_post", "like_reel", "comment_post", "match", "follow", "kyc_approved", "kyc_rejected", "selfie_approved", "selfie_rejected", "clearance_approved", "clearance_rejected", "verification_revoked", "post_removed", "reel_removed", "contract_received", "contract_accepted", "contract_declined", "contract_completed", "contract_cancelled", "contract_disputed"],
  },
  // Optional references depending on notification type
  post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", default: null },
  reel: { type: mongoose.Schema.Types.ObjectId, ref: "Reel", default: null },
  contract: { type: mongoose.Schema.Types.ObjectId, ref: "Contract", default: null },
  message: { type: String, default: "" },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
