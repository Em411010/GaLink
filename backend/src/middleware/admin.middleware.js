import { protect } from "./auth.middleware.js";

/** Must be used after protect() — ensures the logged-in user is an admin */
export async function adminOnly(req, res, next) {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}
