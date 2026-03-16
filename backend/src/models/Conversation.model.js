import mongoose from "mongoose";
const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
  lastMessage: {
    text: String,
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    timestamp: Date,
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
conversationSchema.index({ participants: 1 });
const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;
