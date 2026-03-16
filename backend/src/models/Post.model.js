import mongoose from "mongoose";
const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true, maxlength: 1000 },
  imageUrl: { type: String, default: "" },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: { type: String, maxlength: 500 },
    createdAt: { type: Date, default: Date.now },
    replies: [{
      author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      content: { type: String, maxlength: 500 },
      createdAt: { type: Date, default: Date.now },
    }],
  }],
  tags: [String],
  isPublic: { type: Boolean, default: true },
}, { timestamps: true });
postSchema.index({ author: 1, createdAt: -1 });
const Post = mongoose.model("Post", postSchema);
export default Post;
