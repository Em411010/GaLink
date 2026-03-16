import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

// Auth
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  getMe: () => api.get("/auth/me"),
};

// Users
export const userAPI = {
  getProfile: (id) => api.get(`/users/${id}`),
  updateProfile: (data) => api.put("/users/profile", data),
  uploadResume: (formData) => api.post("/users/resume", formData),
  getFreelancers: (params) => api.get("/users/freelancers", { params }),
  searchUsers: (q, page = 1) => api.get("/users/freelancers", { params: { q, page } }),
  toggleAvailability: () => api.put("/users/availability/toggle"),
  getSidebarData: () => api.get("/users/sidebar/data"),
  getSuggestedUsers: () => api.get("/users/sidebar/suggestions"),
  getSeminars: () => api.get("/users/sidebar/seminars"),
};

// Feed
export const feedAPI = {
  getFeed: (params) => api.get("/feed", { params }),
  getPost: (id) => api.get(`/feed/${id}`),
  createPost: (data) => api.post("/feed", data),
  likePost: (id) => api.post(`/feed/${id}/like`),
  commentOnPost: (id, data) => api.post(`/feed/${id}/comment`, data),
  replyToComment: (postId, commentId, data) => api.post(`/feed/${postId}/comment/${commentId}/reply`, data),
  deletePost: (id) => api.delete(`/feed/${id}`),
};

// Chatbot
export const chatbotAPI = {
  interpret: (message, dialect = null) => api.post("/chatbot/interpret", { message, dialect }),
  chat: (messages, dialect = null) => api.post("/chatbot/chat", { messages, dialect }),
};

// Messages
export const messageAPI = {
  getConversations: () => api.get("/messages/conversations"),
  createConversation: (userId) => api.post("/messages/conversations", { userId }),
  getMessages: (conversationId) => api.get(`/messages/conversations/${conversationId}`),
  sendMessage: (conversationId, data) => api.post(`/messages/conversations/${conversationId}`, data),
  sendAttachment: (conversationId, formData) =>
    api.post(`/messages/conversations/${conversationId}`, formData, { headers: { "Content-Type": "multipart/form-data" } }),
  markAsRead: (conversationId) => api.put(`/messages/conversations/${conversationId}/read`),
  deleteMessage: (conversationId, msgId) => api.delete(`/messages/conversations/${conversationId}/messages/${msgId}`),
};

// Reels
export const reelAPI = {
  getReels: (params) => api.get("/reels", { params }),
  createReel: (data) => api.post("/reels", data),
  likeReel: (id) => api.post(`/reels/${id}/like`),
  commentOnReel: (id, text) => api.post(`/reels/${id}/comment`, { text }),
  viewReel: (id) => api.post(`/reels/${id}/view`),
};
export const reelsAPI = reelAPI;

// Ratings
export const ratingAPI = {
  createRating: (freelancerId, data) => api.post(`/ratings/${freelancerId}`, data),
  getUserRatings: (userId) => api.get(`/ratings/${userId}`),
};

// Matching
export const matchAPI = {
  getMatches: (data) => api.post("/match", data),
};

// Notifications
export const notificationAPI = {
  getNotifications: () => api.get("/notifications"),
  markAllRead: () => api.put("/notifications/read-all"),
  markOneRead: (id) => api.put(`/notifications/${id}/read`),
};

// Verification / Badge
export const verificationAPI = {
  getStatus: () => api.get("/verification/status"),
  sendEmailOtp: () => api.post("/verification/email/send-otp"),
  verifyEmailOtp: (otp) => api.post("/verification/email/verify", { otp }),
  uploadGovernmentId: (formData) => api.post("/verification/government-id", formData),
  uploadSelfie: (formData) => api.post("/verification/selfie", formData),
  uploadClearance: (formData) => api.post("/verification/clearance", formData),
  addPortfolio: (formData) => api.post("/verification/portfolio", formData),
  removePortfolio: (itemId) => api.delete(`/verification/portfolio/${itemId}`),
};

export default api;
