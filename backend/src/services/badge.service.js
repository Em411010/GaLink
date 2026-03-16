/**
 * Badge Level Computation
 *
 * Level 0 (Unverified) — default
 * Level 1 (Hirer)      — gov ID verified + selfie KYC + phone verified + email verified
 * Level 2 (Freelancer) — Level 1 + resume + ≥3 skills + hourlyRate > 0 + ≥1 portfolio item
 * Level 3 (Verified)   — Level 2 + NBI/Police clearance + ≥1 rating
 */

export const BADGE_LABELS = {
  0: "Unverified",
  1: "Hirer",
  2: "Freelancer",
  3: "Verified Freelancer",
};

export const BADGE_COLORS = {
  0: "badge-ghost",
  1: "badge-success",
  2: "badge-info",
  3: "badge-warning",
};

export const BADGE_ICONS = {
  0: "",
  1: "🟢",
  2: "🔵",
  3: "⭐",
};

/** Compute what level a user qualifies for based on current data */
export function computeBadgeLevel(user) {
  // ── Level 1 checks ──────────────────────────────────────────────────────
  const hasGovId = user.governmentId?.url && user.governmentId?.verified;
  const hasSelfie = user.selfieUrl && user.selfieVerified;
  const hasPhone = user.phoneVerified;
  const hasEmail = user.emailVerified;

  if (!hasGovId || !hasSelfie || !hasPhone || !hasEmail) return 0;

  // ── Level 2 checks ──────────────────────────────────────────────────────
  const hasResume = !!user.resumeUrl;
  const hasSkills = (user.skills?.length || 0) >= 3;
  const hasRate = (user.hourlyRate || 0) > 0;
  const hasPortfolio = (user.portfolio?.length || 0) >= 1;

  if (!hasResume || !hasSkills || !hasRate || !hasPortfolio) return 1;

  // ── Level 3 checks ──────────────────────────────────────────────────────
  const hasClearance = user.clearance?.url && user.clearance?.verified;
  const hasRating = (user.totalRatings || 0) >= 1;

  if (!hasClearance || !hasRating) return 2;

  return 3;
}

/** Re-compute and persist badge level, also sync role flags */
export async function refreshBadge(user) {
  const newLevel = computeBadgeLevel(user);
  user.badgeLevel = newLevel;
  user.isHirer = newLevel >= 1;       // identity-verified = can hire
  user.isFreelancer = newLevel >= 2;
  user.isVerified = newLevel >= 3;
  await user.save();
  return newLevel;
}

/** Return a checklist of what the user still needs for each level */
export function getBadgeChecklist(user) {
  return {
    level1: {
      label: "Hirer 🟢",
      items: [
        { key: "emailVerified",  label: "Verify email address",     done: !!user.emailVerified },
        { key: "governmentId",   label: "Upload valid PH government ID", done: !!(user.governmentId?.url && user.governmentId?.verified) },
        { key: "selfie",         label: "Complete live selfie (KYC)", done: !!(user.selfieUrl && user.selfieVerified) },
      ],
    },
    level2: {
      label: "Freelancer 🔵",
      items: [
        { key: "resume",    label: "Upload your resume",            done: !!user.resumeUrl },
        { key: "skills",    label: "Add at least 3 skills",         done: (user.skills?.length || 0) >= 3 },
        { key: "hourlyRate",label: "Set your hourly rate",          done: (user.hourlyRate || 0) > 0 },
        { key: "portfolio", label: "Add at least 1 portfolio item", done: (user.portfolio?.length || 0) >= 1 },
      ],
    },
    level3: {
      label: "Verified Freelancer ⭐",
      items: [
        { key: "clearance", label: "Upload NBI or Police Clearance", done: !!(user.clearance?.url && user.clearance?.verified) },
        { key: "rating",    label: "Receive at least 1 job rating",  done: (user.totalRatings || 0) >= 1 },
      ],
    },
  };
}
