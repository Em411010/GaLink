export const SKILL_CATEGORIES = {
  CONSTRUCTION: ["Carpentry","Masonry","Electrical","Plumbing","Welding","Painting","Roofing","Tiling","HVAC","Landscaping"],
  TECH: ["Web Development","Mobile Development","UI/UX Design","Data Science","IT Support","Network Administration"],
  CREATIVE: ["Graphic Design","Video Editing","Photography","Content Writing","Social Media Management"],
  SERVICES: ["Cleaning","Cooking","Driving","Security","Caregiving","Teaching","Accounting"],
};

export const ALL_SERVICE_CATEGORIES = Object.entries(SKILL_CATEGORIES).flatMap(([group, cats]) =>
  cats.map((cat) => ({ label: cat, group }))
);

export const RATE_TYPES = ["hourly", "per_project", "negotiable"];

export const AVAILABLE_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const URGENCY_LEVELS = { LOW: "LOW", MEDIUM: "MEDIUM", HIGH: "HIGH" };
export const USER_ROLES = { CLIENT: "client", FREELANCER: "freelancer" };
export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg","image/png","image/webp"];
export const ALLOWED_VIDEO_TYPES = ["video/mp4","video/webm","video/quicktime"];
