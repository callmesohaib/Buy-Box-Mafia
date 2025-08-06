import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PropertySearch from "./pages/property_search";
import ValuationResult from "./pages/valuation_result";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ContractPreparation from "./pages/ContractPreparation";
import DealSubmission from "./pages/DealSubmission";
import MyDeals from "./pages/MyDeals";
import AdminRoutes from "./components/admin/adminRoutes";
import SubadminRoutes from "./components/admin/SubadminRoutes";
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./store/AuthContext";
import './index.css';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function ProtectedRoute({ children, allowedRoles }) {
  const userRole = localStorage.getItem("role");
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/property-search" replace />;
  }
  return children;
}

function AppContent() {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const isAdminPage =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/subadmin");
  
  const isLoggedIn = isAuthenticated;
  const userRole = user?.role;

  console.log("AppContent - Auth state:", {
    isAuthenticated,
    userRole,
    location: location.pathname,
    user: user ? { name: user.name, role: user.role } : null
  });

  if (!isLoggedIn) {
    // Allow unauthenticated access to login, register, forgot-password, and reset-password
    const publicRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];
    if (!publicRoutes.includes(location.pathname)) {
      return <Navigate to="/login" replace />;
    }
    return (
      <main className="flex-1 bg-[#F9FAFB] font-inter min-h-screen">
        <ScrollToTop />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    );
  }

  if (isLoggedIn) {
    if (location.pathname === "/login" || location.pathname === "/register") {
      if (userRole === "admin") return <Navigate to="/admin" replace />;
      if (userRole === "subadmin") return <Navigate to="/subadmin/buyer" replace />;
      return <Navigate to="/property-search" replace />;
    }
    
    if (location.pathname === "/") {
      if (userRole === "admin") return <Navigate to="/admin" replace />;
      if (userRole === "subadmin") return <Navigate to="/subadmin/buyer" replace />;
      return <Navigate to="/property-search" replace />;
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--primary-gray-bg)] font-inter">
      {!isAdminPage && <Navbar />}
      <main className={`flex-1 ${!isAdminPage ? "pt-16" : ""}`}>
        <ScrollToTop />
        <Routes>
          <Route path="/property-search" element={
            <ProtectedRoute allowedRoles={["scout"]}>
              <PropertySearch />
            </ProtectedRoute>
          } />
          <Route path="/valuation/:id" element={
            <ProtectedRoute allowedRoles={["scout"]}>
              <ValuationResult />
            </ProtectedRoute>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/contract/:dealId" element={
            <ProtectedRoute allowedRoles={["scout"]}>
              <ContractPreparation />
            </ProtectedRoute>
          } />
          <Route path="/submit/:id" element={
            <ProtectedRoute allowedRoles={["scout"]}>
              <DealSubmission />
            </ProtectedRoute>
          } />
          <Route path="/deals" element={
            <ProtectedRoute allowedRoles={["scout"]}>
              <MyDeals />
            </ProtectedRoute>
          } />
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminRoutes />
            </ProtectedRoute>
          } />
          <Route path="/subadmin/*" element={
            <ProtectedRoute allowedRoles={["subadmin"]}>
              <SubadminRoutes />
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isAdminPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#333",
            color: "#fff",
          },
        }}
      />
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;