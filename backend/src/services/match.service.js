import User from "../models/User.model.js";
import { calculateMatchScore, calculateDistance } from "galink-shared";

export async function findMatches({ requiredSkills, urgencyLevel, locationRelevant, userLocation, userCoords, limit = 8 }) {
  if (!requiredSkills || requiredSkills.length === 0) return [];
  try {
    const query = { isFreelancer: true, isActive: true };
    if (locationRelevant && userLocation && !userCoords) {
      // Fallback: string-based city filter when no GPS available
      const city = userLocation.split(",")[0].trim();
      query.$or = [{ location: new RegExp(city, "i") }, { location: "" }];
    }
    const freelancers = await User.find(query)
      .select("name email profilePhoto bio skills location coords hourlyRate averageRating totalRatings resumeUrl")
      .lean();

    const scored = freelancers.map((f) => {
      const matchScore = calculateMatchScore(requiredSkills, f.skills);
      let distanceKm;
      if (userCoords && f.coords?.coordinates?.length === 2) {
        const [fLng, fLat] = f.coords.coordinates;
        distanceKm = calculateDistance(userCoords.lat, userCoords.lng, fLat, fLng);
      }
      return { ...f, matchScore, distanceKm };
    })
    .filter((f) => {
      if (f.matchScore < 40) return false;
      // When location is relevant and GPS is available, keep only workers within 50km
      if (locationRelevant && userCoords && f.distanceKm !== undefined) {
        return f.distanceKm <= 50;
      }
      return true;
    })
    .sort((a, b) => {
      // Primary: match score descending
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      // Secondary: distance ascending (nearest first), if available and location relevant
      if (locationRelevant && a.distanceKm !== undefined && b.distanceKm !== undefined) {
        return a.distanceKm - b.distanceKm;
      }
      // Fallback: rating descending
      return b.averageRating - a.averageRating;
    });

    return scored.slice(0, limit);
  } catch (error) {
    console.error("Match service error:", error);
    return [];
  }
}
