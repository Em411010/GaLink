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
  getSeminars: (refresh = false) => api.get("/users/sidebar/seminars", { params: refresh ? { refresh: "true" } : {} }),
  updateLocation: (data) => api.put("/users/location", data),
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
  clearConversation: (conversationId) => api.delete(`/messages/conversations/${conversationId}/messages`),
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

// Contracts
export const contractAPI = {
  getUserContracts: (userId) => api.get(`/contracts/user/${userId}`),
  getMyContracts: (params) => api.get("/contracts/me", { params }),
  getById: (id) => api.get(`/contracts/${id}`),
  createContract: (data) => api.post("/contracts", data),
  acceptContract: (id) => api.put(`/contracts/${id}/accept`),
  declineContract: (id) => api.put(`/contracts/${id}/decline`),
  updateStatus: (id, status, extra = {}) => api.put(`/contracts/${id}/status`, { status, ...extra }),
  requestModification: (id, data) => api.post(`/contracts/${id}/modification-request`, data),
  resolveModificationRequest: (id, reqId, action) => api.put(`/contracts/${id}/modification-request/${reqId}`, { action }),
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
  updatePortfolio: (itemId, formData) => api.patch(`/verification/portfolio/${itemId}`, formData),
  removePortfolio: (itemId) => api.delete(`/verification/portfolio/${itemId}`),
};

// Admin
export const adminAPI = {
  getStats: () => api.get("/admin/stats"),
  getUsers: (params) => api.get("/admin/users", { params }),
  getPendingClearances: () => api.get("/admin/pending-clearances"),
  approveClearance: (id) => api.post(`/admin/users/${id}/approve-clearance`),
  rejectClearance: (id, reason) => api.post(`/admin/users/${id}/reject-clearance`, { reason }),
  approveKYC: (id) => api.post(`/admin/users/${id}/approve-kyc`),
  rejectKYC: (id, reason) => api.post(`/admin/users/${id}/reject-kyc`, { reason }),
  approveGovernmentId: (id) => api.post(`/admin/users/${id}/approve-government-id`),
  rejectGovernmentId: (id, reason) => api.post(`/admin/users/${id}/reject-government-id`, { reason }),
  approveSelfie: (id) => api.post(`/admin/users/${id}/approve-selfie`),
  rejectSelfie: (id, reason) => api.post(`/admin/users/${id}/reject-selfie`, { reason }),
  getPendingKYC: (params) => api.get("/admin/pending-kyc", { params }),
  revokeUser: (id, reason) => api.post(`/admin/users/${id}/revoke`, { reason }),
  banUser: (id) => api.post(`/admin/users/${id}/ban`),
  unbanUser: (id) => api.post(`/admin/users/${id}/unban`),
  getPosts: (params) => api.get("/admin/posts", { params }),
  getPost: (id) => api.get(`/admin/posts/${id}`),
  deletePost: (id) => api.delete(`/admin/posts/${id}`),
  deleteComment: (postId, commentId) => api.delete(`/admin/posts/${postId}/comments/${commentId}`),
  getReels: (params) => api.get("/admin/reels", { params }),
  getReel: (id) => api.get(`/admin/reels/${id}`),
  deleteReel: (id) => api.delete(`/admin/reels/${id}`),
};

export default api;
