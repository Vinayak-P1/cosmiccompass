import React, { useContext, useEffect } from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import CosmicBackground from "./components/CosmicBackground";
import Home from "./pages/Home";
import Astrologers from "./pages/Astrologers";
import Blogs from "./pages/Blogs";
import Login from "./pages/Login";
import Consultation from "./pages/Consultation";
import SelectLifeArea from "./pages/SelectLifeArea";
import AskQuestion from "./pages/AskQuestion";
import Payment from "./pages/Payment";
import SelectPlan from "./pages/SelectPlan";
import MyBookings from "./pages/MyBookings";
import AboutAstrologer from "./pages/AboutAstrolger";
import BirthDetails from "./pages/BirthDetails";
import { AuthContext } from "./context/AuthContext";

// ✅ Import Admin Pages (correct paths)
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageAstrologers from "./pages/admin/ManageAstrologers";
import ManageCoupons from "./pages/admin/ManageCoupons";
import ManageBookings from "./pages/admin/ManageBookings";
import ManagePricing from "./pages/admin/ManagePricing";
import ManageStats from "./pages/admin/ManageStats";

// ✅ User Protected Route
const ProtectedRoute = ({ children }) => {
  const { user, initialized } = useContext(AuthContext);
  const location = useLocation();

  // Wait until auth initialization completes to avoid redirect flash
  if (!initialized)
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="text-center text-white">Loading…</div>
      </div>
    );

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  }
  return children;
};

// ✅ Admin Protected Route
const AdminRoute = ({ children }) => {
  const { user, initialized } = useContext(AuthContext);
  const location = useLocation();

  if (!initialized)
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="text-center text-white">Loading…</div>
      </div>
    );

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  if (!user.isAdmin) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  const location = useLocation();

  useEffect(() => {
    // Only track page views in production
    if (import.meta.env.PROD && window.gtag) {
      window.gtag("config", "G-NWMNKNCZ0E", {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);

  return (
    <div className="relative min-h-screen bg-[#050816]">
      <CosmicBackground />
      <div className="relative z-10">
        <Navbar />
        <main id="main-content" className="pt-16">
        <Routes>
          {/* 🌐 Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/astrologers" element={<Astrologers />} />
          <Route path="/askai" element={<Blogs />} />
          <Route path="/login" element={<Login />} />
          <Route path="/about-astrologer" element={<AboutAstrologer />} />
          <Route path="/astrologers/:slug" element={<AboutAstrologer />} />

          {/* 🔒 User Protected Routes */}
          <Route
            path="/consultation"
            element={
              <ProtectedRoute>
                <Consultation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/select-plan"
            element={
              <ProtectedRoute>
                <SelectPlan />
              </ProtectedRoute>
            }
          />
          <Route
            path="/select-life-area"
            element={
              <ProtectedRoute>
                <SelectLifeArea />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ask-question"
            element={
              <ProtectedRoute>
                <AskQuestion />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment"
            element={
              <ProtectedRoute>
                <Payment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/birth-details"
            element={
              <ProtectedRoute>
                <BirthDetails />
              </ProtectedRoute>
            }
          />

          {/* 🧠 Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/astrologers"
            element={
              <AdminRoute>
                <ManageAstrologers />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/coupons"
            element={
              <AdminRoute>
                <ManageCoupons />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/pricing"
            element={
              <AdminRoute>
                <ManagePricing />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <AdminRoute>
                <ManageBookings />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/stats"
            element={
              <AdminRoute>
                <ManageStats />
              </AdminRoute>
            }
          />

          {/* 🚫 Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      </div>
    </div>
  );
}

export default App;
