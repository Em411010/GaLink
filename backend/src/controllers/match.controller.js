import { findMatches } from "../services/match.service.js";
export async function getMatchesBySkills(req, res, next) {
  try {
    const { skills, location } = req.query;
    const requiredSkills = skills ? skills.split(",").map((s) => s.trim()) : [];
    const matches = await findMatches({ requiredSkills, locationRelevant: !!location, userLocation: location || req.user?.location });
    res.json(matches);
  } catch (error) { next(error); }
}
