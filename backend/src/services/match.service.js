import User from "../models/User.model.js";
import { calculateMatchScore, calculateDistance } from "galink-shared";
import { estimateDistancesBatch } from "./ai.service.js";

// Check if coordinates are valid (not 0,0 which is our placeholder)
function hasValidCoords(coords) {
  if (!coords?.coordinates?.length) return false;
  const [lng, lat] = coords.coordinates;
  return !(lat === 0 && lng === 0);
}

export async function findMatches({ requiredSkills, urgencyLevel, locationRelevant, userLocation, userCoords, budget = 0, limit = 8, excludeId }) {
  if (!requiredSkills || requiredSkills.length === 0) return [];
  try {
    const query = { isFreelancer: true, isActive: true };
    if (excludeId) query._id = { $ne: excludeId };

    // For urgent jobs, only show workers who are open for work
    if (urgencyLevel === "HIGH") {
      query.isOpenForWork = true;
    }

    // Location-based filtering using serviceAreas or location
    if (locationRelevant && userLocation && !userCoords) {
      const city = userLocation.split(",")[0].trim();
      query.$or = [
        { location: new RegExp(city, "i") },
        { serviceAreas: { $regex: new RegExp(city, "i") } },
        { location: "" },
      ];
    }
    const selectFields = "name email profilePhoto bio skills serviceCategories location coords hourlyRate rateType averageRating totalRatings resumeUrl badgeLevel completedJobs yearsOfExperience isOpenForWork serviceAreas availableDays";

    const freelancers = await User.find(query).select(selectFields).lean();

    const scored = freelancers.map((f) => {
      const matchScore = calculateMatchScore(requiredSkills, [...(f.skills || []), ...(f.serviceCategories || [])], {
        badgeLevel: f.badgeLevel || 0,
        completedJobs: f.completedJobs || 0,
        averageRating: f.averageRating || 0,
        budget,
        hourlyRate: f.hourlyRate || 0,
      });
      let distanceKm;
      // Only use Haversine when BOTH user and freelancer have real coordinates
      const userHasCoords = userCoords && !(userCoords.lat === 0 && userCoords.lng === 0);
      if (userHasCoords && hasValidCoords(f.coords)) {
        const [fLng, fLat] = f.coords.coordinates;
        distanceKm = calculateDistance(userCoords.lat, userCoords.lng, fLat, fLng);
      }
      return { ...f, matchScore, distanceKm };
    })
    .filter((f) => f.matchScore >= 40);

    // GPT distance fallback: for freelancers missing distanceKm, use AI estimation
    const needsGptDistance = scored.filter((f) => f.distanceKm === undefined && f.location);
    if (userLocation && needsGptDistance.length > 0) {
      try {
        const locations = needsGptDistance.map((f) => f.location);
        const distMap = await estimateDistancesBatch(userLocation, locations);
        needsGptDistance.forEach((f, idx) => {
          const est = distMap.get(idx);
          if (est !== undefined) f.distanceKm = est;
        });
      } catch {
        // Silent fail — distances just won't be shown
      }
    }

    scored.sort((a, b) => {
      // For urgent jobs, prioritize available workers
      if (urgencyLevel === "HIGH") {
        if (a.isOpenForWork !== b.isOpenForWork) return a.isOpenForWork ? -1 : 1;
      }
      // Primary: match score descending
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      // Secondary: distance ascending (nearest first)
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
