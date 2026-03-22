import mongoose from "mongoose";
const messageSchema = new mongoose.Schema({
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, maxlength: 2000, default: "" },
  messageType: { type: String, enum: ["text", "contract"], default: "text" },
  contract: { type: mongoose.Schema.Types.ObjectId, ref: "Contract", default: null },
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: "Message", default: null },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  attachments: [{ url: String, fileType: String }],
  deleted: { type: Boolean, default: false },
}, { timestamps: true });
messageSchema.index({ conversation: 1, createdAt: -1 });
const Message = mongoose.model("Message", messageSchema);
export default Message;
