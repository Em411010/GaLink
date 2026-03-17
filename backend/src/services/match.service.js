import User from "../models/User.model.js";
import { calculateMatchScore } from "galink-shared";

export async function findMatches({ requiredSkills, urgencyLevel, locationRelevant, userLocation, budget = 0, limit = 8 }) {
  if (!requiredSkills || requiredSkills.length === 0) return [];
  try {
    const query = { isFreelancer: true, isActive: true };

    // For urgent jobs, only show workers who are open for work
    if (urgencyLevel === "HIGH") {
      query.isOpenForWork = true;
    }

    // Location-based filtering using serviceAreas or location
    if (locationRelevant && userLocation) {
      const city = userLocation.split(",")[0].trim();
      query.$or = [
        { location: new RegExp(city, "i") },
        { serviceAreas: { $regex: new RegExp(city, "i") } },
        { location: "" },
      ];
    }

    const selectFields = "name email profilePhoto bio skills serviceCategories location hourlyRate rateType averageRating totalRatings resumeUrl badgeLevel completedJobs yearsOfExperience isOpenForWork serviceAreas availableDays";

    const freelancers = await User.find(query).select(selectFields).lean();

    const scored = freelancers.map((f) => ({
      ...f,
      matchScore: calculateMatchScore(requiredSkills, [...(f.skills || []), ...(f.serviceCategories || [])], {
        badgeLevel: f.badgeLevel || 0,
        completedJobs: f.completedJobs || 0,
        averageRating: f.averageRating || 0,
        budget,
        hourlyRate: f.hourlyRate || 0,
      }),
    }))
    .filter((f) => f.matchScore >= 40)
    .sort((a, b) => {
      // For urgent jobs, prioritize available workers
      if (urgencyLevel === "HIGH") {
        if (a.isOpenForWork !== b.isOpenForWork) return a.isOpenForWork ? -1 : 1;
      }
      // Then by score, then by rating
      return b.matchScore - a.matchScore || b.averageRating - a.averageRating;
    });

    return scored.slice(0, limit);
  } catch (error) {
    console.error("Match service error:", error);
    return [];
  }
}
