import Notification from "../models/Notification.model.js";
import { getIO } from "../config/socket.js";

/**
 * Create a notification and push it in real-time via Socket.IO.
 * Does nothing if sender === recipient (don't notify yourself).
 */
export async function createNotification({ recipient, sender, type, post = null, reel = null, contract = null, message = "" }) {
  // Don't notify yourself
  if (recipient.toString() === sender.toString()) return null;

  const notification = await Notification.create({ recipient, sender, type, post, reel, contract, message });

  // Populate sender info for the real-time payload
  await notification.populate("sender", "name profilePhoto");
  if (post) await notification.populate("post", "content imageUrl");
  if (reel) await notification.populate("reel", "description thumbnailUrl");
  if (contract) await notification.populate("contract", "title status");

  // Emit to the recipient's personal room
  try {
    const io = getIO();
    io.to(`user:${recipient}`).emit("notification", notification);
  } catch (_) {
    // Socket.io may not be initialized during seeding/testing — ignore
  }

  return notification;
}
