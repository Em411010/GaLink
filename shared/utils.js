export function formatCurrency(amount, currency = "PHP") {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency }).format(amount);
}
export function truncateText(text, maxLength = 100) {
  if (!text) return "";
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
}
export function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}
export function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
export function calculateMatchScore(requiredSkills, freelancerSkills, options = {}) {
  if (!requiredSkills?.length || !freelancerSkills?.length) return 0;

  const { badgeLevel = 0, completedJobs = 0, averageRating = 0, budget = 0, hourlyRate = 0 } = options;

  // ── Skill matching (60% of total) ──────────────────────────
  const req = requiredSkills.map((s) => s.toLowerCase().trim());
  const frl = freelancerSkills.map((s) => s.toLowerCase().trim());
  const matches = req.filter((s) => frl.some((f) => f.includes(s) || s.includes(f)));
  const skillScore = (matches.length / req.length) * 60;

  // ── Badge level bonus (15% of total) ───────────────────────
  const badgeScore = badgeLevel >= 3 ? 15 : badgeLevel >= 2 ? 10 : badgeLevel >= 1 ? 5 : 0;

  // ── Track record bonus (15% of total) ──────────────────────
  const ratingBonus = Math.min(averageRating, 5) / 5 * 8;
  const jobBonus = Math.min(completedJobs, 50) / 50 * 7;
  const trackScore = ratingBonus + jobBonus;

  // ── Budget fit (10% of total) ──────────────────────────────
  let budgetScore = 5; // neutral if no budget/rate info
  if (budget > 0 && hourlyRate > 0) {
    if (hourlyRate <= budget) {
      budgetScore = 10; // within budget
    } else if (hourlyRate <= budget * 1.3) {
      budgetScore = 5;  // slightly over
    } else {
      budgetScore = 0;  // too expensive
    }
  }

  const total = Math.round(skillScore + badgeScore + trackScore + budgetScore);
  return Math.min(total, 100);
}
