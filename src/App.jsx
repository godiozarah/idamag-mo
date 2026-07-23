import {
  Routes,
  Route,
  useLocation
} from "react-router-dom";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Chatbot from "./pages/Chatbot";
import AdminDashboard from "./pages/AdminDashboard";
import Reports from "./pages/Reports";
import AdminReports from "./pages/AdminReports";
import Profile from "./pages/Profile";
import Announcements from "./pages/Announcements";
import AdminAnnouncements from "./pages/AdminAnnouncements";
import AdminSettings from "./pages/AdminSettings";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import FloatingChatbot from "./components/FloatingChatbot";

function App() {
  const location = useLocation();

  const hideNavbar =
    location.pathname === "/login" ||
    location.pathname === "/register";

  return (
    <>
      {!hideNavbar && <Navbar />}
      {!hideNavbar && <FloatingChatbot />}

      <Routes>
        {/* HOME */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
<Route
  path="/admin/settings"
  element={
    <AdminRoute>
      <AdminSettings />
    </AdminRoute>
  }
/>
        {/* LOGIN */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* REGISTER */}
        <Route
          path="/register"
          element={<Register />}
        />

        {/* ANNOUNCEMENTS */}
        <Route
          path="/announcements"
          element={
            <ProtectedRoute>
              <Announcements />
            </ProtectedRoute>
          }
        />

        {/* PROFILE */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* CHATBOT */}
        <Route
          path="/chatbot"
          element={
            <ProtectedRoute>
              <Chatbot />
            </ProtectedRoute>
          }
        />

        {/* REPORTS */}
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />

        {/* ADMIN DASHBOARD */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* ADMIN REPORTS */}
        <Route
          path="/admin-reports"
          element={
            <AdminRoute>
              <AdminReports />
            </AdminRoute>
          }
        />

        {/* ADMIN ANNOUNCEMENTS */}
        <Route
          path="/admin-announcements"
          element={
            <AdminRoute>
              <AdminAnnouncements />
            </AdminRoute>
          }
        />
      </Routes>

      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </>
  );
}

export default App;