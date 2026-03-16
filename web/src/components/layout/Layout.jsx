import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import PostModal from "../feed/PostModal";
export default function Layout() {
  return (
    <div className="min-h-screen bg-base-100">
      <Navbar />
      <main className="w-full px-4 py-6 pb-20 md:pb-6">
        <Outlet />
      </main>
      <PostModal onPost={() => window.dispatchEvent(new Event("galink:postCreated"))} />
    </div>
  );
}
