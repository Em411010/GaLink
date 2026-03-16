/**
 * Middleware to require a minimum badge level for a route.
 * Usage: router.post("/feed", protect, requireBadge(1), createPost);
 */
export function requireBadge(minLevel) {
  return (req, res, next) => {
    const userLevel = req.user?.badgeLevel ?? 0;
    if (userLevel < minLevel) {
      const labels = { 1: "Hirer 🟢", 2: "Freelancer 🔵", 3: "Verified Freelancer ⭐" };
      return res.status(403).json({
        message: `This action requires the ${labels[minLevel] || `Level ${minLevel}`} badge. Complete verification to unlock.`,
        requiredLevel: minLevel,
        currentLevel: userLevel,
      });
    }
    next();
  };
}
