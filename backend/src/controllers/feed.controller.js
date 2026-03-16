import Post from "../models/Post.model.js";
import { createNotification } from "../services/notification.service.js";
export async function getPost(req, res, next) {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "name profilePhoto isFreelancer location")
      .populate("comments.author", "name profilePhoto")
      .populate("comments.replies.author", "name profilePhoto");
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (error) { next(error); }
}
export async function getFeed(req, res, next) {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const posts = await Post.find({ isPublic: true }).populate("author", "name profilePhoto isFreelancer location").populate("comments.author", "name profilePhoto").populate("comments.replies.author", "name profilePhoto").sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
    const total = await Post.countDocuments({ isPublic: true });
    res.json({ posts, pagination: { page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), total } });
  } catch (error) { next(error); }
}
export async function createPost(req, res, next) {
  try {
    const { content, tags } = req.body;
    if (!content) return res.status(400).json({ message: "Content is required" });
    const post = await Post.create({ author: req.user._id, content, tags: tags ? tags.split(",").map((t) => t.trim()) : [], imageUrl: req.file?.path || "" });
    await post.populate("author", "name profilePhoto isFreelancer location");
    res.status(201).json(post);
  } catch (error) { next(error); }
}
export async function likePost(req, res, next) {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    const idx = post.likes.indexOf(req.user._id);
    idx === -1 ? post.likes.push(req.user._id) : post.likes.splice(idx, 1);
    await post.save();
    // Notify post author on like (not unlike)
    if (idx === -1) {
      createNotification({ recipient: post.author, sender: req.user._id, type: "like_post", post: post._id, message: "liked your post" });
    }
    res.json({ likes: post.likes.length, liked: idx === -1 });
  } catch (error) { next(error); }
}
export async function commentPost(req, res, next) {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: "Comment content required" });
    const post = await Post.findByIdAndUpdate(req.params.id, { $push: { comments: { author: req.user._id, content } } }, { new: true }).populate("author", "name profilePhoto").populate("comments.author", "name profilePhoto").populate("comments.replies.author", "name profilePhoto");
    // Notify post author on comment
    if (post) {
      createNotification({ recipient: post.author._id || post.author, sender: req.user._id, type: "comment_post", post: post._id, message: "commented on your post" });
    }
    res.json(post);
  } catch (error) { next(error); }
}
export async function replyToComment(req, res, next) {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: "Reply content required" });
    const post = await Post.findOneAndUpdate(
      { _id: req.params.id, "comments._id": req.params.commentId },
      { $push: { "comments.$.replies": { author: req.user._id, content } } },
      { new: true }
    )
      .populate("author", "name profilePhoto")
      .populate("comments.author", "name profilePhoto")
      .populate("comments.replies.author", "name profilePhoto");
    if (!post) return res.status(404).json({ message: "Post or comment not found" });
    res.json(post);
  } catch (error) { next(error); }
}
export async function deletePost(req, res, next) {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.author.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Not authorized" });
    await post.deleteOne();
    res.json({ message: "Post deleted" });
  } catch (error) { next(error); }
}
