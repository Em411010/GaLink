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
export function calculateMatchScore(requiredSkills, freelancerSkills) {
  if (!requiredSkills?.length || !freelancerSkills?.length) return 0;
  const req = requiredSkills.map((s) => s.toLowerCase());
  const frl = freelancerSkills.map((s) => s.toLowerCase());
  const matches = req.filter((s) => frl.some((f) => f.includes(s) || s.includes(f)));
  return Math.round((matches.length / req.length) * 100);
}
