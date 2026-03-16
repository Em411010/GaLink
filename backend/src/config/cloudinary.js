import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
export const imageUpload = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: { folder: "galink/images", allowed_formats: ["jpg","jpeg","png","webp"], transformation: [{ width: 800, height: 800, crop: "limit" }] },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
});
export const videoUpload = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: { folder: "galink/reels", resource_type: "video", allowed_formats: ["mp4","webm","mov"] },
  }),
  limits: { fileSize: 100 * 1024 * 1024 },
});
export const resumeUpload = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: { folder: "galink/resumes", resource_type: "raw", allowed_formats: ["pdf","doc","docx"] },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
});
export default cloudinary;
