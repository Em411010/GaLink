import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { Toaster } from "react-hot-toast";
import useAuthStore from "./store/useAuthStore";
import useThemeStore from "./store/useThemeStore";
import { userAPI } from "./services/api";
import Layout from "./components/layout/Layout";
import AdminLayout from "./components/layout/AdminLayout";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import FeedPage from "./pages/FeedPage";
import DiscoverPage from "./pages/DiscoverPage";
import ChatbotPage from "./pages/ChatbotPage";
import ReelsPage from "./pages/ReelsPage";
import MessagesPage from "./pages/MessagesPage";
import ProfilePage from "./pages/ProfilePage";
import PostDetailPage from "./pages/PostDetailPage";
import VerificationPage from "./pages/VerificationPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminClearances from "./pages/AdminClearances";
import AdminPosts from "./pages/AdminPosts";
import AdminReels from "./pages/AdminReels";
import AdminKYC from "./pages/AdminKYC";
function AdminRoute({ children }) {
  const { user } = useAuthStore();
  return user?.isAdmin ? children : <Navigate to="/feed" replace />;
}
function ProtectedRoute({ children }) {
  const { user } = useAuthStore();
  return user ? children : <Navigate to="/" replace />;
}
function GuestRoute({ children }) {
  const { user } = useAuthStore();
  return !user ? children : <Navigate to="/feed" replace />;
}
export default function App() {
  const { fetchMe, user } = useAuthStore();
  const { theme } = useThemeStore();
  const locationSent = useRef(false);

  useEffect(() => { fetchMe(); }, []);

  // Keep user's GPS location up to date whenever they are logged in
  useEffect(() => {
    if (!user || locationSent.current) return;
    if (!navigator.geolocation) return;
    locationSent.current = true;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        userAPI.updateLocation({ lat: coords.latitude, lng: coords.longitude }).catch(() => {});
      },
      () => { locationSent.current = false; }, // reset so it can retry later
      { timeout: 8000, maximumAge: 300000 }
    );
  }, [user]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/" element={<GuestRoute><LandingPage /></GuestRoute>} />
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/ai-assistant" element={<ChatbotPage />} />
          <Route path="/reels" element={<ReelsPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="/verification" element={<VerificationPage />} />
          <Route path="/post/:id" element={<PostDetailPage />} />
        </Route>
        <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/kyc" element={<AdminKYC />} />
          <Route path="/admin/clearances" element={<AdminClearances />} />
          <Route path="/admin/posts" element={<AdminPosts />} />
          <Route path="/admin/reels" element={<AdminReels />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
