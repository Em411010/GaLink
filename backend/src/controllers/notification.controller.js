import Notification from "../models/Notification.model.js";

export async function getNotifications(req, res, next) {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate("sender", "name profilePhoto")
      .populate("post", "content imageUrl")
      .populate("reel", "description thumbnailUrl")
      .sort({ createdAt: -1 })
      .limit(50);
    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
    res.json({ notifications, unreadCount });
  } catch (error) { next(error); }
}

export async function markAsRead(req, res, next) {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
    res.json({ message: "All notifications marked as read" });
  } catch (error) { next(error); }
}

export async function markOneAsRead(req, res, next) {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true }
    );
    res.json({ message: "Notification marked as read" });
  } catch (error) { next(error); }
}
