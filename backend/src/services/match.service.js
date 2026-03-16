import User from "../models/User.model.js";
import { calculateMatchScore } from "galink-shared";
export async function findMatches({ requiredSkills, urgencyLevel, locationRelevant, userLocation, limit = 8 }) {
  if (!requiredSkills || requiredSkills.length === 0) return [];
  try {
    const query = { isFreelancer: true, isActive: true };
    if (locationRelevant && userLocation) {
      const city = userLocation.split(",")[0].trim();
      query.$or = [{ location: new RegExp(city, "i") }, { location: "" }];
    }
    const freelancers = await User.find(query).select("name email profilePhoto bio skills location hourlyRate averageRating totalRatings resumeUrl").lean();
    const scored = freelancers.map((f) => ({
      ...f,
      matchScore: calculateMatchScore(requiredSkills, f.skills),
    })).filter((f) => f.matchScore >= 60).sort((a, b) => b.matchScore - a.matchScore || b.averageRating - a.averageRating);
    return scored.slice(0, limit);
  } catch (error) {
    console.error("Match service error:", error);
    return [];
  }
}
