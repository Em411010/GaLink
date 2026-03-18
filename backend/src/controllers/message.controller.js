import Conversation from "../models/Conversation.model.js";
import Message from "../models/Message.model.js";
import { getIO } from "../config/socket.js";
import cloudinary from "../config/cloudinary.js";

export async function getConversations(req, res, next) {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate("participants", "name profilePhoto location badgeLevel isHirer")
      .sort({ updatedAt: -1 });
    // Attach unread count per conversation
    const withUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unread = await Message.countDocuments({
          conversation: conv._id,
          sender: { $ne: req.user._id },
          readBy: { $nin: [req.user._id] },
          deleted: false,
        });
        return { ...conv.toObject(), unreadCount: unread };
      })
    );
    res.json(withUnread);
  } catch (error) { next(error); }
}

export async function getOrCreateConversation(req, res, next) {
  try {
    const { userId } = req.body;
    let conv = await Conversation.findOne({ participants: { $all: [req.user._id, userId] } })
      .populate("participants", "name profilePhoto location badgeLevel isHirer");
    if (!conv) {
      conv = await Conversation.create({ participants: [req.user._id, userId] });
      await conv.populate("participants", "name profilePhoto location badgeLevel isHirer");
    }
    res.json(conv);
  } catch (error) { next(error); }
}

export async function getMessages(req, res, next) {
  try {
    const messages = await Message.find({ conversation: req.params.convId })
      .populate("sender", "name profilePhoto")
      .populate({ path: "replyTo", populate: { path: "sender", select: "name" } })
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) { next(error); }
}

export async function sendMessage(req, res, next) {
  try {
    const { text, replyTo } = req.body;
    if (!text?.trim() && !req.file) return res.status(400).json({ message: "Message requires text or attachment" });

    const msgData = {
      conversation: req.params.convId,
      sender: req.user._id,
      text: text?.trim() || "",
      readBy: [req.user._id],
    };
    if (replyTo) msgData.replyTo = replyTo;
    if (req.file) {
      msgData.attachments = [{ url: req.file.path, fileType: req.file.mimetype }];
    }

    const message = await Message.create(msgData);
    await message.populate("sender", "name profilePhoto");
    if (message.replyTo) {
      await message.populate({ path: "replyTo", populate: { path: "sender", select: "name" } });
    }

    await Conversation.findByIdAndUpdate(req.params.convId, {
      lastMessage: { text: text?.trim() || "📎 Attachment", sender: req.user._id, timestamp: new Date() },
    });

    getIO().to(req.params.convId).emit("message:receive", message);
    res.status(201).json(message);
  } catch (error) { next(error); }
}

export async function markAsRead(req, res, next) {
  try {
    await Message.updateMany(
      { conversation: req.params.convId, readBy: { $nin: [req.user._id] } },
      { $addToSet: { readBy: req.user._id } }
    );
    // Notify other participants that messages were seen
    getIO().to(req.params.convId).emit("messages:read", { convId: req.params.convId, userId: req.user._id });
    res.json({ ok: true });
  } catch (error) { next(error); }
}

export async function deleteMessage(req, res, next) {
  try {
    const message = await Message.findById(req.params.msgId);
    if (!message) return res.status(404).json({ message: "Message not found" });
    if (message.sender.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not your message" });
    message.deleted = true;
    message.text = "";
    message.attachments = [];
    await message.save();
    getIO().to(message.conversation.toString()).emit("message:deleted", { msgId: message._id });
    res.json({ ok: true });
  } catch (error) { next(error); }
}

