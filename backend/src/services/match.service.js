import User from "../models/User.model.js";
<<<<<<< HEAD
import { calculateMatchScore, calculateDistance } from "galink-shared";

export async function findMatches({ requiredSkills, urgencyLevel, locationRelevant, userLocation, userCoords, limit = 8 }) {
  if (!requiredSkills || requiredSkills.length === 0) return [];
  try {
    const query = { isFreelancer: true, isActive: true };
    if (locationRelevant && userLocation && !userCoords) {
      // Fallback: string-based city filter when no GPS available
=======
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
>>>>>>> eab07a9708354b3068450ba6a6cd1bce8b9e3301
      const city = userLocation.split(",")[0].trim();
      query.$or = [
        { location: new RegExp(city, "i") },
        { serviceAreas: { $regex: new RegExp(city, "i") } },
        { location: "" },
      ];
    }
<<<<<<< HEAD
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
=======

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
>>>>>>> eab07a9708354b3068450ba6a6cd1bce8b9e3301
    });

    return scored.slice(0, limit);
  } catch (error) {
    console.error("Match service error:", error);
    return [];
  }
}
