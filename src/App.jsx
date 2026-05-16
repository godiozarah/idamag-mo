import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Chatbot from "./pages/Chatbot";
import AdminDashboard from "./pages/AdminDashboard";
import Reports from "./pages/Reports";
import AdminReports from "./pages/AdminReports";
import CommunityFeed from "./pages/CommunityFeed";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import FloatingChatbot from "./components/FloatingChatbot";


function App() {
  return (
    <div>

      <Navbar />

      <FloatingChatbot />

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
            <ProtectedRoute>
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            </ProtectedRoute>
          }
        />

        {/* ADMIN REPORTS */}
        <Route
          path="/admin-reports"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <AdminReports />
              </AdminRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/community"
          element={<CommunityFeed />}
        />
        

      </Routes>

    </div>
  );
}

export default App;