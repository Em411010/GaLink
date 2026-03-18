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
// Broad trade category map — sub-skills/tasks map to their parent trade
const SKILL_CATEGORIES = {
  carpentry:   ["carpentry","carpenter","woodworking","furniture","cabinet","door repair","window repair","joinery","wood carving","framing","trim work"],
  plumbing:    ["plumbing","plumber","pipe fitting","pipe repair","drain","faucet","leak","toilet","water heater","sewage"],
  electrical:  ["electrical","electrician","wiring","circuit","outlet","breaker","lighting","rewiring","electric repair"],
  painting:    ["painting","painter","wall paint","interior paint","exterior paint","house paint","spray paint"],
  roofing:     ["roofing","roofer","roof repair","roof install","waterproofing","gutter"],
  welding:     ["welding","welder","metal fabrication","steel works","metal works"],
  aircon:      ["aircon","air conditioning","hvac","refrigeration","ac repair","aircon cleaning","air conditioner"],
  automotive:  ["automotive","mechanic","auto repair","car repair","engine","transmission","brake","tire","auto electrician"],
  masonry:     ["masonry","mason","bricklaying","concrete","tile","tiling","stonework","plastering","grout"],
  graphic_design:["graphic design","graphic designer","illustration","logo","branding","layout","print design"],
  web_dev:     ["web development","web developer","frontend","backend","full stack","website","web design"],
  photography: ["photography","photographer","photo editing","photoshoot","portrait"],
  videography: ["videography","video editing","videographer","video production","cinematography"],
  tutoring:    ["tutoring","tutor","teaching","math tutor","english tutor","academic","coaching"],
  cooking:     ["cooking","chef","catering","food prep","baking","pastry","food service"],
  cleaning:    ["cleaning","cleaner","housekeeping","deep clean","janitorial","sanitation"],
  pest_control:["pest control","exterminator","fumigation","termite"],
  landscaping: ["landscaping","gardening","gardener","lawn care","tree trimming","landscape"],
  it_support:  ["it support","tech support","computer repair","network","it technician","sysadmin","hardware repair"],
  accounting:  ["accounting","bookkeeping","accountant","financial","tax","auditing"],
  content:     ["content writing","copywriting","blogging","seo writing","article writing"],
  social_media:["social media","social media management","facebook ads","instagram","digital marketing"],
};

function getSkillCategory(skill) {
  const s = skill.toLowerCase();
  for (const [category, synonyms] of Object.entries(SKILL_CATEGORIES)) {
    if (synonyms.some((syn) => s.includes(syn) || syn.includes(s))) return category;
  }
  return null;
}

// Haversine distance formula — returns distance in km (1 decimal place)
export function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function calculateMatchScore(requiredSkills, freelancerSkills, options = {}) {
  if (!requiredSkills?.length || !freelancerSkills?.length) return 0;

  const { badgeLevel = 0, completedJobs = 0, averageRating = 0, budget = 0, hourlyRate = 0 } = options;

  // ── Skill matching (60% of total) ──────────────────────────
  const req = requiredSkills.map((s) => s.toLowerCase().trim());
  const frl = freelancerSkills.map((s) => s.toLowerCase().trim());
  const matches = req.filter((reqSkill) => {
    if (frl.some((f) => f.includes(reqSkill) || reqSkill.includes(f))) return true;
    const reqCat = getSkillCategory(reqSkill);
    return reqCat !== null && frl.some((f) => getSkillCategory(f) === reqCat);
  });
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
